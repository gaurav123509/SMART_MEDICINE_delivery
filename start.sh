#!/bin/bash
# Quick Start Script for Smart Medicine Delivery Network

echo "🏥 Smart Medicine Delivery Network - Quick Start"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Backend Setup${NC}"
echo "📦 Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate
pip install -q -r backend/requirements.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo -e "\n${BLUE}Step 2: Starting Backend Server${NC}"
echo "🚀 Starting Flask on http://127.0.0.1:8000..."
cd backend
python app.py > /tmp/flask.log 2>&1 &
FLASK_PID=$!
echo -e "${GREEN}✅ Backend running (PID: $FLASK_PID)${NC}"
cd ..
sleep 3

# Test backend
echo -e "\n${BLUE}Step 3: Testing Backend${NC}"
RESPONSE=$(curl -s http://127.0.0.1:8000/)
if echo "$RESPONSE" | grep -q "Backend Running"; then
    echo -e "${GREEN}✅ Backend is responsive${NC}"
else
    echo -e "${YELLOW}⚠️  Backend test inconclusive, continuing...${NC}"
fi

echo -e "\n${BLUE}Step 4: Frontend Setup${NC}"
echo "📦 Installing Node dependencies..."
cd frontend
npm install -q
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

echo -e "\n${BLUE}Step 5: Starting Frontend${NC}"
echo "🚀 Starting React on http://localhost:3000..."
npm run dev > /tmp/vite.log 2>&1 &
VITE_PID=$!
echo -e "${GREEN}✅ Frontend running (PID: $VITE_PID)${NC}"

echo -e "\n${GREEN}=================================================="
echo "🎉 Smart Medicine Delivery Network is Running!"
echo "=================================================="
echo -e "\n${BLUE}Access Points:${NC}"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔌 Backend API: http://127.0.0.1:8000"
echo "  📚 Docs: http://127.0.0.1:8000/ (JSON response)"

echo -e "\n${BLUE}Test Commands:${NC}"
echo "  Login Test:"
echo '    curl -X POST http://127.0.0.1:8000/auth/login \'
echo "      -H 'Content-Type: application/json' \\"
echo '      -d '"'"'{"phone_number":"+919999999999"}'"'"

echo ""
echo "  Pharmacy Test:"
echo "    curl 'http://127.0.0.1:8000/pharmacies/nearby?lat=28.5355&lng=77.3910'"

echo ""
echo "  Medicine Search:"
echo "    curl 'http://127.0.0.1:8000/medicines/search?q=paracetamol'"

echo -e "\n${BLUE}Keyboard Shortcuts:${NC}"
echo "  Frontend Log: tail -f /tmp/vite.log"
echo "  Backend Log: tail -f /tmp/flask.log"
echo "  Stop: Press Ctrl+C in any terminal"

echo -e "\n${YELLOW}Note: Keep both terminals running for full functionality${NC}"
echo ""
