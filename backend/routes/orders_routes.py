from flask import Blueprint, request, jsonify
import uuid
from db import get_connection
from config import Config
from helpers import create_stripe_payment_intent, retrieve_stripe_payment_intent, calculate_distance

orders = Blueprint('orders', __name__)


def get_quantity_discount_percent(quantity):
    # Higher quantity => better unit price.
    if quantity >= 10:
        return 15
    if quantity >= 5:
        return 10
    if quantity >= 3:
        return 5
    return 0


def get_discounted_unit_price(base_price, quantity):
    discount_percent = get_quantity_discount_percent(quantity)
    discounted = float(base_price) * (1 - discount_percent / 100.0)
    return round(discounted, 2), discount_percent


@orders.route('/create', methods=['POST'])
def create_order():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    pharmacy_id = data.get('pharmacy_id')
    items = data.get('items', [])
    is_express = bool(data.get('is_express', False))
    delivery_address = (data.get('delivery_address') or '').strip()
    customer_phone = (data.get('customer_phone') or '').strip()
    customer_lat = data.get('customer_lat')
    customer_lng = data.get('customer_lng')

    if not pharmacy_id or not items:
        return jsonify({'ok': False, 'message': 'pharmacy_id and items are required'}), 400
    if not delivery_address:
        return jsonify({'ok': False, 'message': 'delivery_address is required'}), 400
    if not customer_phone:
        return jsonify({'ok': False, 'message': 'customer_phone is required'}), 400
    has_customer_location = customer_lat is not None and customer_lng is not None
    if has_customer_location:
        try:
            customer_lat = float(customer_lat)
            customer_lng = float(customer_lng)
        except (TypeError, ValueError):
            return jsonify({'ok': False, 'message': 'Invalid customer location coordinates'}), 400
    else:
        customer_lat = None
        customer_lng = None

    order_number = f"ORD-{str(uuid.uuid4())[:8].upper()}"
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, lat, lng FROM pharmacies WHERE id = ?", (pharmacy_id,))
    pharmacy = cur.fetchone()
    if not pharmacy:
        conn.close()
        return jsonify({'ok': False, 'message': 'Pharmacy not found'}), 404

    subtotal = 0.0
    total_discount = 0.0
    item_rows = []
    for item in items:
        medicine_id = item.get('medicine_id')
        quantity = int(item.get('quantity', 0))
        if not medicine_id or quantity <= 0:
            conn.close()
            return jsonify({'ok': False, 'message': 'Each item requires medicine_id and positive quantity'}), 400

        cur.execute("SELECT id, price, stock_qty FROM medicines WHERE id = ? AND pharmacy_id = ?", (medicine_id, pharmacy_id))
        med = cur.fetchone()
        if not med:
            conn.close()
            return jsonify({'ok': False, 'message': f'Medicine {medicine_id} not found for pharmacy'}), 404
        if med['stock_qty'] < quantity:
            conn.close()
            return jsonify({'ok': False, 'message': f'Insufficient stock for medicine {medicine_id}'}), 400

        base_price = float(med['price'])
        discounted_unit_price, discount_percent = get_discounted_unit_price(base_price, quantity)
        base_line_total = base_price * quantity
        line_total = discounted_unit_price * quantity
        subtotal += line_total
        total_discount += max(0.0, base_line_total - line_total)
        item_rows.append((medicine_id, quantity, discounted_unit_price, discount_percent))

    distance_km = 0.0
    distance_surcharge = 0.0
    if has_customer_location:
        distance_km = calculate_distance(customer_lat, customer_lng, float(pharmacy['lat']), float(pharmacy['lng']))
        distance_surcharge = 30.0 if distance_km > 2.5 else 0.0

    total = subtotal + distance_surcharge
    if is_express:
        total += 30.0

    cur.execute(
        """
        INSERT INTO orders (
            order_number, user_id, pharmacy_id, status, total_amount, is_express,
            delivery_address, customer_phone, customer_lat, customer_lng, distance_km, distance_surcharge
        )
        VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            order_number,
            user_id,
            pharmacy_id,
            total,
            int(is_express),
            delivery_address,
            customer_phone,
            customer_lat,
            customer_lng,
            distance_km,
            distance_surcharge,
        ),
    )
    order_id = cur.lastrowid

    for medicine_id, quantity, unit_price, _discount_percent in item_rows:
        cur.execute(
            "INSERT INTO order_items (order_id, medicine_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
            (order_id, medicine_id, quantity, unit_price),
        )
        cur.execute("UPDATE medicines SET stock_qty = stock_qty - ? WHERE id = ?", (quantity, medicine_id))

    conn.commit()
    conn.close()
    return jsonify(
        {
            'ok': True,
            'order_number': order_number,
            'order': {
                'id': order_id,
                'order_number': order_number,
                'status': 'pending',
                'total_amount': round(total, 2),
                'subtotal_amount': round(subtotal, 2),
                'quantity_discount_amount': round(total_discount, 2),
                'distance_km': distance_km,
                'distance_surcharge': round(distance_surcharge, 2),
                'is_express': is_express,
            },
        }
    )


@orders.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT o.id, o.order_number, o.user_id, o.pharmacy_id, o.status, o.total_amount, o.is_express, o.created_at,
               o.delivery_address, o.customer_phone, o.customer_lat, o.customer_lng, o.distance_km, o.distance_surcharge,
               p.name AS pharmacy_name, p.lat AS pharmacy_lat, p.lng AS pharmacy_lng
        FROM orders o
        LEFT JOIN pharmacies p ON p.id = o.pharmacy_id
        WHERE o.id = ?
        """,
        (order_id,),
    )
    order = cur.fetchone()
    if not order:
        conn.close()
        return jsonify({'ok': False, 'message': 'Order not found'}), 404

    cur.execute(
        """
        SELECT oi.medicine_id, m.name, oi.quantity, oi.unit_price
        FROM order_items oi
        JOIN medicines m ON m.id = oi.medicine_id
        WHERE oi.order_id = ?
        """,
        (order_id,),
    )
    items = [dict(x) for x in cur.fetchall()]
    conn.close()
    payload = dict(order)
    payload['is_express'] = bool(payload['is_express'])
    payload['items'] = items
    return jsonify({'ok': True, 'order': payload})


@orders.route('/stripe/create-intent', methods=['POST'])
def create_stripe_intent():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    amount = data.get('amount')

    if not Config.STRIPE_API_KEY:
        return jsonify({'ok': False, 'message': 'Stripe is not configured on server'}), 400

    if not order_id and amount is None:
        return jsonify({'ok': False, 'message': 'Provide either order_id or amount'}), 400

    if order_id:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, total_amount FROM orders WHERE id = ?", (order_id,))
        order = cur.fetchone()
        conn.close()
        if not order:
            return jsonify({'ok': False, 'message': 'Order not found'}), 404
        amount = float(order['total_amount'])
        metadata = {'order_id': str(order['id'])}
    else:
        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return jsonify({'ok': False, 'message': 'Invalid amount'}), 400
        metadata = {}

    if amount <= 0:
        return jsonify({'ok': False, 'message': 'Amount must be greater than zero'}), 400

    intent = create_stripe_payment_intent(amount=amount, metadata=metadata)
    if not intent:
        return jsonify({'ok': False, 'message': 'Failed to create Stripe payment intent'}), 500

    return jsonify(
        {
            'ok': True,
            'payment_intent_id': intent['id'],
            'client_secret': intent['client_secret'],
            'amount': amount,
            'currency': intent['currency'],
            'stripe_public_key': Config.STRIPE_PUBLIC_KEY,
        }
    )


@orders.route('/stripe/confirm', methods=['POST'])
def confirm_stripe_payment():
    data = request.get_json() or {}
    payment_intent_id = data.get('payment_intent_id')
    order_id = data.get('order_id')

    if not payment_intent_id:
        return jsonify({'ok': False, 'message': 'payment_intent_id is required'}), 400

    intent = retrieve_stripe_payment_intent(payment_intent_id)
    if not intent:
        return jsonify({'ok': False, 'message': 'Unable to verify payment intent'}), 400

    status = intent.get('status')
    if status != 'succeeded':
        return jsonify({'ok': False, 'message': f'Payment not completed. Current status: {status}'}), 400

    resolved_order_id = order_id or (intent.get('metadata') or {}).get('order_id')
    if resolved_order_id:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE orders SET status = 'paid' WHERE id = ?", (resolved_order_id,))
        conn.commit()
        conn.close()

    return jsonify(
        {
            'ok': True,
            'message': 'Payment verified',
            'payment_intent_id': payment_intent_id,
            'status': status,
            'order_id': resolved_order_id,
        }
    )
