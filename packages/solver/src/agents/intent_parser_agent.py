"""
Intent parsing agent - converts natural language to structured Intent
In production, this would integrate with ASI Chat or MeTTa reasoning
"""
import time
from typing import Dict, Any
from ..core.models import Intent, IntentAction, Strategy, TokenSpec
from ..zk.mock_prover import generate_intent_commitment
from ..integrations.lit import encrypt


def parse_natural_language(nl_text: str, user_address: str) -> Dict[str, Any]:
    """
    Parse natural language intent into structured format
    
    MVP: Pattern matching with predefined rules
    Production: Would use ASI Chat / MeTTa for semantic understanding
    
    Examples:
    - "Use all my stablecoins for 3 months, highest APY, tolerate 3% gas"
    - "Swap 1000 USDC to ETH with lowest fees"
    - "Provide liquidity on Uniswap with balanced risk"
    
    Returns:
        Dictionary containing Intent, encrypted data, and public metadata
    """
    nl_lower = nl_text.lower()
    
    # Detect action
    if "yield" in nl_lower or "farm" in nl_lower or "lend" in nl_lower:
        action = IntentAction.YIELD_FARM
    elif "swap" in nl_lower or "exchange" in nl_lower:
        action = IntentAction.SWAP
    elif "bridge" in nl_lower:
        action = IntentAction.BRIDGE
    elif "liquidity" in nl_lower or "lp" in nl_lower:
        action = IntentAction.LIQUIDITY_PROVISION
    else:
        action = IntentAction.YIELD_FARM  # Default
    
    # Detect strategy
    if "highest apy" in nl_lower or "maximum return" in nl_lower:
        strategy = Strategy.HIGHEST_APY
    elif "lowest gas" in nl_lower or "cheapest" in nl_lower:
        strategy = Strategy.LOWEST_GAS
    elif "safest" in nl_lower or "secure" in nl_lower:
        strategy = Strategy.SAFEST
    else:
        strategy = Strategy.BALANCED
    
    # Parse duration (simplified)
    duration_days = 90  # Default 3 months
    if "month" in nl_lower:
        if "1 month" in nl_lower:
            duration_days = 30
        elif "6 month" in nl_lower:
            duration_days = 180
        elif "year" in nl_lower or "12 month" in nl_lower:
            duration_days = 365
    
    # Parse gas tolerance
    max_gas_usd = 15.0  # Default
    if "gas" in nl_lower:
        import re
        gas_match = re.search(r'(\d+)%?\s*gas', nl_lower)
        if gas_match:
            gas_percent = int(gas_match.group(1))
            max_gas_usd = 500 * (gas_percent / 100)  # Assume 500 base
    
    # Create token specs (MVP: fixed example with stablecoins)
    tokens = [
        TokenSpec(symbol="USDC", chain="arbitrum", amount=250.0),
        TokenSpec(symbol="USDT", chain="polygon", amount=250.0)
    ]
    total_value_usd = sum(t.amount for t in tokens)
    
    # Generate commitment
    timestamp = int(time.time())
    commitment = generate_intent_commitment(
        action=action.value,
        total_value_usd=total_value_usd,
        duration_days=duration_days,
        max_gas_usd=max_gas_usd,
        timestamp=timestamp
    )
    
    # Create Intent object
    intent = Intent(
        user=user_address,
        action=action,
        tokens=tokens,
        total_value_usd=total_value_usd,
        duration_days=duration_days,
        strategy=strategy,
        max_gas_usd=max_gas_usd,
        timestamp=timestamp,
        commitment=commitment
    )
    
    # Encrypt intent details (for qualified solvers only)
    access_control = {
        "type": "qualified_solvers",
        "registry_address": "0xSolverRegistry"  # Would be actual address in production
    }
    encrypted_intent = encrypt(intent.to_dict(), access_control)
    
    # Public metadata (safe to show to user)
    public_metadata = {
        "action": action.value,
        "strategy": strategy.value,
        "duration": f"{duration_days} days",
        "estimated_total": f"${total_value_usd:.2f}",
        "max_gas": f"${max_gas_usd:.2f}",
        "timestamp": timestamp
    }
    
    return {
        "intent": intent,
        "encrypted_intent": encrypted_intent,
        "public_metadata": public_metadata
    }


def validate_intent(intent: Intent) -> tuple[bool, str]:
    """
    Validate that an intent meets basic requirements
    
    Returns:
        (is_valid, error_message) tuple
    """
    if intent.total_value_usd <= 0:
        return False, "Total value must be positive"
    
    if intent.duration_days < 1:
        return False, "Duration must be at least 1 day"
    
    if intent.max_gas_usd < 0:
        return False, "Max gas cannot be negative"
    
    if len(intent.tokens) == 0:
        return False, "At least one token required"
    
    if not intent.user or not intent.user.startswith("0x"):
        return False, "Invalid user address"
    
    return True, ""


def refine_intent_with_feedback(
    intent: Intent,
    solver_feedback: Dict[str, Any]
) -> Intent:
    """
    Refine intent based on solver feedback
    
    MVP: Not implemented (would use iterative ASI Chat)
    Production: Would adjust parameters based on solver suggestions
    
    Args:
        intent: Original intent
        solver_feedback: Feedback from solvers about feasibility
    
    Returns:
        Refined intent
    """
    # In production, this would use ASI Chat to negotiate
    # For MVP, just return original intent
    return intent
