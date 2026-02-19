from flask import Blueprint, request, jsonify
from db import get_connection

admin = Blueprint('admin', __name__)


@admin.route('/analytics', methods=['GET'])
def analytics():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS c FROM orders")
    total_orders = cur.fetchone()['c']
    cur.execute("SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM orders")
    revenue = cur.fetchone()['revenue']
    cur.execute("SELECT COUNT(*) AS c FROM users")
    active_users = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) AS c FROM pharmacies WHERE is_approved = 1")
    active_pharmacies = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) AS c FROM pharmacies WHERE is_approved = 0")
    pending_approvals = cur.fetchone()['c']
    conn.close()
    return jsonify(
        {
            'ok': True,
            'total_orders': total_orders,
            'revenue': round(revenue, 2),
            'active_users': active_users,
            'active_pharmacies': active_pharmacies,
            'pending_approvals': pending_approvals,
        }
    )


@admin.route('/approve_seller', methods=['POST'])
def approve_seller():
    data = request.get_json() or {}
    seller_id = data.get('seller_id')
    if not seller_id:
        return jsonify({'ok': False, 'message': 'seller_id is required'}), 400
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE pharmacies SET is_approved = 1 WHERE id = ?", (seller_id,))
    if cur.rowcount == 0:
        conn.close()
        return jsonify({'ok': False, 'message': 'Seller not found'}), 404
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'message': 'Seller approved', 'seller_id': seller_id})


def _resolve_or_create_pharmacy(cur, medical_name, location='Unknown'):
    normalized = (medical_name or '').strip()
    if not normalized:
        return None

    cur.execute("SELECT id, name FROM pharmacies WHERE LOWER(name) = LOWER(?) LIMIT 1", (normalized,))
    row = cur.fetchone()
    if row:
        return {'id': row['id'], 'name': row['name']}

    cur.execute(
        """
        INSERT INTO pharmacies (name, location, lat, lng, is_approved, medicines_count, rating)
        VALUES (?, ?, 28.6139, 77.2090, 1, 0, 4.5)
        """,
        (normalized, location or 'Unknown'),
    )
    pharmacy_id = cur.lastrowid
    return {'id': pharmacy_id, 'name': normalized}


@admin.route('/store_dashboard', methods=['GET'])
def store_dashboard():
    medical_name = (request.args.get('medical_name') or '').strip()
    location = (request.args.get('location') or '').strip() or 'Unknown'
    if not medical_name:
        return jsonify({'ok': False, 'message': 'medical_name is required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    pharmacy = _resolve_or_create_pharmacy(cur, medical_name, location)
    if not pharmacy:
        conn.close()
        return jsonify({'ok': False, 'message': 'Unable to resolve pharmacy'}), 400
    pharmacy_id = pharmacy['id']

    cur.execute(
        """
        SELECT COUNT(*) AS c
        FROM orders
        WHERE pharmacy_id = ? AND DATE(created_at) = DATE('now')
        """,
        (pharmacy_id,),
    )
    todays_orders = cur.fetchone()['c']

    cur.execute("SELECT COUNT(*) AS c FROM orders WHERE pharmacy_id = ?", (pharmacy_id,))
    total_orders = cur.fetchone()['c']

    cur.execute("SELECT COALESCE(SUM(total_amount), 0) AS amt FROM orders WHERE pharmacy_id = ?", (pharmacy_id,))
    total_sales = float(cur.fetchone()['amt'] or 0)

    cur.execute(
        """
        SELECT COALESCE(SUM(total_amount), 0) AS amt
        FROM orders
        WHERE pharmacy_id = ? AND DATE(created_at) = DATE('now')
        """,
        (pharmacy_id,),
    )
    sales_today = float(cur.fetchone()['amt'] or 0)

    cur.execute("SELECT COUNT(*) AS c FROM medicines WHERE pharmacy_id = ?", (pharmacy_id,))
    medicines_count = cur.fetchone()['c']

    cur.execute(
        """
        SELECT id, name, strength, unit, price, mrp, offer_text, stock_qty, available
        FROM medicines
        WHERE pharmacy_id = ?
        ORDER BY id DESC
        LIMIT 6
        """,
        (pharmacy_id,),
    )
    recent_rows = cur.fetchall()
    recent_medicines = [
        {
            'id': r['id'],
            'name': r['name'],
            'strength': r['strength'],
            'unit': r['unit'],
            'price': float(r['price'] or 0),
            'mrp': float(r['mrp'] or 0),
            'offer_text': r['offer_text'] or 'Best Price',
            'stock_qty': int(r['stock_qty'] or 0),
            'available': bool(r['available']),
        }
        for r in recent_rows
    ]

    cur.execute(
        "UPDATE pharmacies SET medicines_count = (SELECT COUNT(*) FROM medicines WHERE pharmacy_id = ?) WHERE id = ?",
        (pharmacy_id, pharmacy_id),
    )
    conn.commit()
    conn.close()

    return jsonify(
        {
            'ok': True,
            'pharmacy_id': pharmacy_id,
            'pharmacy_name': pharmacy['name'],
            'todays_orders': todays_orders,
            'total_orders': total_orders,
            'total_sales': round(total_sales, 2),
            'sales_today': round(sales_today, 2),
            'medicines_count': medicines_count,
            'recent_medicines': recent_medicines,
        }
    )


@admin.route('/add_medicine', methods=['POST'])
def add_medicine():
    data = request.get_json() or {}
    medical_name = (data.get('medical_name') or '').strip()
    location = (data.get('location') or '').strip() or 'Unknown'
    name = (data.get('name') or '').strip()
    strength = (data.get('strength') or '').strip()
    unit = (data.get('unit') or 'strip').strip() or 'strip'
    category = (data.get('category') or 'Everyday').strip()
    offer_text = (data.get('offer_text') or '').strip()
    image_url = (data.get('image_url') or '/medicine-placeholder.svg').strip() or '/medicine-placeholder.svg'
    stock_qty = int(data.get('stock_qty') or 10)

    if not medical_name:
        return jsonify({'ok': False, 'message': 'medical_name is required'}), 400
    if not name:
        return jsonify({'ok': False, 'message': 'Medicine name is required'}), 400

    try:
        price = float(data.get('price'))
    except (TypeError, ValueError):
        return jsonify({'ok': False, 'message': 'Valid price is required'}), 400
    if price <= 0:
        return jsonify({'ok': False, 'message': 'Price must be greater than 0'}), 400

    mrp_input = data.get('mrp')
    offer_percent = data.get('offer_percent')
    try:
        mrp = float(mrp_input) if mrp_input is not None and str(mrp_input).strip() != '' else 0.0
    except (TypeError, ValueError):
        mrp = 0.0

    if mrp <= 0 and offer_percent not in (None, ''):
        try:
            offer_percent_num = max(0.0, min(95.0, float(offer_percent)))
            mrp = round(price / (1 - offer_percent_num / 100.0), 2) if offer_percent_num > 0 else round(price * 1.2, 2)
        except (TypeError, ValueError):
            mrp = round(price * 1.2, 2)
    if mrp <= 0:
        mrp = round(price * 1.2, 2)
    if mrp < price:
        mrp = price

    if not offer_text:
        discount = int(round(((mrp - price) * 100.0) / mrp)) if mrp > price else 0
        offer_text = f"{discount}% OFF" if discount > 0 else 'Best Price'

    conn = get_connection()
    cur = conn.cursor()
    pharmacy = _resolve_or_create_pharmacy(cur, medical_name, location)
    if not pharmacy:
        conn.close()
        return jsonify({'ok': False, 'message': 'Unable to resolve pharmacy'}), 400
    pharmacy_id = pharmacy['id']

    cur.execute(
        """
        INSERT INTO medicines (pharmacy_id, category, name, strength, unit, price, mrp, offer_text, image_url, available, stock_qty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """,
        (pharmacy_id, category, name, strength, unit, price, mrp, offer_text, image_url, max(stock_qty, 0)),
    )
    medicine_id = cur.lastrowid

    cur.execute(
        "UPDATE pharmacies SET medicines_count = (SELECT COUNT(*) FROM medicines WHERE pharmacy_id = ?) WHERE id = ?",
        (pharmacy_id, pharmacy_id),
    )

    conn.commit()
    conn.close()

    return jsonify(
        {
            'ok': True,
            'message': 'Medicine added successfully',
            'medicine': {
                'id': medicine_id,
                'pharmacy_id': pharmacy_id,
                'pharmacy_name': pharmacy['name'],
                'name': name,
                'strength': strength,
                'unit': unit,
                'category': category,
                'price': round(price, 2),
                'mrp': round(mrp, 2),
                'offer_text': offer_text,
                'image_url': image_url,
                'stock_qty': max(stock_qty, 0),
                'available': True,
            },
        }
    )
