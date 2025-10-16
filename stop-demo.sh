#!/bin/bash

# ZK-Intent Fusion - Stop Demo Script
# This script stops all running demo components

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔══════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  ZK-Intent Fusion - Stopping Demo   ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════╝${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Stop Anvil
if [ -f /tmp/anvil.pid ]; then
    ANVIL_PID=$(cat /tmp/anvil.pid)
    if ps -p $ANVIL_PID > /dev/null 2>&1; then
        kill $ANVIL_PID
        print_status "Stopped Anvil (PID: $ANVIL_PID)"
    fi
    rm /tmp/anvil.pid
else
    # Try to kill by port
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        kill -9 $(lsof -ti:8545) 2>/dev/null
        print_status "Stopped Anvil (port 8545)"
    fi
fi

# Stop Backend
if [ -f /tmp/backend.pid ]; then
    BACKEND_PID=$(cat /tmp/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        print_status "Stopped Backend (PID: $BACKEND_PID)"
    fi
    rm /tmp/backend.pid
else
    # Try to kill by port
    if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        kill -9 $(lsof -ti:8787) 2>/dev/null
        print_status "Stopped Backend (port 8787)"
    fi
fi

# Stop Frontend
if [ -f /tmp/frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        print_status "Stopped Frontend (PID: $FRONTEND_PID)"
    fi
    rm /tmp/frontend.pid
else
    # Try to kill by port
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        kill -9 $(lsof -ti:3000) 2>/dev/null
        print_status "Stopped Frontend (port 3000)"
    fi
fi

# Clean up log files
if [ -f /tmp/anvil.log ]; then
    rm /tmp/anvil.log
fi
if [ -f /tmp/backend.log ]; then
    rm /tmp/backend.log
fi
if [ -f /tmp/frontend.log ]; then
    rm /tmp/frontend.log
fi

echo ""
echo -e "${GREEN}✨ All services stopped!${NC}"
echo ""
