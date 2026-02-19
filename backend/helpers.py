"""
Helper functions for Smart Medicine Delivery Network
Includes distance calculation, OTP handling, and external API integrations.
"""

import math
import random
import string
from config import Config
import requests


def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate distance in km between two coordinates using Haversine formula.
    Used locally for quick calculations; can fall back to Google Maps API for accuracy.
    """
    R = 6371  # Earth's radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return round(distance, 2)


def calculate_delivery_charge(distance_km, is_express=False):
    """
    Calculate delivery charge based on distance and delivery type.
    Returns delivery_charge in rupees.
    """
    free_radius = Config.FREE_DELIVERY_RADIUS_KM
    
    if distance_km <= free_radius:
        charge = 0
    else:
        # ₹5 per km after free radius
        extra_distance = distance_km - free_radius
        charge = max(20, extra_distance * 5)
    
    if is_express:
        charge += Config.EXPRESS_DELIVERY_CHARGE
    
    return round(charge, 2)


def get_distance_from_maps_api(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Get distance from Google Maps Distance Matrix API.
    Requires MAPS_API_KEY in config.
    Falls back to Haversine if API key not set or API call fails.
    """
    if not Config.MAPS_API_KEY or Config.USE_MOCK_MAPS:
        # Fallback: use Haversine
        return calculate_distance(origin_lat, origin_lng, dest_lat, dest_lng)
    
    try:
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            'origins': f"{origin_lat},{origin_lng}",
            'destinations': f"{dest_lat},{dest_lng}",
            'key': Config.MAPS_API_KEY,
            'units': 'metric'
        }
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        if data['status'] == 'OK' and data['rows']:
            distance_m = data['rows'][0]['elements'][0]['distance']['value']
            distance_km = distance_m / 1000
            return round(distance_km, 2)
    except Exception as e:
        print(f"Maps API error: {e}, falling back to Haversine")
    
    # Fallback
    return calculate_distance(origin_lat, origin_lng, dest_lat, dest_lng)


def generate_otp(length=6):
    """Generate a random OTP (6 digits by default)."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_twilio(phone_number, otp_code):
    """
    Send OTP via Twilio SMS.
    Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in config.
    Returns True if sent, False otherwise.
    """
    if Config.USE_MOCK_OTP:
        print(f"[MOCK OTP] Sent to {phone_number}: {otp_code}")
        return True
    
    if not all([Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN]):
        print("Twilio credentials not configured, using mock OTP")
        return True
    
    try:
        from twilio.rest import Client
        client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your Smart Medicine Delivery OTP is {otp_code}. Valid for 10 minutes.",
            from_=Config.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        print(f"OTP sent via Twilio: {message.sid}")
        return True
    except Exception as e:
        print(f"Twilio error: {e}")
        return False


def send_otp_msg91(phone_number, otp_code):
    """
    Send OTP via Msg91 (popular in India).
    Requires MSG91_AUTH_KEY in config.
    Returns True if sent, False otherwise.
    """
    if Config.USE_MOCK_OTP:
        print(f"[MOCK OTP] Sent to {phone_number}: {otp_code}")
        return True
    
    # Placeholder for Msg91 integration
    print(f"[MOCK] Msg91 OTP would be sent to {phone_number}: {otp_code}")
    return True


def create_razorpay_order(amount, order_id, customer_phone=None):
    """
    Create a Razorpay payment order.
    Returns order details (order_id, amount, etc.) for frontend to use.
    Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
    """
    if Config.USE_MOCK_PAYMENT:
        return {
            'order_id': f"mock_order_{order_id}",
            'amount': int(amount * 100),  # Razorpay uses paise
            'currency': 'INR'
        }
    
    if not all([Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET]):
        print("Razorpay credentials not configured, using mock payment")
        return {
            'order_id': f"mock_order_{order_id}",
            'amount': int(amount * 100),
            'currency': 'INR'
        }
    
    try:
        import razorpay
        client = razorpay.Client(
            auth=(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET)
        )
        order = client.order.create({
            'amount': int(amount * 100),  # Amount in paise
            'currency': 'INR',
            'receipt': f"order_{order_id}",
            'notes': {'order_id': order_id}
        })
        return order
    except Exception as e:
        print(f"Razorpay error: {e}")
        return None


def verify_razorpay_payment(payment_id, order_id, signature):
    """
    Verify Razorpay payment signature (server-side).
    Returns True if verified, False otherwise.
    """
    if Config.USE_MOCK_PAYMENT:
        return True
    
    if not Config.RAZORPAY_KEY_SECRET:
        return True  # Mock mode
    
    try:
        import razorpay
        client = razorpay.Client(
            auth=(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET)
        )
        return client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
    except Exception as e:
        print(f"Razorpay verification error: {e}")
        return False


def create_stripe_payment_intent(amount, currency='inr', metadata=None):
    """
    Create a Stripe PaymentIntent.
    Amount should be in major unit (e.g. rupees); converted to smallest unit.
    """
    if not Config.STRIPE_API_KEY:
        print("Stripe API key not configured")
        return None

    try:
        import stripe
        stripe.api_key = Config.STRIPE_API_KEY
        intent = stripe.PaymentIntent.create(
            amount=int(round(float(amount) * 100)),
            currency=currency,
            metadata=metadata or {},
            automatic_payment_methods={'enabled': True},
        )
        return intent
    except Exception as e:
        print(f"Stripe error: {e}")
        return None


def retrieve_stripe_payment_intent(payment_intent_id):
    """Fetch Stripe PaymentIntent details for status verification."""
    if not Config.STRIPE_API_KEY:
        return None

    try:
        import stripe
        stripe.api_key = Config.STRIPE_API_KEY
        return stripe.PaymentIntent.retrieve(payment_intent_id)
    except Exception as e:
        print(f"Stripe retrieve error: {e}")
        return None
