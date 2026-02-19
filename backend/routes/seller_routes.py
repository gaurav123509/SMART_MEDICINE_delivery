from flask import Blueprint, request, jsonify
from db import get_connection

seller = Blueprint('seller', __name__)


@seller.route('/register', methods=['POST'])
def register_seller():
    data = request.get_json() or {}
    name = (data.get('name') or data.get('pharmacy_name') or '').strip()
    location = (data.get('location') or '').strip()
    lat = data.get('lat', 28.6139)
    lng = data.get('lng', 77.2090)
    if not name:
        return jsonify({'ok': False, 'message': 'name is required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO pharmacies (name, location, lat, lng, is_approved, medicines_count, rating)
        VALUES (?, ?, ?, ?, 0, 0, 0)
        """,
        (name, location or 'Unknown', lat, lng),
    )
    seller_id = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'message': 'Seller registered', 'seller_id': seller_id, 'approval_status': 'pending'})


@seller.route('/dashboard', methods=['GET'])
def seller_dashboard():
    pharmacy_id = request.args.get('pharmacy_id', type=int, default=1)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS c FROM orders WHERE pharmacy_id = ? AND status IN ('pending', 'preparing')", (pharmacy_id,))
    new_orders = cur.fetchone()['c']

    cur.execute(
        """
        SELECT COALESCE(SUM(total_amount), 0) AS amt
        FROM orders
        WHERE pharmacy_id = ? AND date(created_at) = date('now')
        """,
        (pharmacy_id,),
    )
    earnings_today = cur.fetchone()['amt']

    cur.execute(
        """
        SELECT COALESCE(SUM(total_amount), 0) AS amt
        FROM orders
        WHERE pharmacy_id = ? AND status = 'delivered'
        """,
        (pharmacy_id,),
    )
    total_earnings = cur.fetchone()['amt']

    cur.execute("SELECT COUNT(*) AS c FROM medicines WHERE pharmacy_id = ?", (pharmacy_id,))
    medicines_count = cur.fetchone()['c']
    conn.close()

    return jsonify(
        {
            'ok': True,
            'pharmacy_id': pharmacy_id,
            'new_orders': new_orders,
            'earnings_today': round(earnings_today, 2),
            'total_earnings': round(total_earnings, 2),
            'medicines': medicines_count,
        }
    )
