import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('DEBUG', 'False') == 'True'
    
    # Maps API
    MAPS_API_KEY = os.environ.get('MAPS_API_KEY', '')
    MAPBOX_API_KEY = os.environ.get('MAPBOX_API_KEY', '')
    
    # OTP / SMS
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')
    
    # Payment Gateway
    RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
    RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
    STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
    STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY', '')

    # AI / LLM
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.1-8b-instant')
    
    # Database
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
    
    # Storage
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    AWS_S3_BUCKET = os.environ.get('AWS_S3_BUCKET', '')
    
    # Feature Flags
    USE_MOCK_OTP = os.environ.get('USE_MOCK_OTP', 'True') == 'True'
    USE_MOCK_PAYMENT = os.environ.get('USE_MOCK_PAYMENT', 'False') == 'True'
    USE_MOCK_MAPS = os.environ.get('USE_MOCK_MAPS', 'False') == 'True'
    
    # Delivery Settings
    FREE_DELIVERY_RADIUS_KM = float(os.environ.get('FREE_DELIVERY_RADIUS_KM', '2.5'))
    EXPRESS_DELIVERY_MINUTES = int(os.environ.get('EXPRESS_DELIVERY_MINUTES', '20'))
    EXPRESS_DELIVERY_CHARGE = float(os.environ.get('EXPRESS_DELIVERY_CHARGE', '30'))


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_URL = 'sqlite:///test.db'
    USE_MOCK_OTP = True
    USE_MOCK_PAYMENT = True
    USE_MOCK_MAPS = True
