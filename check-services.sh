#!/bin/bash

# 🔍 ZK-Intent Fusion - System Check Script
# This script verifies all services are running correctly

echo "🔍 ZK-Intent Fusion - System Check"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    echo -n "Checking $name... "
    
    if command -v curl &> /dev/null; then
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Running${NC}"
            return 0
        else
            echo -e "${RED}❌ Not responding${NC}"
            echo "   → Start with: $4"
            return 1
        fi
    else
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ Running${NC}"
            return 0
        else
            echo -e "${RED}❌ Not running${NC}"
            echo "   → Start with: $4"
            return 1
        fi
    fi
}

echo "📡 Service Status:"
echo ""

# Check Anvil (port 8545)
check_service "Anvil (Local Blockchain)" "http://localhost:8545" 8545 "cd packages/foundry && anvil"
ANVIL=$?

echo ""

# Check Backend (port 8787)
check_service "Solver Backend" "http://localhost:8787" 8787 "cd packages/solver && python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload"
BACKEND=$?

echo ""

# Check Frontend (port 3000)
check_service "Frontend" "http://localhost:3000" 3000 "cd packages/nextjs && npm run dev"
FRONTEND=$?

echo ""
echo "=================================="
echo ""

# Overall status
if [ $ANVIL -eq 0 ] && [ $BACKEND -eq 0 ] && [ $FRONTEND -eq 0 ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "🎉 Ready to demo! Run: ./open-demo-tabs.sh"
    exit 0
else
    echo -e "${RED}❌ Some services are not running${NC}"
    echo ""
    echo "📋 Quick Start Guide:"
    echo ""
    
    if [ $ANVIL -ne 0 ]; then
        echo "1️⃣  Start Anvil:"
        echo "   cd packages/foundry && anvil"
        echo ""
    fi
    
    if [ $BACKEND -ne 0 ]; then
        echo "2️⃣  Start Backend:"
        echo "   cd packages/solver && python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload"
        echo ""
    fi
    
    if [ $FRONTEND -ne 0 ]; then
        echo "3️⃣  Start Frontend:"
        echo "   cd packages/nextjs && npm run dev"
        echo ""
    fi
    
    echo "💡 Tip: Open each in a separate terminal window"
    exit 1
fi
