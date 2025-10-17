"""
Solver B Agent - Optimizes for balanced APY and gas efficiency using Aave
"""
import time
from typing import Dict, Any, Optional
from core.models import Intent, Plan, Bid
from zk.mock_prover import generate_solver_proof
from integrations.lit import check_access


SOLVER_ADDRESS = "0xSolverB"


def generate_solution(intent: Intent) -> Optional[Bid]:
    """
    Generate a solution for the intent using Aave protocol
    
    Strategy: Efficient bridging and deployment to Aave on Arbitrum
    - Optimize for lower gas costs
    - Bridge from Polygon to Arbitrum
    - Supply to Aave for stable yields
    
    Returns:
        Bid if solution is valid, None otherwise
    """
    # Check if this solver has access to the intent
    if not check_access(SOLVER_ADDRESS):
        return None
    
    # Generate execution plan based on intent action
    if intent.action.value == "yield_farm":
        plan = Plan(
            solver=SOLVER_ADDRESS,
            protocol="aave",
            route="polygon → arbitrum (bridge) + swap → aave",
            apy_bps10=121,  # 12.1% APY
            gas_usd=11.0,   # Lower gas cost than Solver A
            estimated_duration=240,  # 4 minutes
            steps=[
                "Withdraw from Polygon",
                "Bridge to Arbitrum via optimized route",
                "Swap USDT to USDC on Arbitrum",
                "Supply USDC to Aave v3"
            ]
        )
    elif intent.action.value == "swap":
        # Handle swap intents using Uniswap + DEX aggregator
        plan = Plan(
            solver=SOLVER_ADDRESS,
            protocol="uniswap-v3",
            route="mainnet → uniswap v3 → mainnet",
            apy_bps10=0,  # No APY for swaps
            gas_usd=6.5,  # Lower gas than Solver A
            estimated_duration=20,  # 20 seconds
            steps=[
                "Check liquidity across Uniswap V3 pools",
                "Execute optimal swap route",
                "Verify slippage within tolerance"
            ]
        )
    else:
        return None  # Unsupported action type
    
    # Check if plan meets intent constraints
    if plan.gas_usd > intent.max_gas_usd:
        return None  # Can't reduce gas further while maintaining APY
    
    # Generate ZK proof that our solution is valid
    proof = generate_solver_proof(intent, plan)
    
    if proof is None:
        return None  # Constraints not satisfied
    
    # Create bid with execution plan
    bid = Bid(
        solver=SOLVER_ADDRESS,
        proof=proof,
        claimed_apy_bps10=plan.apy_bps10,
        claimed_gas_usd=plan.gas_usd,
        valid=True,
        plan=plan,  # Include the execution plan
        timestamp=int(time.time())
    )
    
    return bid


def get_solver_info() -> Dict[str, Any]:
    """
    Get information about this solver
    
    Returns:
        Solver metadata
    """
    return {
        "address": SOLVER_ADDRESS,
        "name": "Aave Efficiency Optimizer",
        "specialization": "Balanced APY with low gas costs",
        "supported_protocols": ["aave", "compound"],
        "supported_chains": ["arbitrum", "polygon", "ethereum"],
        "reputation_score": 92,
        "total_volume_usd": 8_500_000
    }
