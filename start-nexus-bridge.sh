#!/bin/bash

echo "🚀 Starting Nexus Bridge Demo"
echo "================================"
echo ""
echo "📍 Opening browser to: http://localhost:3000/nexus-bridge"
echo ""
echo "💡 Make sure to:"
echo "   1. Connect your wallet"
echo "   2. Switch to Arbitrum Sepolia"
echo "   3. Have some ETH for gas fees"
echo ""
echo "🎯 Your test account:"
echo "   Address: 0x947fF365B7099aC8b90e4f1024Fc8A2F6D2f3eD4"
echo "   Balance: 0.05 ETH on Arbitrum Sepolia"
echo ""

# Open browser (works on most Linux systems)
if command -v xdg-open &> /dev/null; then
    sleep 2
    xdg-open "http://localhost:3000/nexus-bridge" &
elif command -v open &> /dev/null; then
    sleep 2
    open "http://localhost:3000/nexus-bridge" &
fi

echo "✨ Nexus Bridge is ready!"
echo ""
echo "Press Ctrl+C to stop the server"
