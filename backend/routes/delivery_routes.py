from flask import Blueprint, request, jsonify
from db import get_connection

delivery = Blueprint('delivery', __name__)


@delivery.route('/assign', methods=['POST'])
def assign_delivery():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    partner_name = data.get('partner_name', 'Partner')
    partner_phone = data.get('partner_phone', '+91-9999999999')
    if not order_id:
        return jsonify({'ok': False, 'message': 'order_id is required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
    order = cur.fetchone()
    if not order:
        conn.close()
        return jsonify({'ok': False, 'message': 'Order not found'}), 404

    cur.execute(
        """
        INSERT INTO deliveries (order_id, partner_name, partner_phone, status)
        VALUES (?, ?, ?, 'assigned')
        """,
        (order_id, partner_name, partner_phone),
    )
    delivery_id = cur.lastrowid
    cur.execute("UPDATE orders SET status = 'out_for_delivery' WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'message': 'Delivery assigned', 'delivery_id': delivery_id, 'order_id': order_id})


@delivery.route('/<int:delivery_id>/status', methods=['PUT'])
def update_status(delivery_id):
    data = request.get_json() or {}
    status = (data.get('status') or '').strip()
    if not status:
        return jsonify({'ok': False, 'message': 'status is required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT order_id FROM deliveries WHERE id = ?", (delivery_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return jsonify({'ok': False, 'message': 'Delivery not found'}), 404

    cur.execute("UPDATE deliveries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (status, delivery_id))
    if status in ('picked_up', 'out_for_delivery', 'delivered', 'cancelled'):
        cur.execute("UPDATE orders SET status = ? WHERE id = ?", (status, row['order_id']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'delivery_id': delivery_id, 'status': status})
