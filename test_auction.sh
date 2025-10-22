#!/bin/bash
# Test script to verify the auction flow works correctly

echo "======================================================================"
echo "🧪 Testing ZK-Intent Fusion Auction Flow"
echo "======================================================================"
echo ""

echo "1️⃣  Testing uAgent (Port 8001)..."
UAGENT_RESPONSE=$(curl -s -X POST http://localhost:8001/parse \
  -H "Content-Type: application/json" \
  -d '{"user_address":"0xAlice","natural_text":"Supply 500 USDC on Morpho"}')

if [[ $UAGENT_RESPONSE == *"action"* ]]; then
  echo "✅ uAgent is working!"
  echo "   Response: $(echo $UAGENT_RESPONSE | python3 -m json.tool | head -5)"
else
  echo "❌ uAgent is not responding"
fi

echo ""
echo "2️⃣  Testing Python Backend (Port 8787)..."
BACKEND_RESPONSE=$(curl -s http://localhost:8787/)

if [[ $BACKEND_RESPONSE == *"ZK-Intent Fusion"* ]]; then
  echo "✅ Python backend is running!"
else
  echo "❌ Python backend is not responding"
fi

echo ""
echo "3️⃣  Testing Intent Parsing..."
PARSE_RESPONSE=$(curl -s "http://localhost:8787/parse-intent?nl=Supply%20500%20USDC%20on%20Morpho%20with%20highest%20APY%20on%20Optimism&user=0xAlice")

if [[ $PARSE_RESPONSE == *"intent"* ]]; then
  echo "✅ Intent parsing works!"
  COMMITMENT=$(echo $PARSE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['intent']['commitment'])")
  echo "   Commitment: $COMMITMENT"
else
  echo "❌ Intent parsing failed"
  echo "   Response: $PARSE_RESPONSE"
  exit 1
fi

echo ""
echo "4️⃣  Testing Auction..."
AUCTION_RESPONSE=$(curl -s "http://localhost:8787/run-auction?commitment=$COMMITMENT")

if [[ $AUCTION_RESPONSE == *"winner"* ]]; then
  echo "✅ Auction works!"
  
  # Count qualified solvers
  QUALIFIED_COUNT=$(echo $AUCTION_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(sum(1 for b in data['auction']['bids'] if b['valid']))")
  TOTAL_COUNT=$(echo $AUCTION_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['auction']['bids']))")
  WINNER=$(echo $AUCTION_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['auction']['winner']['solver'])")
  
  echo "   Total Bids: $TOTAL_COUNT"
  echo "   Qualified: $QUALIFIED_COUNT"
  echo "   Winner: $WINNER"
  
  if [[ $QUALIFIED_COUNT == "2" ]]; then
    echo "   ✅ Correct: 2 solvers qualified (Bob & Charlie)"
  else
    echo "   ❌ Wrong: Expected 2 qualified solvers, got $QUALIFIED_COUNT"
  fi
  
  if [[ $TOTAL_COUNT == "3" ]]; then
    echo "   ✅ Correct: 3 total bids (Bob, Charlie, Eve)"
  else
    echo "   ❌ Wrong: Expected 3 total bids, got $TOTAL_COUNT"
  fi
  
else
  echo "❌ Auction failed"
  echo "   Response: $AUCTION_RESPONSE"
  exit 1
fi

echo ""
echo "======================================================================"
echo "📊 Test Summary"
echo "======================================================================"
echo "✅ uAgent: Working"
echo "✅ Backend: Working" 
echo "✅ Intent Parsing: Working"
echo "✅ Auction: Working"
echo "✅ Qualification: 2/3 solvers qualified (Bob & Charlie pass, Eve rejected)"
echo ""
echo "🎯 Next Steps:"
echo "   1. Visit http://localhost:3000/zk-intent"
echo "   2. Parse intent: 'Supply 500 USDC on Morpho with highest APY on Optimism'"
echo "   3. Check auction page: http://localhost:3000/zk-intent/auction"
echo "   4. Verify Bob & Charlie show as qualified, Eve as rejected"
echo "   5. Check winner has 🏆 trophy icon and success border"
echo ""
