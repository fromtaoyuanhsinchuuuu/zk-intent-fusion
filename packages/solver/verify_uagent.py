#!/usr/bin/env python3
"""
Verification script to ensure uAgent is actually being used instead of fallback
"""
import requests
import time

def test_uagent_directly():
    """Test the uAgent endpoint directly on port 8001"""
    print("\n" + "="*60)
    print("🔍 TEST 1: Direct uAgent Connection (Port 8001)")
    print("="*60)
    
    try:
        response = requests.post(
            "http://localhost:8001/parse",
            json={
                "user_address": "0xTestUser",
                "natural_text": "Supply 500 USDC on Morpho"
            },
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ uAgent is RESPONDING on port 8001")
            print(f"📊 Response: {data}")
            return True
        else:
            print(f"❌ uAgent returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Cannot connect to port 8001")
        print("⚠️  uAgent is NOT running!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_nextjs_api():
    """Test the Next.js API endpoint that uses uAgent with fallback"""
    print("\n" + "="*60)
    print("🔍 TEST 2: Next.js API with uAgent + Fallback (Port 3000)")
    print("="*60)
    
    try:
        response = requests.post(
            "http://localhost:3000/api/parse-intent",
            json={
                "userAddress": "0xTestUser",
                "naturalText": "Supply 500 USDC on Morpho"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            source = data.get("source", "unknown")
            
            if source == "uAgent":
                print("✅ Next.js API is using uAgent")
                print("🎯 This means uAgent is working correctly!")
            elif source == "fallback":
                print("⚠️  Next.js API is using FALLBACK")
                print("❌ This means uAgent is NOT being used!")
            else:
                print(f"⚠️  Unknown source: {source}")
            
            print(f"📊 Full response: {data}")
            return source == "uAgent"
        else:
            print(f"❌ Next.js API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Cannot connect to Next.js on port 3000")
        print("⚠️  Make sure Next.js is running: cd packages/nextjs && yarn dev")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_with_unique_marker():
    """Test with a unique value that helps identify which parser is used"""
    print("\n" + "="*60)
    print("🔍 TEST 3: Unique Marker Test")
    print("="*60)
    print("Testing with amount 12345 - if uAgent works, it should parse this exact amount")
    
    try:
        response = requests.post(
            "http://localhost:8001/parse",
            json={
                "user_address": "0xMarkerTest",
                "natural_text": "Supply 12345 USDC on Morpho"
            },
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            amount = data.get("amount", "0")
            
            if str(amount) == "12345":
                print(f"✅ CONFIRMED: uAgent parsed amount correctly: {amount}")
                print("🎯 uAgent is definitely working!")
                return True
            else:
                print(f"⚠️  Unexpected amount: {amount} (expected 12345)")
                return False
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_uagent_logs():
    """Provide instructions to check uAgent logs"""
    print("\n" + "="*60)
    print("📋 How to Verify uAgent is Processing Requests")
    print("="*60)
    print("""
When uAgent receives a request, it should print:
    📥 Received intent parsing request for user: 0xTestUser
    📤 Returning parsed intent: {...}

If you DON'T see these messages in the uAgent terminal, then:
    ❌ uAgent is NOT processing the request
    ⚠️  The fallback system is being used instead

To verify:
    1. Look at the terminal where you ran: ./start_uagent.sh
    2. Send a test request (run this script)
    3. Check if you see the "📥 Received" message
    """)

def main():
    print("\n" + "="*70)
    print("🚀 uAgent Verification Suite")
    print("="*70)
    print("This will verify that uAgent is actually being used,")
    print("not the fallback rule-based parser.")
    print("="*70)
    
    time.sleep(1)
    
    # Test 1: Direct uAgent connection
    test1_passed = test_uagent_directly()
    time.sleep(1)
    
    # Test 2: Next.js API (if running)
    test2_passed = test_nextjs_api()
    time.sleep(1)
    
    # Test 3: Unique marker
    test3_passed = test_with_unique_marker()
    
    # Show log instructions
    check_uagent_logs()
    
    # Final summary
    print("\n" + "="*70)
    print("📊 VERIFICATION SUMMARY")
    print("="*70)
    
    if test1_passed and test3_passed:
        print("✅ uAgent is WORKING and being used!")
        print("🎯 Status: VERIFIED")
    elif not test1_passed:
        print("❌ uAgent is NOT running on port 8001")
        print("⚠️  Start it with: cd packages/solver && ./start_uagent.sh")
    else:
        print("⚠️  uAgent might be running but not working correctly")
    
    print("="*70)
    
    print("\n💡 Pro Tip:")
    print("Watch the uAgent terminal while running requests.")
    print("You should see '📥 Received intent parsing request' messages.")
    print("If you don't see these, uAgent is NOT being used!\n")

if __name__ == "__main__":
    main()
