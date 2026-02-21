from flask import Blueprint, request, jsonify
from db import get_connection

medicines = Blueprint('medicines', __name__)


def build_compound_image_url(name):
    safe = (name or '').strip().lower()
    alias_map = {
        'dolo': 'paracetamol',
        'crocin': 'paracetamol',
        'calpol': 'paracetamol',
        'vitamin c': 'ascorbic acid',
        'vitamin d3': 'cholecalciferol',
        'zincovit': 'zinc sulfate',
        'ors': 'oral rehydration salts',
    }
    query_name = alias_map.get(safe, safe or 'medicine')
    query_name = query_name.replace(' ', '%20')
    return f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{query_name}/PNG?image_size=large"


def serialize_medicine_row(r):
    price = float(r['price'] or 0)
    mrp = float(r['mrp'] or 0)
    if mrp <= 0:
        mrp = round(price * 1.2, 2)
    offer_percent = int(round(((mrp - price) * 100.0) / mrp)) if mrp > 0 and mrp > price else 0
    offer_text = (r['offer_text'] or '').strip() or (f"{offer_percent}% OFF" if offer_percent > 0 else "Best Price")
    image_url = (r['image_url'] or '').strip()
    if not image_url or image_url == '/medicine-placeholder.svg':
        image_url = build_compound_image_url(r['name'])

    return {
        'id': r['id'],
        'category': r['category'] or '',
        'name': r['name'],
        'use_for': r['use_for'] or '',
        'strength': r['strength'],
        'unit': r['unit'],
        'price': price,
        'mrp': mrp,
        'offer_percent': offer_percent,
        'offer_text': offer_text,
        'image_url': image_url,
        'available': bool(r['available'] and r['stock_qty'] > 0),
        'stock_qty': r['stock_qty'],
        'pharmacy_id': r['pharmacy_id'],
        'pharmacy_name': r['pharmacy_name'],
    }


@medicines.route('/search', methods=['GET'])
def search_medicines():
    q = request.args.get('q', '').strip()
    pharmacy_id = request.args.get('pharmacy', type=int)

    base_sql = """
        SELECT m.id, m.category, m.name, m.use_for, m.strength, m.unit, m.price, m.mrp, m.offer_text, m.image_url, m.available, m.stock_qty, m.pharmacy_id, p.name AS pharmacy_name
        FROM medicines m
        JOIN pharmacies p ON p.id = m.pharmacy_id
        WHERE p.is_approved = 1
    """
    sql = base_sql
    params = []
    if q:
        # Flexible search across medicine name + attributes for better match rate.
        sql += " AND (LOWER(m.name) LIKE ? OR LOWER(m.strength) LIKE ? OR LOWER(m.unit) LIKE ? OR LOWER(IFNULL(m.category, '')) LIKE ?)"
        like_q = f"%{q.lower()}%"
        params.extend([like_q, like_q, like_q, like_q])
    if pharmacy_id:
        sql += " AND m.pharmacy_id = ?"
        params.append(pharmacy_id)
    sql += " ORDER BY m.name ASC"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(sql, tuple(params))
    rows = cur.fetchall()
    conn.close()

    results = [serialize_medicine_row(r) for r in rows]

    # Token fallback: query like "dolo 650" should still find "Dolo" / "650mg".
    fallback_used = False
    if q and not results:
        tokens = [t.strip().lower() for t in q.split() if t.strip()]
        if tokens:
            token_sql = base_sql
            token_params = []
            for token in tokens:
                token_sql += " AND (LOWER(m.name) LIKE ? OR LOWER(m.strength) LIKE ? OR LOWER(IFNULL(m.category, '')) LIKE ?)"
                token_like = f"%{token}%"
                token_params.extend([token_like, token_like, token_like])
            if pharmacy_id:
                token_sql += " AND m.pharmacy_id = ?"
                token_params.append(pharmacy_id)
            token_sql += " ORDER BY m.name ASC"

            conn = get_connection()
            cur = conn.cursor()
            cur.execute(token_sql, tuple(token_params))
            token_rows = cur.fetchall()
            conn.close()
            results = [serialize_medicine_row(r) for r in token_rows]
            fallback_used = bool(results)

    # Final fallback: provide popular suggestions instead of empty state.
    if q and not results:
        suggest_sql = base_sql
        suggest_params = []
        if pharmacy_id:
            suggest_sql += " AND m.pharmacy_id = ?"
            suggest_params.append(pharmacy_id)
        suggest_sql += " ORDER BY m.stock_qty DESC, m.name ASC LIMIT 12"

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(suggest_sql, tuple(suggest_params))
        suggest_rows = cur.fetchall()
        conn.close()
        results = [serialize_medicine_row(r) for r in suggest_rows]
        fallback_used = bool(results)

    return jsonify({'ok': True, 'query': q, 'results': results, 'fallback_used': fallback_used})


@medicines.route('/<int:medicine_id>', methods=['GET'])
def get_medicine(medicine_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT m.id, m.category, m.name, m.use_for, m.strength, m.unit, m.price, m.mrp, m.offer_text, m.image_url, m.available, m.stock_qty, m.pharmacy_id, p.name AS pharmacy_name
        FROM medicines m
        JOIN pharmacies p ON p.id = m.pharmacy_id
        WHERE m.id = ?
        """,
        (medicine_id,),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({'ok': False, 'message': 'Medicine not found'}), 404
    return jsonify({'ok': True, 'medicine': serialize_medicine_row(row)})
