"""
Core data models for ZK-Intent Fusion
"""
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from enum import Enum


class IntentAction(str, Enum):
    YIELD_FARM = "yield_farm"
    SWAP = "swap"
    BRIDGE = "bridge"
    LIQUIDITY_PROVISION = "liquidity_provision"


class Strategy(str, Enum):
    HIGHEST_APY = "highest_apy"
    LOWEST_GAS = "lowest_gas"
    BALANCED = "balanced"
    SAFEST = "safest"


@dataclass
class TokenSpec:
    """Specification for a token in the intent"""
    symbol: str
    chain: str
    amount: float
    address: str = ""  # Token contract address (optional)
    
    def to_dict(self):
        return asdict(self)


@dataclass
class Intent:
    """User's intent parsed from natural language"""
    user: str
    action: IntentAction
    tokens: List[TokenSpec]
    total_value_usd: float
    duration_days: int
    strategy: Strategy
    max_gas_usd: float
    timestamp: int
    commitment: str
    
    def to_dict(self):
        return {
            "user": self.user,
            "action": self.action.value,
            "tokens": [t.to_dict() for t in self.tokens],
            "total_value_usd": self.total_value_usd,
            "duration_days": self.duration_days,
            "strategy": self.strategy.value,
            "max_gas_usd": self.max_gas_usd,
            "timestamp": self.timestamp,
            "commitment": self.commitment
        }


@dataclass
class Plan:
    """Solver's execution plan"""
    solver: str
    protocol: str
    route: str
    apy_bps10: int  # APY in basis points * 10 (e.g., 132 = 13.2%)
    gas_usd: float
    estimated_duration: int  # in seconds
    steps: List[str]
    
    def to_dict(self):
        return asdict(self)


@dataclass
class Bid:
    """Solver's bid in the auction"""
    solver: str
    proof: str
    claimed_apy_bps10: int
    claimed_gas_usd: float
    valid: bool
    plan: Optional['Plan'] = None  # Execution plan for this bid
    timestamp: Optional[int] = None
    
    def to_dict(self):
        result = asdict(self)
        if self.plan:
            result['plan'] = self.plan.to_dict()
        return result


@dataclass
class AuctionResult:
    """Result of the solver auction"""
    intent_commitment: str
    bids: List[Bid]
    winner: Bid
    auction_timestamp: int
    
    def to_dict(self):
        return {
            "intent_commitment": self.intent_commitment,
            "bids": [b.to_dict() for b in self.bids],
            "winner": self.winner.to_dict(),
            "auction_timestamp": self.auction_timestamp
        }


@dataclass
class ExecutionLog:
    """Log of the execution process"""
    intent_commitment: str
    solver: str
    txs: List[str]
    total_gas_usd: float
    final_position: Dict[str, any]
    execution_timestamp: int
    proof: str
    final_balance_commitment: str
    
    def to_dict(self):
        return asdict(self)
