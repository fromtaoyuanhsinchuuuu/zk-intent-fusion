#!/bin/bash

# 🎭 ZK-Intent Fusion - Multi-Role Demo Launcher
# This script opens all 7 demo pages in separate browser tabs

echo "🎭 ZK-Intent Fusion - Multi-Role Demo"
echo "======================================"
echo ""
echo "Opening 7 tabs for complete demo experience..."
echo ""

BASE_URL="http://localhost:3000/zk-intent"

# Array of all demo pages
declare -a pages=(
    "$BASE_URL"
    "$BASE_URL/parsing"
    "$BASE_URL/solvers/bob"
    "$BASE_URL/solvers/charlie"
    "$BASE_URL/solvers/eve"
    "$BASE_URL/auction"
    "$BASE_URL/execution"
)

declare -a titles=(
    "👤 User (Alice)"
    "🤖 Parsing Agent"
    "🏆 Solver Bob (Qualified)"
    "🏆 Solver Charlie (Qualified)"
    "⛔ Solver Eve (Not Qualified)"
    "🎯 Auction Dashboard"
    "🚀 Execution Monitor"
)

# Detect OS and browser
OS="$(uname -s)"
case "${OS}" in
    Linux*)     
        if command -v google-chrome &> /dev/null; then
            BROWSER="google-chrome"
        elif command -v firefox &> /dev/null; then
            BROWSER="firefox"
        elif command -v chromium-browser &> /dev/null; then
            BROWSER="chromium-browser"
        else
            BROWSER="xdg-open"
        fi
        ;;
    Darwin*)    
        BROWSER="open"
        ;;
    *)          
        BROWSER="xdg-open"
        ;;
esac

echo "Detected browser command: $BROWSER"
echo ""

# Open each page
for i in "${!pages[@]}"; do
    echo "[$((i+1))/7] Opening: ${titles[$i]}"
    echo "        URL: ${pages[$i]}"
    
    if [ "$BROWSER" == "open" ]; then
        # macOS
        open -a "Google Chrome" "${pages[$i]}" 2>/dev/null || open "${pages[$i]}"
    elif [ "$BROWSER" == "google-chrome" ] || [ "$BROWSER" == "chromium-browser" ]; then
        # Linux with Chrome/Chromium
        $BROWSER "${pages[$i]}" &
    elif [ "$BROWSER" == "firefox" ]; then
        # Linux with Firefox
        if [ $i -eq 0 ]; then
            $BROWSER "${pages[$i]}" &
        else
            $BROWSER --new-tab "${pages[$i]}" &
        fi
    else
        # Fallback
        $BROWSER "${pages[$i]}" &
    fi
    
    sleep 0.5
done

echo ""
echo "✅ All tabs opened!"
echo ""
echo "📋 Demo Flow:"
echo "   1. Tab 1: Submit intent (User Alice)"
echo "   2. Tab 2: Watch parsing (AI Agent)"
echo "   3. Tabs 3-5: See solver perspectives (Bob, Charlie, Eve)"
echo "   4. Tab 6: View auction results"
echo "   5. Tab 1: Authorize execution"
echo "   6. Tab 7: Monitor cross-chain execution"
echo ""
echo "🎯 Key Highlight: Tab 5 (Eve) shows privacy protection!"
echo ""
echo "📖 Full guide: MULTI_ROLE_DEMO_GUIDE.md"
echo ""
