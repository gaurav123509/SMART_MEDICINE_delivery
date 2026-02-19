# 🏥 Smart Medicine Delivery Network - Complete Setup Guide

## Project Overview

**MediHub** is a hyper-local healthcare delivery platform that enables users to order medicines from nearby pharmacies with fast delivery options. The system includes customer app, seller panel, delivery partner tracking, and admin dashboard.

### Key Features
- ✅ 10-line pitch ready (see below)
- ✅ Fast medicine delivery (30-45 min standard, 15-20 min express)
- ✅ 2.5km free delivery radius
- ✅ Verified pharmacy network
- ✅ OTP-based authentication
- ✅ Multiple payment methods (UPI, Card, CoD)
- ✅ Live order tracking
- ✅ Seller & Admin dashboards
- ✅ AI-ready for demand forecasting

---

## 🎯 10-Line Pitch (Hackathon Edition)

1. **Smart Medicine Delivery Network** ek hyper-local healthcare delivery platform hai.
2. Ye app users ko nearby medical stores se medicines order karne ki facility deta hai.
3. System automatically nearest pharmacy ko select karta hai jahan medicine available ho.
4. 2.5 km tak free delivery provide ki jaati hai, uske baad nominal charges lagte hain.
5. Emergency cases ke liye **15–20 minute express delivery** option available hota hai.
6. Local medical stores is platform par seller ke roop me register ho sakte hain.
7. **AI-based system** delivery time, demand forecasting aur pharmacy selection optimize karta hai.
8. Platform medicine availability aur stock management ko digitally track karta hai.
9. Future me wholesale supply aur prescription verification bhi integrate ki ja sakti hai.
10. Ye solution **fast, affordable aur reliable** medicine access ensure karta hai, especially emergency situations me.

---

## 📁 Project Structure

```
smart_medicine_delivery_full/
├── backend/
│   ├── app.py                 # Flask main app
│   ├── config.py              # Config loader (env vars)
│   ├── requirements.txt        # Python dependencies
│   ├── helpers.py             # Utility functions (distance, OTP, payments)
│   └── routes/
│       ├── auth_routes.py
│       ├── pharmacies_routes.py
│       ├── medicines_routes.py
│       ├── orders_routes.py
│       ├── seller_routes.py
│       ├── delivery_routes.py
│       └── admin_routes.py
├── frontend/
│   ├── package.json           # React dependencies
│   ├── vite.config.js         # Vite config
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── index.html             # HTML entry
│   └── src/
│       ├── App.jsx            # Router & main app
│       ├── index.jsx          # React DOM entry
│       ├── index.css          # Global styles
│       ├── components/
│       │   └── common.jsx     # Reusable components
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── SearchPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrderTrackingPage.jsx
│       │   ├── SellerDashboardPage.jsx
│       │   └── AdminDashboardPage.jsx
│       ├── services/
│       │   └── api.js         # API service layer
│       └── utils/
│           └── helpers.js     # Frontend utilities
├── DATABASE_SCHEMA.sql         # Complete DB schema
├── MVP_ROADMAP_7_DAYS.md      # 7-day sprint plan
└── .env.example               # Environment template
```

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Step 1: Backend Setup

```bash
# Navigate to project root
cd smart_medicine_delivery_full

# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Start Flask server (on port 8000)
cd backend
python app.py
```

Server runs at: **http://127.0.0.1:8000**

**Test the backend:**
```bash
curl http://127.0.0.1:8000/
# Expected: {"status":"ok","message":"Backend Running"}

# Test auth login
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999"}'

# Test pharmacy nearby
curl "http://127.0.0.1:8000/pharmacies/nearby?lat=28.5355&lng=77.3910"

# Test medicine search
curl "http://127.0.0.1:8000/medicines/search?q=paracetamol"
```

### Step 2: Frontend Setup

```bash
# In a NEW terminal, navigate to frontend
cd smart_medicine_delivery_full/frontend

# Install Node dependencies
npm install

# Start dev server (on port 3000)
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🔌 API Configuration

### Environment Variables (.env)

Create `.env` file in project root (copy from `.env.example`):

```bash
# Maps API
MAPS_API_KEY=your_google_maps_key_or_leave_blank_for_mock

# OTP Provider (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+911234567890

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Database
DATABASE_URL=sqlite:///dev.db

# Feature Flags (Use mocks for hackathon)
USE_MOCK_OTP=True
USE_MOCK_PAYMENT=False
USE_MOCK_MAPS=False
```

### API Endpoints (Live & Tested)

#### Authentication
```
POST   /auth/login              - Send OTP (mocked)
POST   /auth/signup             - Signup user
POST   /auth/verify-otp         - Verify OTP
```

#### Pharmacies
```
GET    /pharmacies/nearby       - Get nearby pharmacies
GET    /pharmacies/{id}         - Get pharmacy details
```

#### Medicines
```
GET    /medicines/search        - Search medicines
GET    /medicines/{id}          - Get medicine details
```

#### Orders
```
POST   /orders/create           - Create order
GET    /orders/{id}             - Get order status
```

#### Seller
```
POST   /seller/register         - Register pharmacy
GET    /seller/dashboard        - Get seller dashboard
```

#### Delivery
```
POST   /delivery/assign         - Assign delivery partner
PUT    /delivery/{id}/status    - Update delivery status
```

#### Admin
```
GET    /admin/analytics         - Get analytics
POST   /admin/approve_seller    - Approve seller
```

---

## 🎨 Frontend Pages (Ready to Use)

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Marketing homepage |
| Login | `/login` | OTP-based login |
| Home | `/home` | Nearby pharmacies |
| Search | `/search` | Medicine search |
| Cart | `/cart` | Shopping cart + checkout |
| Checkout | `/checkout` | Address & payment |
| Order Tracking | `/orders/:id` | Live tracking |
| Seller Dashboard | `/seller/dashboard` | Seller panel |
| Admin Dashboard | `/admin/dashboard` | Admin analytics |

---

## 💾 Database Setup

### Using SQLite (Development - Default)

```bash
# SQLite is auto-created at backend/dev.db (no setup needed)
# To use the full schema:

sqlite3 backend/dev.db < DATABASE_SCHEMA.sql
```

### Using PostgreSQL (Production)

```bash
# Install PostgreSQL, then:
psql -U postgres -d medicine_delivery < DATABASE_SCHEMA.sql

# Update .env:
# DATABASE_URL=postgresql://user:password@localhost:5432/medicine_delivery
```

### Using MySQL

```bash
# Install MySQL, then:
mysql -u root -p medicine_delivery < DATABASE_SCHEMA.sql

# Update .env:
# DATABASE_URL=mysql://user:password@localhost:3306/medicine_delivery
```

---

## 🧪 Testing API Endpoints

### Using cURL (Quick Test)

```bash
# 1. Login
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999"}'

# 2. Nearby Pharmacies
curl "http://127.0.0.1:8000/pharmacies/nearby?lat=28.5355&lng=77.3910"

# 3. Search Medicine
curl "http://127.0.0.1:8000/medicines/search?q=paracetamol"

# 4. Create Order
curl -X POST http://127.0.0.1:8000/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "pharmacy_id": 1,
    "items": [{"medicine_id": 1, "quantity": 2}],
    "is_express": false
  }'

# 5. Admin Analytics
curl http://127.0.0.1:8000/admin/analytics
```

### Using Postman

1. Open Postman → New → Collection
2. Add requests for each endpoint
3. Save as `MediHub-API.postman_collection.json`

---

## 📊 Helper Functions (Backend)

Located in `backend/helpers.py`:

| Function | Purpose | Returns |
|----------|---------|---------|
| `calculate_distance(lat1, lng1, lat2, lng2)` | Haversine distance calc | Distance in km |
| `calculate_delivery_charge(distance, is_express)` | Pricing logic | Delivery charge (₹) |
| `get_distance_from_maps_api(...)` | Google Maps API integration | Distance from API |
| `generate_otp(length)` | OTP generator | 6-digit OTP string |
| `send_otp_twilio(phone, otp)` | Send OTP via Twilio | Success/Failure |
| `send_otp_msg91(phone, otp)` | Send OTP via Msg91 | Success/Failure |
| `create_razorpay_order(amount, order_id)` | Create payment order | Razorpay order object |
| `verify_razorpay_payment(payment_id, order_id, signature)` | Verify payment | True/False |

---

## 🔐 Security Best Practices

1. **Never commit `.env`** → Add to `.gitignore`
2. **Use HTTPS in production** → Get SSL certificate
3. **Hash passwords** → Use bcrypt or similar
4. **Validate inputs** → Server-side validation mandatory
5. **Rate limit APIs** → Prevent abuse
6. **CORS properly configured** → Only allow trusted origins
7. **Store secrets in env vars** → Never hardcode keys

---

## 🚀 Deployment Options

### Option 1: Heroku (Free Tier - Good for Hackathon)

**Backend:**
```bash
heroku create medihub-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku config:set MAPS_API_KEY=your_key
```

**Frontend:**
```bash
npm run build
# Deploy build/ folder to Vercel or Netlify
```

### Option 2: Railway.app (Recommended)

1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically on push

### Option 3: Docker (Production)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

```bash
docker build -t medihub-backend .
docker run -p 8000:8000 medihub-backend
```

---

## 📱 Frontend Features Implemented

✅ Responsive design (Mobile-first)
✅ Dark mode ready
✅ Tailwind CSS styling
✅ Lucide icons
✅ Form validation
✅ Loading states
✅ Error handling
✅ API integration ready

---

## 🤝 API Rate Limits (Recommended)

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Auth (OTP) | 3 | 1 hour |
| Search | 100 | 1 minute |
| Order Create | 50 | 1 hour |
| Admin | 1000 | 1 minute |

---

## 📝 Git Commands (For Submission)

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: MediHub MVP"
git remote add origin https://github.com/yourusername/medihub.git
git push -u origin main

# For hackathon, create a demo branch
git checkout -b demo/hackathon-submission
git push origin demo/hackathon-submission
```

---

## 🎬 Demo Flow (For Judges)

1. **Landing Page** → Show hero section & features
2. **Login** → Demonstrate OTP flow (mock)
3. **Home** → Show nearby pharmacies
4. **Search** → Find "Paracetamol" medicine
5. **Cart** → Add 2 items, show cart summary
6. **Checkout** → Complete order flow
7. **Order Tracking** → Live tracking UI
8. **Seller Dashboard** → Show orders & earnings
9. **Admin Dashboard** → Analytics & approvals

**Total Demo Time: 5-7 minutes**

---

## 🐛 Troubleshooting

### Port 8000 already in use
```bash
lsof -i :8000
kill -9 <PID>
```

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Node modules not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Python import errors
```bash
pip install -r backend/requirements.txt
source .venv/bin/activate
```

### CORS errors
Check `backend/app.py` → CORS is enabled on all origins (adjust for production)

---

## 📚 Additional Resources

- Flask Docs: https://flask.palletsprojects.com/
- React Docs: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- SQLAlchemy: https://sqlalchemy.org/
- Razorpay API: https://razorpay.com/docs/
- Twilio API: https://www.twilio.com/docs/

---

## 🏆 Success Metrics (For Hackathon)

- ✅ Working MVP (backend + frontend)
- ✅ All major user flows implemented
- ✅ Database schema complete
- ✅ API endpoints functional
- ✅ UI/UX polished
- ✅ Ready for deployment
- ✅ Well-documented code

---

## 📞 Support & Contact

**Project**: Smart Medicine Delivery Network (MediHub)  
**Version**: 1.0.0 (MVP)  
**Status**: Ready for Hackathon Submission  
**Last Updated**: Feb 9, 2026

---

**Happy Hacking! 🚀**
