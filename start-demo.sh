#!/bin/bash

# ZK-Intent Fusion - Automated Demo Startup Script
# This script sets up and runs all components of the demo

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ZK-Intent Fusion - Demo Startup    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    print_status "Node.js $(node --version) found"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.10+ first."
        exit 1
    fi
    print_status "Python $(python3 --version) found"
    
    # Check Foundry
    if ! command -v forge &> /dev/null; then
        print_error "Foundry is not installed. Install from https://getfoundry.sh"
        exit 1
    fi
    print_status "Foundry (forge) found"
    
    echo ""
}

# Kill processes on specific ports
cleanup_ports() {
    print_info "Cleaning up ports..."
    
    # Kill processes on port 8545 (Anvil)
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Killing process on port 8545..."
        kill -9 $(lsof -ti:8545) 2>/dev/null || true
    fi
    
    # Kill processes on port 8787 (Backend)
    if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Killing process on port 8787..."
        kill -9 $(lsof -ti:8787) 2>/dev/null || true
    fi
    
    # Kill processes on port 3000 (Frontend)
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Killing process on port 3000..."
        kill -9 $(lsof -ti:3000) 2>/dev/null || true
    fi
    
    sleep 2
    print_status "Ports cleaned up"
    echo ""
}

# Start Anvil (local blockchain)
start_anvil() {
    print_info "Starting Anvil (local blockchain)..."
    
    cd packages/foundry
    
    # Start Anvil in background
    anvil > /tmp/anvil.log 2>&1 &
    ANVIL_PID=$!
    
    # Wait for Anvil to be ready
    sleep 3
    
    if ps -p $ANVIL_PID > /dev/null; then
        print_status "Anvil started (PID: $ANVIL_PID)"
        echo "$ANVIL_PID" > /tmp/anvil.pid
    else
        print_error "Failed to start Anvil"
        exit 1
    fi
    
    cd ../..
    echo ""
}

# Deploy smart contracts
deploy_contracts() {
    print_info "Deploying smart contracts..."
    
    cd packages/foundry
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || true
    fi
    
    # Deploy contracts
    DEPLOY_OUTPUT=$(forge script script/DeployIntentContracts.s.sol \
        --rpc-url http://localhost:8545 \
        --broadcast \
        --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
        2>&1)
    
    # Extract deployed addresses
    REGISTRY_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "SolverRegistry deployed at:" | awk '{print $NF}')
    VERIFIER_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "IntentVerifier deployed at:" | awk '{print $NF}')
    
    if [ -z "$REGISTRY_ADDRESS" ] || [ -z "$VERIFIER_ADDRESS" ]; then
        print_error "Failed to deploy contracts"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi
    
    print_status "SolverRegistry deployed at: $REGISTRY_ADDRESS"
    print_status "IntentVerifier deployed at: $VERIFIER_ADDRESS"
    
    # Update .env file
    if grep -q "SOLVER_REGISTRY_ADDRESS=" .env; then
        sed -i.bak "s|SOLVER_REGISTRY_ADDRESS=.*|SOLVER_REGISTRY_ADDRESS=$REGISTRY_ADDRESS|" .env
    else
        echo "SOLVER_REGISTRY_ADDRESS=$REGISTRY_ADDRESS" >> .env
    fi
    
    if grep -q "INTENT_VERIFIER_ADDRESS=" .env; then
        sed -i.bak "s|INTENT_VERIFIER_ADDRESS=.*|INTENT_VERIFIER_ADDRESS=$VERIFIER_ADDRESS|" .env
    else
        echo "INTENT_VERIFIER_ADDRESS=$VERIFIER_ADDRESS" >> .env
    fi
    
    cd ../..
    echo ""
    
    # Export for other components
    export SOLVER_REGISTRY_ADDRESS=$REGISTRY_ADDRESS
    export INTENT_VERIFIER_ADDRESS=$VERIFIER_ADDRESS
}

# Setup and start solver backend
start_backend() {
    print_info "Setting up solver backend..."
    
    cd packages/solver
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || true
    fi
    
    # Update .env with deployed addresses
    if [ -n "$SOLVER_REGISTRY_ADDRESS" ]; then
        if grep -q "SOLVER_REGISTRY_ADDRESS=" .env; then
            sed -i.bak "s|SOLVER_REGISTRY_ADDRESS=.*|SOLVER_REGISTRY_ADDRESS=$SOLVER_REGISTRY_ADDRESS|" .env
        else
            echo "SOLVER_REGISTRY_ADDRESS=$SOLVER_REGISTRY_ADDRESS" >> .env
        fi
    fi
    
    if [ -n "$INTENT_VERIFIER_ADDRESS" ]; then
        if grep -q "INTENT_VERIFIER_ADDRESS=" .env; then
            sed -i.bak "s|INTENT_VERIFIER_ADDRESS=.*|INTENT_VERIFIER_ADDRESS=$INTENT_VERIFIER_ADDRESS|" .env
        else
            echo "INTENT_VERIFIER_ADDRESS=$INTENT_VERIFIER_ADDRESS" >> .env
        fi
    fi
    
    # Install dependencies (if not already installed)
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    print_info "Installing Python dependencies..."
    pip install -q fastapi uvicorn pydantic python-dotenv httpx eth-hash web3 > /dev/null 2>&1
    
    print_info "Starting solver backend..."
    python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    sleep 3
    
    if ps -p $BACKEND_PID > /dev/null; then
        print_status "Solver backend started (PID: $BACKEND_PID)"
        echo "$BACKEND_PID" > /tmp/backend.pid
    else
        print_error "Failed to start backend"
        exit 1
    fi
    
    cd ../..
    echo ""
}

# Setup and start frontend
start_frontend() {
    print_info "Setting up frontend..."
    
    cd packages/nextjs
    
    # Create .env.local if it doesn't exist
    if [ ! -f .env.local ]; then
        cp .env.example .env.local 2>/dev/null || true
    fi
    
    # Update .env.local with deployed addresses
    if [ -n "$SOLVER_REGISTRY_ADDRESS" ]; then
        if grep -q "NEXT_PUBLIC_SOLVER_REGISTRY=" .env.local; then
            sed -i.bak "s|NEXT_PUBLIC_SOLVER_REGISTRY=.*|NEXT_PUBLIC_SOLVER_REGISTRY=$SOLVER_REGISTRY_ADDRESS|" .env.local
        else
            echo "NEXT_PUBLIC_SOLVER_REGISTRY=$SOLVER_REGISTRY_ADDRESS" >> .env.local
        fi
    fi
    
    if [ -n "$INTENT_VERIFIER_ADDRESS" ]; then
        if grep -q "NEXT_PUBLIC_INTENT_VERIFIER=" .env.local; then
            sed -i.bak "s|NEXT_PUBLIC_INTENT_VERIFIER=.*|NEXT_PUBLIC_INTENT_VERIFIER=$INTENT_VERIFIER_ADDRESS|" .env.local
        else
            echo "NEXT_PUBLIC_INTENT_VERIFIER=$INTENT_VERIFIER_ADDRESS" >> .env.local
        fi
    fi
    
    # Ensure solver API URL is set
    if ! grep -q "NEXT_PUBLIC_SOLVER_API=" .env.local; then
        echo "NEXT_PUBLIC_SOLVER_API=http://localhost:8787" >> .env.local
    fi
    
    # Install dependencies (if not already installed)
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies (this may take a few minutes)..."
        pnpm install > /dev/null 2>&1 || npm install > /dev/null 2>&1
    fi
    
    print_info "Starting frontend..."
    pnpm dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    sleep 5
    
    if ps -p $FRONTEND_PID > /dev/null; then
        print_status "Frontend started (PID: $FRONTEND_PID)"
        echo "$FRONTEND_PID" > /tmp/frontend.pid
    else
        print_error "Failed to start frontend"
        exit 1
    fi
    
    cd ../..
    echo ""
}

# Print final instructions
print_instructions() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 Demo is Ready!                         ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 Services Running:${NC}"
    echo -e "   • Anvil (Blockchain):     http://localhost:8545"
    echo -e "   • Solver Backend:         http://localhost:8787"
    echo -e "   • Frontend:               http://localhost:3000"
    echo ""
    echo -e "${BLUE}🔑 Deployed Contracts:${NC}"
    echo -e "   • SolverRegistry:  $SOLVER_REGISTRY_ADDRESS"
    echo -e "   • IntentVerifier:  $INTENT_VERIFIER_ADDRESS"
    echo ""
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo -e "   1. Open browser: ${YELLOW}http://localhost:3000/zk-intent${NC}"
    echo -e "   2. Connect wallet with Anvil test account:"
    echo -e "      Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    echo -e "      Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo -e "   3. Enter an intent and watch the auction!"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo -e "   • API Docs:        http://localhost:8787/docs"
    echo -e "   • Startup Guide:   ./STARTUP_GUIDE.md"
    echo ""
    echo -e "${BLUE}🛑 To Stop All Services:${NC}"
    echo -e "   ${YELLOW}./stop-demo.sh${NC}"
    echo ""
    echo -e "${BLUE}📊 View Logs:${NC}"
    echo -e "   • Anvil:    tail -f /tmp/anvil.log"
    echo -e "   • Backend:  tail -f /tmp/backend.log"
    echo -e "   • Frontend: tail -f /tmp/frontend.log"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    cleanup_ports
    start_anvil
    deploy_contracts
    start_backend
    start_frontend
    print_instructions
}

# Run main function
main
