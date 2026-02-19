import re

from flask import Blueprint, request, jsonify
from db import get_connection
from helpers import generate_otp, send_otp_twilio
from config import Config

auth = Blueprint('auth', __name__)


@auth.route('/twilio-health', methods=['GET'])
def twilio_health():
    missing_fields = []
    if not Config.TWILIO_ACCOUNT_SID:
        missing_fields.append('TWILIO_ACCOUNT_SID')
    if not Config.TWILIO_AUTH_TOKEN:
        missing_fields.append('TWILIO_AUTH_TOKEN')
    if not Config.TWILIO_PHONE_NUMBER:
        missing_fields.append('TWILIO_PHONE_NUMBER')

    response = {
        'ok': False,
        'mock_mode': Config.USE_MOCK_OTP,
        'twilio_configured': len(missing_fields) == 0,
        'missing_fields': missing_fields,
        'credentials_valid': None,
        'message': '',
    }

    if Config.USE_MOCK_OTP:
        response['ok'] = True
        response['message'] = 'Mock OTP mode is enabled. SMS will not be sent to real numbers.'
        return jsonify(response)

    if missing_fields:
        response['message'] = 'Twilio setup incomplete. Please set required env values.'
        return jsonify(response), 400

    try:
        from twilio.rest import Client  # optional dependency
        client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
        account = client.api.accounts(Config.TWILIO_ACCOUNT_SID).fetch()
        response['credentials_valid'] = True
        response['ok'] = True
        response['account_status'] = getattr(account, 'status', 'unknown')
        response['message'] = 'Twilio credentials validated.'
        return jsonify(response)
    except ImportError:
        response['message'] = 'Twilio library not installed. Run: pip install twilio'
        return jsonify(response), 500
    except Exception as err:
        response['credentials_valid'] = False
        response['message'] = f'Twilio validation failed: {err}'
        return jsonify(response), 502


def _is_valid_email(email):
    return bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email))


@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not full_name:
        return jsonify({'ok': False, 'message': 'full_name is required'}), 400
    if not email or not _is_valid_email(email):
        return jsonify({'ok': False, 'message': 'valid email is required'}), 400
    if len(password) < 6:
        return jsonify({'ok': False, 'message': 'password must be at least 6 characters'}), 400

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    existing_user = cur.fetchone()
    if existing_user:
        conn.close()
        return jsonify({'ok': False, 'message': 'Email already registered'}), 409

    cur.execute(
        """
        INSERT INTO users (phone_number, full_name, email, password, is_verified)
        VALUES (?, ?, ?, ?, 1)
        """,
        (f'email:{email}', full_name, email, password),
    )
    user_id = cur.lastrowid

    conn.commit()
    conn.close()

    return jsonify({'ok': True, 'message': 'Signup successful', 'user_id': user_id, 'full_name': full_name, 'email': email})


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not _is_valid_email(email):
        return jsonify({'ok': False, 'message': 'valid email is required'}), 400
    if not password:
        return jsonify({'ok': False, 'message': 'password is required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, full_name, email, password FROM users WHERE email = ?",
        (email,),
    )
    user = cur.fetchone()
    conn.close()

    if not user or user['password'] != password:
        return jsonify({'ok': False, 'message': 'Invalid email or password'}), 401

    return jsonify(
        {
            'ok': True,
            'message': 'Login successful',
            'user_id': user['id'],
            'full_name': user['full_name'],
            'email': user['email'],
        }
    )


@auth.route('/verify-otp', methods=['POST'])
def verify_otp():
    return jsonify({'ok': False, 'message': 'OTP login removed. Use email/password login.'}), 410


@auth.route('/login-phone', methods=['POST'])
def login_phone_legacy():
    data = request.get_json() or {}
    phone = (data.get('phone_number') or '').strip()
    if not phone:
        return jsonify({'ok': False, 'message': 'phone_number is required'}), 400

    otp = generate_otp()
    otp_sent = send_otp_twilio(phone, otp)
    if not otp_sent:
        return jsonify({'ok': False, 'message': 'Failed to send OTP'}), 500

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE phone_number = ?", (phone,))
    user = cur.fetchone()
    if user:
        cur.execute("UPDATE users SET otp_code = ? WHERE id = ?", (otp, user['id']))
    else:
        cur.execute(
            "INSERT INTO users (phone_number, otp_code, is_verified) VALUES (?, ?, 0)",
            (phone, otp),
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'message': 'OTP sent', 'phone_number': phone})
