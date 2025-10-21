#!/usr/bin/env python3
"""
Unit tests for uAgent Intent Parser
Tests the REST API endpoint and parsing logic
"""

import requests
import json
import time
import sys

# Base URL for the uAgent
UAGENT_URL = "http://localhost:8001/parse"

def test_parse_endpoint(test_name: str, user_address: str, natural_text: str, expected_action: str = None):
    """Test a single parsing request"""
    print(f"\n{'='*60}")
    print(f"🧪 Test: {test_name}")
    print(f"{'='*60}")
    print(f"📝 Input: {natural_text}")
    
    payload = {
        "user_address": user_address,
        "natural_text": natural_text
    }
    
    try:
        response = requests.post(UAGENT_URL, json=payload, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: SUCCESS")
            print(f"📊 Response:")
            print(f"   Action: {result.get('action', 'N/A')}")
            print(f"   Amount: {result.get('amount', 'N/A')}")
            print(f"   Token: {result.get('token', 'N/A')}")
            print(f"   Protocol: {result.get('protocol', 'N/A')}")
            print(f"   Chains: {result.get('chains', [])}")
            print(f"   Confidence: {result.get('confidence', 0)}")
            
            # Validate expected action if provided
            if expected_action and result.get('action') != expected_action:
                print(f"⚠️  Warning: Expected action '{expected_action}', got '{result.get('action')}'")
                return False
            
            return True
        else:
            print(f"❌ Status: FAILED (HTTP {response.status_code})")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: uAgent not running on port 8001")
        print(f"   Please start the uAgent first: ./start_uagent.sh")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: uAgent took too long to respond")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def run_all_tests():
    """Run comprehensive test suite"""
    print("\n" + "="*60)
    print("🚀 uAgent Intent Parser - Unit Test Suite")
    print("="*60)
    
    # Wait a moment for the server to be fully ready
    print("\n⏳ Waiting for uAgent to be ready...")
    time.sleep(2)
    
    results = []
    
    # Test 1: Supply USDC on Morpho
    results.append(test_parse_endpoint(
        test_name="Supply Intent - Morpho",
        user_address="0xAlice123",
        natural_text="Supply 500 USDC on Morpho",
        expected_action="supply"
    ))
    
    # Test 2: Borrow USDT on Aave
    results.append(test_parse_endpoint(
        test_name="Borrow Intent - Aave",
        user_address="0xBob456",
        natural_text="Borrow 1000 USDT from Aave",
        expected_action="borrow"
    ))
    
    # Test 3: Withdraw from Compound
    results.append(test_parse_endpoint(
        test_name="Withdraw Intent - Compound",
        user_address="0xCarol789",
        natural_text="Withdraw 250 DAI from Compound",
        expected_action="withdraw"
    ))
    
    # Test 4: Swap tokens
    results.append(test_parse_endpoint(
        test_name="Swap Intent - Uniswap",
        user_address="0xDave000",
        natural_text="Swap 100 USDC to ETH on Uniswap",
        expected_action="swap"
    ))
    
    # Test 5: Complex intent with multiple chains
    results.append(test_parse_endpoint(
        test_name="Multi-chain Supply",
        user_address="0xEve111",
        natural_text="Supply all my stablecoins on Arbitrum and Optimism for highest APY",
        expected_action="supply"
    ))
    
    # Test 6: Deposit intent
    results.append(test_parse_endpoint(
        test_name="Deposit Intent",
        user_address="0xFrank222",
        natural_text="Deposit 2000 USDC",
        expected_action="deposit"
    ))
    
    # Test 7: Large amount
    results.append(test_parse_endpoint(
        test_name="Large Amount Supply",
        user_address="0xGrace333",
        natural_text="Supply 50000 USDC on Morpho protocol",
        expected_action="supply"
    ))
    
    # Test 8: Minimal intent
    results.append(test_parse_endpoint(
        test_name="Minimal Intent",
        user_address="0xHank444",
        natural_text="supply usdc",
        expected_action="supply"
    ))
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
    print("="*60)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
