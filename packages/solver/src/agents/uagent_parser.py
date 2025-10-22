#!/usr/bin/env python3
"""
Intent Parser Agent using Fetch.ai uAgents framework
Exposes REST API endpoint for parsing natural language intents
"""

from uagents import Agent, Context, Model
import json
import re
from typing import Optional

# Define request/response models for REST API
class IntentRequest(Model):
    """Request model for intent parsing"""
    user_address: str
    natural_text: str

class IntentResponse(Model):
    """Response model with parsed intent"""
    action: str
    amount: str
    token: str
    protocol: str
    chains: list
    user_address: str
    natural_text: str
    confidence: float

# Initialize the intent parser agent
intent_parser = Agent(
    name="intent_parser",
    seed="intent_parser_recovery_phrase_zk_fusion",
    port=8001,
    endpoint=["http://localhost:8001/submit"],
)

@intent_parser.on_event("startup")
async def startup(ctx: Context):
    """Log agent startup"""
    ctx.logger.info(f"🤖 Intent Parser Agent started!")
    ctx.logger.info(f"📍 Address: {ctx.agent.address}")
    ctx.logger.info(f"🌐 Listening on port 8001")
    ctx.logger.info(f"📝 REST endpoint: POST http://localhost:8001/parse")

def parse_intent_with_rules(text: str) -> dict:
    """
    Rule-based intent parsing with pattern matching
    Returns parsed intent components
    """
    text_lower = text.lower()
    
    # Default values
    result = {
        "action": "supply",
        "amount": "100",
        "token": "USDC",
        "protocol": "morpho",
        "chains": ["optimism"],
        "confidence": 0.5
    }
    
    # Action detection (order matters - check specific actions first)
    if any(word in text_lower for word in ["withdraw", "remove", "unstake"]):
        result["action"] = "withdraw"
        result["confidence"] = 0.8
    elif "deposit" in text_lower:
        result["action"] = "deposit"
        result["confidence"] = 0.8
    elif any(word in text_lower for word in ["supply", "lend", "provide"]):
        result["action"] = "supply"
        result["confidence"] = 0.8
    elif any(word in text_lower for word in ["borrow", "take", "loan"]):
        result["action"] = "borrow"
        result["confidence"] = 0.8
    elif any(word in text_lower for word in ["swap", "exchange", "trade"]):
        result["action"] = "swap"
        result["confidence"] = 0.8
    elif any(word in text_lower for word in ["bridge", "transfer", "move"]):
        result["action"] = "bridge"
        result["confidence"] = 0.8
    
    # Extract amount using regex
    amount_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:USDC|USDT|DAI|ETH|WETH)?', text, re.IGNORECASE)
    if amount_match:
        result["amount"] = amount_match.group(1)
        result["confidence"] = min(result["confidence"] + 0.2, 1.0)
    
    # Token detection
    tokens = {
        "usdc": "USDC",
        "usdt": "USDT", 
        "dai": "DAI",
        "eth": "ETH",
        "weth": "WETH",
        "stablecoin": "USDC"
    }
    for key, value in tokens.items():
        if key in text_lower:
            result["token"] = value
            break
    
    # Protocol detection
    protocols = {
        "morpho": "morpho",
        "aave": "aave",
        "compound": "compound",
        "uniswap": "uniswap",
        "uni": "uniswap"
    }
    for key, value in protocols.items():
        if key in text_lower:
            result["protocol"] = value
            break
    
    # Chain detection
    chains_found = []
    chain_keywords = {
        "arbitrum": "arbitrum",
        "optimism": "optimism",
        "polygon": "polygon",
        "ethereum": "ethereum",
        "base": "base"
    }
    for key, value in chain_keywords.items():
        if key in text_lower:
            chains_found.append(value)
    
    if chains_found:
        result["chains"] = chains_found
        result["confidence"] = min(result["confidence"] + 0.1, 1.0)
    
    return result

@intent_parser.on_rest_post("/parse", IntentRequest, IntentResponse)
async def handle_parse_intent(ctx: Context, req: IntentRequest) -> IntentResponse:
    """
    REST endpoint handler for intent parsing
    POST /parse with JSON body: {user_address, natural_text}
    """
    print("\n" + "="*70)
    print("🤖 uAGENT IS PROCESSING THIS REQUEST!")
    print("="*70)
    ctx.logger.info(f"📥 Received intent parsing request for user: {req.user_address}")
    ctx.logger.info(f"📝 Natural text: {req.natural_text}")
    print(f"👤 User: {req.user_address}")
    print(f"💬 Text: {req.natural_text}")
    
    try:
        # Parse the intent using rule-based system
        parsed = parse_intent_with_rules(req.natural_text)
        
        ctx.logger.info(f"✅ Parsed intent: action={parsed['action']}, "
                       f"amount={parsed['amount']}, token={parsed['token']}, "
                       f"confidence={parsed['confidence']:.2f}")
        
        print(f"✅ Action: {parsed['action']}")
        print(f"💰 Amount: {parsed['amount']} {parsed['token']}")
        print(f"🏦 Protocol: {parsed['protocol']}")
        print(f"📊 Confidence: {parsed['confidence']:.2f}")
        print("="*70 + "\n")
        
        # Create response
        response = IntentResponse(
            action=parsed["action"],
            amount=parsed["amount"],
            token=parsed["token"],
            protocol=parsed["protocol"],
            chains=parsed["chains"],
            user_address=req.user_address,
            natural_text=req.natural_text,
            confidence=parsed["confidence"]
        )
        
        return response
        
    except Exception as e:
        ctx.logger.error(f"❌ Error parsing intent: {str(e)}")
        print(f"❌ ERROR: {str(e)}")
        print("="*70 + "\n")
        # Return default fallback response
        return IntentResponse(
            action="supply",
            amount="100",
            token="USDC",
            protocol="morpho",
            chains=["optimism"],
            user_address=req.user_address,
            natural_text=req.natural_text,
            confidence=0.5
        )

@intent_parser.on_message(model=IntentRequest)
async def handle_intent_message(ctx: Context, sender: str, msg: IntentRequest):
    """
    Alternative message handler for agent-to-agent communication
    """
    ctx.logger.info(f"📨 Received intent message from agent {sender}")
    
    parsed = parse_intent_with_rules(msg.natural_text)
    
    # Send response back to sender
    response = IntentResponse(
        action=parsed["action"],
        amount=parsed["amount"],
        token=parsed["token"],
        protocol=parsed["protocol"],
        chains=parsed["chains"],
        user_address=msg.user_address,
        natural_text=msg.natural_text,
        confidence=parsed["confidence"]
    )
    
    await ctx.send(sender, response)

@intent_parser.on_interval(period=60.0)
async def log_status(ctx: Context):
    """Log agent status every minute"""
    ctx.logger.info(f"💚 Intent Parser Agent is running - Ready to parse intents!")

if __name__ == "__main__":
    print("🚀 Starting Intent Parser Agent...")
    print("📍 HTTP Server: http://localhost:8001")
    print("📝 REST Endpoint: POST http://localhost:8001/parse")
    print("=" * 60)
    intent_parser.run()
