"""
Intent Validation Module

Validates parsed intents for correctness and security.
"""

from typing import Tuple
from .models import Intent


def validate_intent(intent: Intent) -> Tuple[bool, str]:
    """
    Validate a parsed intent for correctness
    
    Args:
        intent: The intent to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Check user address
        if not intent.user or not intent.user.startswith("0x"):
            return False, "Invalid user address"
        
        # Check commitment
        if not intent.commitment or len(intent.commitment) < 10:
            return False, "Invalid commitment hash"
        
        # Check tokens (assets)
        if not intent.tokens or len(intent.tokens) == 0:
            return False, "No tokens specified"
        
        for token in intent.tokens:
            if not token.chain:
                return False, "Token missing chain"
            if token.amount <= 0:
                return False, "Token amount must be positive"
        
        # Check strategy
        if not intent.strategy:
            return False, "No strategy specified"
        
        # Check duration
        if intent.duration_days <= 0:
            return False, "Duration must be positive"
        
        if intent.duration_days > 365:
            return False, "Duration cannot exceed 1 year"
        
        # Check gas
        if intent.max_gas_usd < 0:
            return False, "Max gas must be non-negative"
        
        # All checks passed
        return True, ""
        
    except Exception as e:
        return False, f"Validation error: {str(e)}"


def validate_commitment(commitment: str) -> bool:
    """
    Validate a commitment hash format
    
    Args:
        commitment: The commitment hash to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not commitment:
        return False
    
    # Should be a hex string
    if not commitment.startswith("0x"):
        return False
    
    # Should be 64 characters (32 bytes) + 0x prefix
    if len(commitment) != 66:
        return False
    
    # Should only contain hex characters
    try:
        int(commitment, 16)
        return True
    except ValueError:
        return False
