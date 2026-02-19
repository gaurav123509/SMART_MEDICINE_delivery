import requests
from flask import Blueprint, jsonify, request

from config import Config
from db import get_connection

support = Blueprint('support', __name__)


def _build_catalog_context(limit=60):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT name, category, price
        FROM medicines
        ORDER BY stock_qty DESC, name ASC
        LIMIT ?
        """,
        (limit,),
    )
    rows = cur.fetchall()
    conn.close()

    lines = []
    for r in rows:
        name = (r['name'] or '').strip()
        category = (r['category'] or 'General').strip()
        price = float(r['price'] or 0)
        lines.append(f"- {name} | category: {category} | price: Rs {price:.2f}")
    return "\n".join(lines)


def _fallback_reply(message):
    q = (message or '').lower()
    if 'track' in q or 'order' in q:
        return 'Order tracking ke liye Orders page open karein. Aap order id se live status dekh sakte hain.'
    if 'fever' in q or 'cold' in q:
        return 'Fever/cold ke liye Paracetamol, Dolo 650, Crocin jaisi options Search me check karein.'
    if 'vitamin' in q or 'immunity' in q:
        return 'Vitamins section me Vitamin C, Vitamin D3, Multivitamin, Zinc products available hain.'
    return 'Main aapki medicine, category aur order tracking related help ke liye available hoon.'


@support.route('/chat', methods=['POST'])
def support_chat():
    data = request.get_json() or {}
    message = (data.get('message') or '').strip()
    history = data.get('history') or []

    if not message:
        return jsonify({'ok': False, 'message': 'message is required'}), 400

    api_key = (Config.GROQ_API_KEY or '').strip()
    if not api_key:
        return jsonify({'ok': True, 'reply': _fallback_reply(message), 'provider': 'fallback', 'used_fallback': True})

    system_prompt = (
        'You are MediHub AI Support for an online medicine marketplace. '
        'Give concise and practical answers in Hinglish. '
        'Use available catalog context for product recommendations and mention category names when useful. '
        'Do not provide medical diagnosis. Suggest consulting a doctor for severe symptoms.'
    )

    catalog_context = _build_catalog_context()

    messages = [
        {'role': 'system', 'content': system_prompt},
        {'role': 'system', 'content': f'Catalog snapshot:\n{catalog_context}'},
    ]

    for msg in history[-8:]:
        role = msg.get('role')
        content = (msg.get('text') or '').strip()
        if role in ('user', 'assistant', 'ai') and content:
            mapped_role = 'assistant' if role in ('assistant', 'ai') else 'user'
            messages.append({'role': mapped_role, 'content': content})

    messages.append({'role': 'user', 'content': message})

    payload = {
        'model': Config.GROQ_MODEL,
        'messages': messages,
        'temperature': 0.4,
        'max_tokens': 350,
    }

    try:
        resp = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=20,
        )
        if resp.status_code >= 400:
            return (
                jsonify(
                    {
                        'ok': True,
                        'reply': _fallback_reply(message),
                        'provider': 'fallback',
                        'used_fallback': True,
                        'error': f'Groq request failed ({resp.status_code})',
                    }
                ),
                200,
            )

        body = resp.json()
        reply = (
            body.get('choices', [{}])[0]
            .get('message', {})
            .get('content', '')
            .strip()
        )
        if not reply:
            reply = _fallback_reply(message)
            return jsonify({'ok': True, 'reply': reply, 'provider': 'fallback', 'used_fallback': True})

        return jsonify({'ok': True, 'reply': reply, 'provider': 'groq', 'used_fallback': False})
    except Exception:
        return jsonify({'ok': True, 'reply': _fallback_reply(message), 'provider': 'fallback', 'used_fallback': True})
