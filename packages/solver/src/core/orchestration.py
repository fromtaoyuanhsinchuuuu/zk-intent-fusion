"""
Orchestration - coordinates the entire intent lifecycle
Combines parsing, auction, authorization, and execution
"""
import time
from typing import Dict, Any
from core.models import Intent
from core.state import get_state
from agents.intent_parser_agent import parse_natural_language, validate_intent
from agents.solver_a_agent import generate_solution as solve_a
from agents.solver_b_agent import generate_solution as solve_b
from agents.solver_c_agent import generate_solution as solve_c
from agents.auction_agent import run_auction, get_auction_stats
from integrations.avail_nexus import bridge_and_execute
from zk.mock_prover import generate_execution_proof


def submit_intent_flow(nl_text: str, user_address: str) -> Dict[str, Any]:
    """
    Complete flow: Parse intent → Run auction → Return results
    
    This is the main entry point for MVP demo
    Combines multiple steps for simplicity
    
    Args:
        nl_text: Natural language intent
        user_address: User's wallet address
    
    Returns:
        Dictionary with intent commitment, metadata, and auction results
    """
    state = get_state()
    
    # Step 1: Parse natural language to structured intent
    parsed = parse_natural_language(nl_text, user_address)
    intent = parsed["intent"]
    
    # Validate intent
    is_valid, error = validate_intent(intent)
    if not is_valid:
        raise ValueError(f"Invalid intent: {error}")
    
    # Store intent
    state.set_intent(intent.commitment, intent)
    
    # Step 2: Get bids from solvers
    bids = []
    
    # Solver C (Unqualified - will fail)
    bid_c = solve_c(intent)
    if bid_c:
        bids.append(bid_c)
    
    # Solver A (Morpho - highest APY)
    bid_a = solve_a(intent)
    if bid_a:
        bids.append(bid_a)
    
    # Solver B (Aave - balanced)
    bid_b = solve_b(intent)
    if bid_b:
        bids.append(bid_b)
    
    if not bids:
        raise ValueError("No solvers could provide a valid solution")
    
    # Step 3: Run auction to select winner
    auction_result = run_auction(
        intent_commitment=intent.commitment,
        bids=bids,
        strategy=intent.strategy.value
    )
    
    # Store auction result
    state.set_auction(intent.commitment, auction_result)
    
    # Step 4: Get auction statistics
    stats = get_auction_stats(auction_result)
    
    # Return comprehensive response
    return {
        "intent_commitment": intent.commitment,
        "parsed_intent": intent.to_dict(),  # Add structured Intent JSON
        "public_metadata": parsed["public_metadata"],
        "auction": {
            "intent_commitment": auction_result.intent_commitment,
            "bids": [b.to_dict() for b in auction_result.bids],
            "winner": auction_result.winner.to_dict(),
            "stats": stats
        },
        "status": "auction_complete"
    }


def authorize_execution(intent_commitment: str, user_signature: str = "") -> Dict[str, Any]:
    """
    Authorize the winning solver to execute
    
    MVP: Simple approval (Vincent/Lit integration would go here)
    Production: Would verify signature and set Lit access control
    
    Args:
        intent_commitment: The intent commitment hash
        user_signature: User's authorization signature (optional in MVP)
    
    Returns:
        Authorization confirmation
    """
    state = get_state()
    
    # Check that auction exists
    auction = state.get_auction(intent_commitment)
    if not auction:
        raise ValueError("No auction found for this intent")
    
    # Store authorization
    auth_data = {
        "intent_commitment": intent_commitment,
        "winner_solver": auction.winner.solver,
        "authorized_at": int(time.time()),
        "signature": user_signature or "mock_signature_mvp"
    }
    state.set_authorization(intent_commitment, auth_data)
    
    return {
        "ok": True,
        "intent_commitment": intent_commitment,
        "authorized_solver": auction.winner.solver,
        "message": "Execution authorized via Vincent (mock)"
    }


def execute_intent(intent_commitment: str) -> Dict[str, Any]:
    """
    Execute the intent via Avail Nexus
    
    Combines: Bridge → Execute → Generate proof → Record on-chain
    
    Args:
        intent_commitment: The intent commitment hash
    
    Returns:
        Execution result with transactions and proof
    """
    state = get_state()
    
    # Check authorization
    auth = state.get_authorization(intent_commitment)
    if not auth:
        raise ValueError("Intent not authorized. Call /authorize first.")
    
    # Get auction result
    auction = state.get_auction(intent_commitment)
    if not auction:
        raise ValueError("No auction found")
    
    # Get intent
    intent = state.get_intent(intent_commitment)
    if not intent:
        raise ValueError("Intent not found")
    
    winner = auction.winner
    
    # Execute via Avail Nexus (mock)
    txs, total_gas_usd, final_position = bridge_and_execute(
        winner_bid=winner.to_dict(),
        intent=intent.to_dict()
    )
    
    # Create execution log
    exec_log = {
        "intent_commitment": intent_commitment,
        "solver": winner.solver,
        "txs": txs,
        "total_gas_usd": total_gas_usd,
        "final_position": final_position,
        "execution_timestamp": int(time.time())
    }
    
    # Generate ZK proof of execution
    proof, final_balance_commitment = generate_execution_proof(intent, exec_log)
    
    exec_log["proof"] = proof
    exec_log["final_balance_commitment"] = final_balance_commitment
    
    # Store execution result
    state.set_execution(intent_commitment, exec_log)
    
    # Return result
    return {
        "intent_commitment": intent_commitment,
        "txs": txs,
        "totalGas": total_gas_usd,
        "finalPosition": final_position,
        "proof": proof,
        "finalBalanceCommitment": final_balance_commitment,
        "proofTx": "0xverifier_tx_mock_" + intent_commitment[-8:],  # Mock verifier tx
        "status": "executed"
    }


def get_intent_status(intent_commitment: str) -> Dict[str, Any]:
    """
    Get the current status of an intent
    
    Args:
        intent_commitment: The intent commitment hash
    
    Returns:
        Current status and details
    """
    state = get_state()
    
    intent = state.get_intent(intent_commitment)
    auction = state.get_auction(intent_commitment)
    auth = state.get_authorization(intent_commitment)
    execution = state.get_execution(intent_commitment)
    
    if not intent:
        return {"status": "not_found"}
    
    status = {
        "intent_commitment": intent_commitment,
        "intent_exists": True,
        "auction_complete": auction is not None,
        "authorized": auth is not None,
        "executed": execution is not None
    }
    
    if auction:
        status["winner"] = auction.winner.solver
    
    if execution:
        status["execution_txs"] = execution["txs"]
        status["final_position"] = execution["final_position"]
    
    return status
