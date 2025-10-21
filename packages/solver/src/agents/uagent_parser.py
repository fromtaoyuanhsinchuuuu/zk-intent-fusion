#!/usr/bin/env python3#!/usr/bin/env python3

""""""

Intent Parser Agent using Fetch.ai uAgents frameworkIntent Parser Agent using Fetch.ai uAgents framework

Exposes REST API endpoint for parsing natural language intentsExposes REST API endpoint for parsing natural language intents

""""""



from uagents import Agent, Context, Modelfrom uagents import Agent, Context, Model

import jsonimport json

import reimport re

from typing import Optionalfrom typing import Optional



# Define request/response models for REST API# Define request/response models for REST API

class IntentRequest(Model):class IntentRequest(Model):

    """Request model for intent parsing"""    """Request model for intent parsing"""

    user_address: str    user_address: str

    natural_text: str    natural_text: str



class IntentResponse(Model):class IntentResponse(Model):

    """Response model with parsed intent"""    """Response model with parsed intent"""

    action: str    action: str

    amount: str    amount: str

    token: str    token: str

    protocol: str    protocol: str

    chains: list    chains: list

    user_address: str    user_address: str

    natural_text: str    natural_text: str

    confidence: float    confidence: float



# Initialize the intent parser agent# Initialize the intent parser agent

intent_parser = Agent(intent_parser = Agent(

    name="intent_parser",    name="intent_parser",

    seed="intent_parser_recovery_phrase_zk_fusion",    seed="intent_parser_recovery_phrase_zk_fusion",

    port=8001,    port=8001,

    endpoint=["http://localhost:8001/submit"],    endpoint=["http://localhost:8001/submit"],

))



@intent_parser.on_event("startup")@intent_parser.on_event("startup")

async def startup(ctx: Context):async def startup(ctx: Context):

    """Log agent startup"""    """Log agent startup"""

    ctx.logger.info(f"🤖 Intent Parser Agent started!")    ctx.logger.info(f"🤖 Intent Parser Agent started!")

    ctx.logger.info(f"📍 Address: {ctx.agent.address}")    ctx.logger.info(f"📍 Address: {ctx.agent.address}")

    ctx.logger.info(f"🌐 Listening on port 8001")    ctx.logger.info(f"🌐 Listening on port 8001")

    ctx.logger.info(f"📝 REST endpoint: POST http://localhost:8001/parse")    ctx.logger.info(f"📝 REST endpoint: POST http://localhost:8001/parse")



def parse_intent_with_rules(text: str) -> dict:def parse_intent_with_rules(text: str) -> dict:

    """    """

    Rule-based intent parsing with pattern matching    Rule-based intent parsing with pattern matching

    Returns parsed intent components    Returns parsed intent components

    """    """

    text_lower = text.lower()    text_lower = text.lower()

        

    # Default values    # Default values

    result = {    result = {

        "action": "supply",        "action": "supply",

        "amount": "100",        "amount": "100",

        "token": "USDC",        "token": "USDC",

        "protocol": "morpho",        "protocol": "morpho",

        "chains": ["optimism"],        "chains": ["optimism"],

        "confidence": 0.5        "confidence": 0.5

    }    }

        

    # Action detection (order matters - check specific actions first)    # Action detection (order matters - check specific actions first)

    if any(word in text_lower for word in ["withdraw", "remove", "unstake"]):    if any(word in text_lower for word in ["withdraw", "remove", "unstake"]):

        result["action"] = "withdraw"        result["action"] = "withdraw"

        result["confidence"] = 0.8        result["confidence"] = 0.8

    elif "deposit" in text_lower:    elif "deposit" in text_lower:

        result["action"] = "deposit"        result["action"] = "deposit"

        result["confidence"] = 0.8        result["confidence"] = 0.8

    elif any(word in text_lower for word in ["supply", "lend", "provide"]):    elif any(word in text_lower for word in ["supply", "lend", "provide"]):

        result["action"] = "supply"        result["action"] = "supply"

        result["confidence"] = 0.8        result["confidence"] = 0.8

    elif any(word in text_lower for word in ["borrow", "take", "loan"]):    elif any(word in text_lower for word in ["borrow", "take", "loan"]):

        result["action"] = "borrow"        result["action"] = "borrow"

        result["confidence"] = 0.8        result["confidence"] = 0.8

    elif any(word in text_lower for word in ["swap", "exchange", "trade"]):    elif any(word in text_lower for word in ["swap", "exchange", "trade"]):

        result["action"] = "swap"        result["action"] = "swap"

        result["confidence"] = 0.8        result["confidence"] = 0.8

    elif any(word in text_lower for word in ["bridge", "transfer", "move"]):    elif any(word in text_lower for word in ["bridge", "transfer", "move"]):

        result["action"] = "bridge"        result["action"] = "bridge"

        result["confidence"] = 0.8        result["confidence"] = 0.8

        

    # Extract amount using regex    # Amount extraction

    amount_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:USDC|USDT|DAI|ETH|WETH)?', text, re.IGNORECASE)    amount_match = re.search(r'\b(\d+(?:\.\d+)?)\b', text)

    if amount_match:    if amount_match:

        result["amount"] = amount_match.group(1)        result["amount"] = amount_match.group(1)

        result["confidence"] = min(result["confidence"] + 0.2, 1.0)        result["confidence"] += 0.1

        

    # Token detection    # Token detection

    tokens = {    tokens = ["usdc", "usdt", "dai", "weth", "eth", "wbtc", "btc"]

        "usdc": "USDC",    for token in tokens:

        "usdt": "USDT",         if token in text_lower:

        "dai": "DAI",            result["token"] = token.upper()

        "eth": "ETH",            result["confidence"] += 0.1

        "weth": "WETH",            break

        "stablecoin": "USDC"  # default stablecoin    

    }    # Protocol detection

    for key, value in tokens.items():    protocols = {

        if key in text_lower:        "morpho": ["morpho"],

            result["token"] = value        "aave": ["aave"],

            break        "compound": ["compound"],

            "uniswap": ["uniswap", "uni"],

    # Protocol detection        "balancer": ["balancer"],

    protocols = {    }

        "morpho": "morpho",    for protocol, keywords in protocols.items():

        "aave": "aave",        if any(kw in text_lower for kw in keywords):

        "compound": "compound",            result["protocol"] = protocol

        "uniswap": "uniswap",            result["confidence"] += 0.1

        "uni": "uniswap"            break

    }    

    for key, value in protocols.items():    # Chain detection

        if key in text_lower:    detected_chains = []

            result["protocol"] = value    chain_map = {

            break        "optimism": ["optimism", "op"],

            "arbitrum": ["arbitrum", "arb"],

    # Chain detection        "base": ["base"],

    chains_found = []        "polygon": ["polygon", "matic"],

    chain_keywords = {        "ethereum": ["ethereum", "eth mainnet"],

        "arbitrum": "arbitrum",    }

        "optimism": "optimism",    for chain, keywords in chain_map.items():

        "polygon": "polygon",        if any(kw in text_lower for kw in keywords):

        "ethereum": "ethereum",            detected_chains.append(chain)

        "base": "base"            result["confidence"] += 0.05

    }    

    for key, value in chain_keywords.items():    if detected_chains:

        if key in text_lower:        result["chains"] = detected_chains

            chains_found.append(value)    

        # Cap confidence at 1.0

    if chains_found:    result["confidence"] = min(result["confidence"], 1.0)

        result["chains"] = chains_found    

        result["confidence"] = min(result["confidence"] + 0.1, 1.0)    return result

    

    return result@intent_parser.on_rest_post("/parse", IntentRequest, IntentResponse)

async def handle_parse_intent(ctx: Context, req: IntentRequest) -> IntentResponse:

@intent_parser.on_rest_post("/parse", IntentRequest, IntentResponse)    """

async def handle_parse_intent(ctx: Context, req: IntentRequest) -> IntentResponse:    REST endpoint handler for intent parsing

    """    POST /parse with JSON body: {user_address, natural_text}

    REST endpoint handler for intent parsing    """

    POST /parse with JSON body: {user_address, natural_text}    print("\n" + "="*70)

    """    print("🤖 uAGENT IS PROCESSING THIS REQUEST!")

    print("\n" + "="*70)    print("="*70)

    print("🤖 uAGENT IS PROCESSING THIS REQUEST!")    ctx.logger.info(f"📥 Received intent parsing request for user: {req.user_address}")

    print("="*70)    ctx.logger.info(f"� Natural text: {req.natural_text}")

    ctx.logger.info(f"📥 Received intent parsing request for user: {req.user_address}")    print(f"👤 User: {req.user_address}")

    ctx.logger.info(f"📝 Natural text: {req.natural_text}")    print(f"💬 Text: {req.natural_text}")

    print(f"👤 User: {req.user_address}")    

    print(f"💬 Text: {req.natural_text}")    try:

            # Parse the intent using rule-based system

    try:        parsed = parse_intent_with_rules(req.natural_text)

        # Parse the intent using rule-based system

        parsed = parse_intent_with_rules(req.natural_text)@intent_parser.on_message(model=IntentRequest)

        async def handle_intent_message(ctx: Context, sender: str, msg: IntentRequest):

        ctx.logger.info(f"✅ Parsed intent: action={parsed['action']}, "    """

                       f"amount={parsed['amount']}, token={parsed['token']}, "    Alternative message handler for agent-to-agent communication

                       f"confidence={parsed['confidence']:.2f}")    """

            ctx.logger.info(f"📨 Received intent message from agent {sender}")

        print(f"✅ Action: {parsed['action']}")    

        print(f"💰 Amount: {parsed['amount']} {parsed['token']}")    parsed = parse_intent_with_rules(msg.natural_text)

        print(f"🏦 Protocol: {parsed['protocol']}")    

        print(f"📊 Confidence: {parsed['confidence']:.2f}")    # Send response back to sender

        print("="*70 + "\n")    response = IntentResponse(

                action=parsed["action"],

        # Create response        amount=parsed["amount"],

        response = IntentResponse(        token=parsed["token"],

            action=parsed["action"],        protocol=parsed["protocol"],

            amount=parsed["amount"],        chains=parsed["chains"],

            token=parsed["token"],        user_address=msg.user_address,

            protocol=parsed["protocol"],        natural_text=msg.natural_text,

            chains=parsed["chains"],        confidence=parsed["confidence"]

            user_address=req.user_address,    )

            natural_text=req.natural_text,    

            confidence=parsed["confidence"]    await ctx.send(sender, response)

        )

        @intent_parser.on_interval(period=60.0)

        return responseasync def log_status(ctx: Context):

            """Log agent status every minute"""

    except Exception as e:    ctx.logger.info(f"💚 Intent Parser Agent is running - Ready to parse intents!")

        ctx.logger.error(f"❌ Error parsing intent: {str(e)}")

        print(f"❌ ERROR: {str(e)}")if __name__ == "__main__":

        print("="*70 + "\n")    print("🚀 Starting Intent Parser Agent...")

        # Return default fallback response    print("📍 HTTP Server: http://localhost:8001")

        return IntentResponse(    print("📝 REST Endpoint: POST http://localhost:8001/parse")

            action="supply",    print("=" * 60)

            amount="100",    intent_parser.run()

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
