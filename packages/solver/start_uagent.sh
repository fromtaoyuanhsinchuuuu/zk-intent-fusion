#!/bin/bash

# Intent Parser uAgent Startup Script
# This script activates the Python virtual environment and starts the uAgent

cd "$(dirname "$0")"

echo "🚀 Starting Intent Parser uAgent..."
echo "================================================"

# Check if virtual environment exists
if [ ! -d "zk-env" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python -m venv zk-env && source zk-env/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source zk-env/bin/activate

# Check if uagents is installed
if ! python -c "import uagents" 2>/dev/null; then
    echo "❌ uagents package not installed!"
    echo "Installing uagents..."
    pip install "uagents>=0.12.0"
fi

echo ""
echo "✅ Environment ready"
echo "📍 Starting agent on http://localhost:8001"
echo "📝 REST endpoint: POST http://localhost:8001/parse"
echo ""
echo "Press Ctrl+C to stop the agent"
echo "================================================"
echo ""

# Start the agent
python src/agents/uagent_parser.py
