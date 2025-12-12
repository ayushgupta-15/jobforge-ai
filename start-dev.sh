#!/bin/bash
# JobForge AI - Complete Development Environment Startup Script

set -e

PROJECT_ROOT="/home/ash/Programming/jobforge-ai"
BACKEND_DIR="$PROJECT_ROOT/backend-python"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "🚀 Starting JobForge AI Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Start Backend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Starting Backend Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -d "source" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv source
fi

# Activate virtual environment
source source/bin/activate

# Install/upgrade dependencies
echo "📥 Installing backend dependencies..."
pip install -q -r requirements.txt

# Initialize database
echo "🗄️  Initializing database..."
python3 init_db.py

# Start backend server
echo -e "${GREEN}✅ Backend dependencies installed and database initialized${NC}"
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

# Start in background
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Test backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, continuing anyway...${NC}"
fi

# Start Frontend
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 Starting Frontend Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🌐 Starting Next.js development server on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Display final information
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 JobForge AI is now running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}🔌 Backend:${NC} http://localhost:8000"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}📝 Demo Credentials:${NC}"
echo -e "   ${BLUE}Email:${NC} demo@jobforge.ai"
echo -e "   ${BLUE}Password:${NC} Demo@12345"
echo ""
echo -e "${YELLOW}📋 Available Features:${NC}"
echo -e "   ${GREEN}✅${NC} User Authentication (Register/Login)"
echo -e "   ${GREEN}✅${NC} Resume Management (Upload, Analyze, Delete)"
echo -e "   ${GREEN}✅${NC} Application Tracking (CRUD, Status Updates)"
echo -e "   ${GREEN}✅${NC} Job Search & Matching"
echo -e "   ${GREEN}✅${NC} Interview Management & Scheduling"
echo -e "   ${GREEN}✅${NC} Analytics & Insights"
echo -e "   ${GREEN}✅${NC} Dashboard with Real-time Statistics"
echo ""
echo -e "${YELLOW}🛑 To stop the servers:${NC}"
echo "   Kill PIDs: $BACKEND_PID (backend) and $FRONTEND_PID (frontend)"
echo "   Or press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
