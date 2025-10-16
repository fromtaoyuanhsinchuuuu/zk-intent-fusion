"""
Solver C Agent - Unqualified solver that attempts to participate
This demonstrates the access control mechanism - Solver C should fail
"""
import time
from typing import Optional
from core.models import Intent, Plan, Bid
from zk.mock_prover import generate_solver_proof
from integrations.lit import check_access


SOLVER_ADDRESS = "0xSolverC"


def generate_solution(intent: Intent) -> Optional[Bid]:
    """
    Attempt to generate a solution as an unqualified solver
    
    This solver is NOT in the qualified list, so:
    1. Cannot decrypt the intent details via Lit Protocol
    2. Must guess at parameters
    3. Will generate invalid proof that gets rejected
    
    Returns:
        Bid with valid=False (will be rejected in auction)
    """
    # Check if this solver has access (should fail)
    if not check_access(SOLVER_ADDRESS):
        # Solver C is not qualified, so it tries to guess
        # This simulates an adversarial or unqualified solver
        
        # Try to create a plan without knowing the actual intent details
        # Guess at competitive values
        plan = Plan(
            solver=SOLVER_ADDRESS,
            protocol="compound",  # Guess a protocol
            route="guessed route without intent details",
            apy_bps10=140,  # Try to bid higher than others
            gas_usd=8.0,    # Try to bid lower gas
            estimated_duration=180,
            steps=["guessed step 1", "guessed step 2"]
        )
        
        # Attempt to generate proof without proper intent access
        # This will create an invalid proof
        fake_proof = f"0xinvalid_proof_{SOLVER_ADDRESS[-6:]}"
        
        # Create bid marked as invalid
        bid = Bid(
            solver=SOLVER_ADDRESS,
            proof=fake_proof,
            claimed_apy_bps10=plan.apy_bps10,
            claimed_gas_usd=plan.gas_usd,
            valid=False,  # Mark as invalid from the start
            timestamp=int(time.time())
        )
        
        return bid
    
    # If somehow qualified (shouldn't happen), process normally
    return None


def get_solver_info() -> dict:
    """
    Get information about this solver
    
    Returns:
        Solver metadata
    """
    return {
        "address": SOLVER_ADDRESS,
        "name": "Unqualified Solver C",
        "specialization": "None - not qualified",
        "supported_protocols": [],
        "supported_chains": [],
        "reputation_score": 0,
        "total_volume_usd": 0,
        "qualified": False
    }
