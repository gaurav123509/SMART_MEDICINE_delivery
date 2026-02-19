# 7-Day MVP Roadmap - Smart Medicine Delivery Network

Day 0 (Prep)
- Finalize team roles (frontend, backend, devops, design)
- Setup repo, branches, and deployment method (Heroku/Vercel)

Day 1 - Core backend + Auth
- Initialize Flask app and structure (`app.py`, `routes/`, `models/`)
- Implement phone + OTP auth endpoints (mocked OTP OK for hackathon)
- Create DB schema migrations (or provide SQL script)
- Endpoint: `POST /auth/login`, `POST /auth/signup`

Day 2 - Pharmacies & Medicines
- Models: `Pharmacy`, `Medicine`, `PharmacyInventory`
- Endpoints: list pharmacies by proximity, search medicines
- Endpoint: `GET /pharmacies/nearby`, `GET /medicines/search`

Day 3 - Cart & Orders
- Implement cart operations and order creation
- Calculate delivery charges based on distance and settings
- Endpoint: `POST /cart`, `POST /orders`, `GET /orders/:id`

Day 4 - Seller Panel + Inventory
- Seller registration and dashboard endpoints
- Inventory CRUD and stock update webhook
- Endpoint: `POST /seller/register`, `PUT /seller/inventory`

Day 5 - Delivery Assignment + Tracking (Basic)
- Delivery partner model and assignment logic (nearest available)
- Order status updates and basic tracking states
- Endpoint: `POST /assign_delivery`, `PUT /delivery/:id/status`

Day 6 - Payments + Admin
- Integrate mock payment flow (Razorpay sandbox or mocked)
- Admin analytics endpoints and seller approvals
- Endpoint: `GET /admin/analytics`, `POST /admin/approve_seller`

Day 7 - Frontend polish, testing, demo
- Implement core pages in React: landing, login, home, search, cart, checkout
- Prepare demo data, walkthrough script and PPT slides
- Run end-to-end demo and fix bugs

MVP Priorities (Must-have):
- Phone OTP auth, search medicines, create order, seller accept, deliver
- Express delivery option and delivery radius pricing

Stretch (If time):
- Live GPS tracking, AI-based demand forecast endpoint, prescription verification

Deliverables for Hackathon:
- Working demo (web + backend)
- SQL schema + sample seed data
- Postman collection or simple API docs
- PPT with flow, tech stack, and metrics
