"""
Auction agent - manages the solver bidding process
"""
import time
from typing import List, Dict, Any
from core.models import AuctionResult, Bid, Intent
from zk.mock_prover import verify_solver_proof


def run_auction(
    intent_commitment: str,
    bids: List[Bid],
    strategy: str = "highest_apy"
) -> AuctionResult:
    """
    Run the solver auction and select winner
    
    Process:
    1. Verify all bids have valid ZK proofs
    2. Filter to only valid bids
    3. Select winner based on strategy
    
    Args:
        intent_commitment: The intent commitment hash
        bids: List of solver bids
        strategy: Selection strategy (highest_apy, lowest_gas, balanced)
    
    Returns:
        AuctionResult with winner and all bids
    """
    verified_bids = []
    
    # Verify each bid's proof
    for bid in bids:
        is_valid = verify_solver_proof(
            bid.proof,
            {"commitment": intent_commitment}
        )
        
        # Update bid validity
        bid.valid = bid.valid and is_valid
        
        if bid.valid:
            verified_bids.append(bid)
    
    if not verified_bids:
        raise ValueError("No valid bids in auction")
    
    # Select winner based on strategy
    winner = select_winner(verified_bids, strategy)
    
    auction_result = AuctionResult(
        intent_commitment=intent_commitment,
        bids=bids,  # Include all bids (valid and invalid) for transparency
        winner=winner,
        auction_timestamp=int(time.time())
    )
    
    return auction_result


def select_winner(valid_bids: List[Bid], strategy: str) -> Bid:
    """
    Select the winning bid based on strategy
    
    Strategies:
    - highest_apy: Maximum APY (default for yield farming)
    - lowest_gas: Minimum gas cost
    - balanced: Best APY/gas ratio
    
    Args:
        valid_bids: List of verified bids
        strategy: Selection strategy
    
    Returns:
        Winning bid
    """
    if not valid_bids:
        raise ValueError("No valid bids to select from")
    
    if strategy == "highest_apy":
        # Sort by APY descending, then by gas ascending (tiebreaker)
        winner = sorted(
            valid_bids,
            key=lambda b: (b.claimed_apy_bps10, -b.claimed_gas_usd),
            reverse=True
        )[0]
    
    elif strategy == "lowest_gas":
        # Sort by gas ascending, then by APY descending (tiebreaker)
        winner = sorted(
            valid_bids,
            key=lambda b: (b.claimed_gas_usd, -b.claimed_apy_bps10)
        )[0]
    
    elif strategy == "balanced":
        # Calculate efficiency score: APY / gas_cost
        # Higher score is better
        def efficiency_score(bid: Bid) -> float:
            if bid.claimed_gas_usd == 0:
                return float('inf')
            return bid.claimed_apy_bps10 / bid.claimed_gas_usd
        
        winner = sorted(
            valid_bids,
            key=efficiency_score,
            reverse=True
        )[0]
    
    else:
        # Default to highest APY
        winner = select_winner(valid_bids, "highest_apy")
    
    return winner


def simulate_auction_with_delays(
    intent: Intent,
    solvers: List[Any]
) -> List[Bid]:
    """
    Simulate realistic auction with solver response delays
    
    MVP: All solvers respond immediately
    Production: Would handle async responses over time
    
    Args:
        intent: The user's intent
        solvers: List of solver agents
    
    Returns:
        List of bids received
    """
    bids = []
    
    for solver in solvers:
        try:
            bid = solver.generate_solution(intent)
            if bid:
                bids.append(bid)
        except Exception as e:
            print(f"Solver {getattr(solver, 'SOLVER_ADDRESS', 'unknown')} failed: {e}")
    
    return bids


def get_auction_stats(auction_result: AuctionResult) -> Dict[str, Any]:
    """
    Calculate statistics for an auction
    
    Returns:
        Dictionary with auction analytics
    """
    valid_bids = [b for b in auction_result.bids if b.valid]
    
    if not valid_bids:
        return {
            "total_bids": len(auction_result.bids),
            "valid_bids": 0,
            "winner": None
        }
    
    apys = [b.claimed_apy_bps10 for b in valid_bids]
    gas_costs = [b.claimed_gas_usd for b in valid_bids]
    
    return {
        "total_bids": len(auction_result.bids),
        "valid_bids": len(valid_bids),
        "winner": auction_result.winner.solver,
        "apy_range": {
            "min": min(apys) / 10,
            "max": max(apys) / 10,
            "avg": sum(apys) / len(apys) / 10
        },
        "gas_range": {
            "min": min(gas_costs),
            "max": max(gas_costs),
            "avg": sum(gas_costs) / len(gas_costs)
        },
        "timestamp": auction_result.auction_timestamp
    }
