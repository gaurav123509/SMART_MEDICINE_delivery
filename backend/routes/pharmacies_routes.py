from flask import Blueprint, request, jsonify
from db import get_connection
from helpers import calculate_distance

pharmacies = Blueprint('pharmacies', __name__)


@pharmacies.route('/nearby', methods=['GET'])
def nearby_pharmacies():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, location, lat, lng, medicines_count, rating, phone, hours, areas_served
        FROM pharmacies
        WHERE is_approved = 1
        """
    )
    rows = cur.fetchall()
    conn.close()

    pharmacy_list = []
    for row in rows:
        distance = None
        if lat is not None and lng is not None:
            distance = calculate_distance(lat, lng, row['lat'], row['lng'])
        pharmacy_list.append(
            {
                'id': row['id'],
                'name': row['name'],
                'location': row['location'],
                'distance_km': distance,
                'medicines_count': row['medicines_count'],
                'rating': row['rating'],
                'phone': row['phone'] or '',
                'hours': row['hours'] or '',
                'areas_served': row['areas_served'] or '',
            }
        )

    pharmacy_list.sort(key=lambda x: x['distance_km'] if x['distance_km'] is not None else 9999)
    return jsonify({'ok': True, 'location': {'lat': lat, 'lng': lng}, 'pharmacies': pharmacy_list})


@pharmacies.route('/<int:pharmacy_id>', methods=['GET'])
def get_pharmacy(pharmacy_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, location, lat, lng, medicines_count, rating, is_approved, phone, hours, areas_served
        FROM pharmacies
        WHERE id = ?
        """,
        (pharmacy_id,),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({'ok': False, 'message': 'Pharmacy not found'}), 404

    return jsonify({'ok': True, 'pharmacy': dict(row)})
