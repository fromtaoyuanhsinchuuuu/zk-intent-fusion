"""
Mock Lit Protocol integration for encryption and access control
In production, this would use the actual Lit Protocol SDK or Vincent

NOTE: For MVP, we use a hardcoded list. In production, this would:
1. Query the on-chain SolverRegistry contract
2. Use Lit Protocol's threshold encryption
3. Enforce access control via PKPs and conditions
"""
from typing import Dict, Any, Set
import json
import os

# MVP: Hardcoded qualified solvers
# Production: Query from on-chain SolverRegistry
QUALIFIED_SOLVERS: Set[str] = {
    "0xSolverA",
    "0xSolverB",
    # Note: 0xSolverC is intentionally NOT in this list
}

# For production integration with on-chain registry:
"""
from web3 import Web3

def check_on_chain_access(solver_addr: str) -> bool:
    w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL", "http://localhost:8545")))
    registry_address = os.getenv("SOLVER_REGISTRY_ADDRESS")
    
    if not registry_address:
        return False
    
    # ABI for isQualifiedSolver(address) returns (bool)
    registry_abi = [{
        "inputs": [{"type": "address", "name": ""}],
        "name": "isQualifiedSolver",
        "outputs": [{"type": "bool", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    }]
    
    contract = w3.eth.contract(address=registry_address, abi=registry_abi)
    return contract.functions.isQualifiedSolver(solver_addr).call()
"""


def encrypt(data: Any, access_control: Dict[str, Any]) -> str:
    """
    Encrypt data with Lit Protocol access control
    
    MVP: Returns a mock encrypted string
    Production: Would call Lit Protocol SDK to:
    - Encrypt data with threshold encryption
    - Set access control conditions
    - Store encryption key shares across Lit nodes
    
    Args:
        data: Data to encrypt (will be JSON serialized)
        access_control: Access control conditions (e.g., qualified solvers only)
    
    Returns:
        Mock encrypted string
    """
    if isinstance(data, dict):
        json_str = json.dumps(data, default=str)
    else:
        json_str = str(data)
    
    # Generate deterministic "encrypted" value for MVP
    hash_val = abs(hash(json_str))
    
    # Store access control in the encrypted blob (in production, this is enforced by Lit)
    encrypted = f"lit_encrypted_{hash_val}_{json.dumps(access_control)}"
    
    return encrypted


def decrypt(encrypted: str, solver_addr: str) -> str:
    """
    Decrypt data if the solver has access
    
    MVP: Checks if solver is in QUALIFIED_SOLVERS
    Production: Would call Lit Protocol to:
    - Check on-chain access control conditions
    - Retrieve and combine key shares
    - Decrypt the data
    
    Args:
        encrypted: The encrypted blob
        solver_addr: Address of the solver requesting access
    
    Returns:
        Decrypted JSON string
    
    Raises:
        PermissionError: If solver doesn't have access
    """
    if solver_addr not in QUALIFIED_SOLVERS:
        raise PermissionError(f"Solver {solver_addr} is not qualified for access")
    
    # Extract access control from mock encrypted string
    if not encrypted.startswith("lit_encrypted_"):
        raise ValueError("Invalid encrypted format")
    
    # In MVP, we just return a placeholder
    # In production, this would be the actual decrypted data
    return '{"status": "decrypted", "note": "This would contain the actual intent details"}'


def grant_access(solver_addr: str) -> None:
    """
    Grant a solver access to encrypted intents
    
    MVP: Adds to in-memory set
    Production: Would update on-chain registry and Lit conditions
    """
    QUALIFIED_SOLVERS.add(solver_addr)


def revoke_access(solver_addr: str) -> None:
    """
    Revoke a solver's access
    
    MVP: Removes from in-memory set
    Production: Would update on-chain registry and Lit conditions
    """
    if solver_addr in QUALIFIED_SOLVERS:
        QUALIFIED_SOLVERS.remove(solver_addr)


def check_access(solver_addr: str) -> bool:
    """
    Check if a solver has access
    
    Args:
        solver_addr: Solver address to check
    
    Returns:
        True if solver is qualified
    """
    return solver_addr in QUALIFIED_SOLVERS


def get_qualified_solvers() -> Set[str]:
    """
    Get all qualified solvers
    
    Returns:
        Set of qualified solver addresses
    """
    return QUALIFIED_SOLVERS.copy()
