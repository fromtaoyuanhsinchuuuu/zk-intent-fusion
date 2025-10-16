// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISolverRegistry {
    function isQualifiedSolver(address) external view returns (bool);
}

/**
 * @title IntentVerifier
 * @notice On-chain anchor for ZK proof verification results with replay protection
 * @dev MVP version: Validates basic constraints and emits events for off-chain indexing
 */
contract IntentVerifier {
    ISolverRegistry public immutable registry;
    
    // State tracking to prevent replay attacks
    mapping(bytes32 => bool) public intentProcessed;
    mapping(bytes32 => address) public intentWinner;
    mapping(bytes32 => bool) public executionCompleted;
    
    event SolverProofVerified(
        bytes32 indexed intentCommitment,
        address indexed solver,
        uint256 claimedAPY,
        uint256 claimedGasUsd,
        bool accepted,
        uint256 timestamp
    );

    event ExecutionVerified(
        bytes32 indexed intentCommitment,
        bytes32 finalBalanceCommitment,
        uint256 timestamp,
        bool accepted
    );

    constructor(address _registry) {
        require(_registry != address(0), "IntentVerifier: invalid registry");
        registry = ISolverRegistry(_registry);
    }

    /**
     * @notice Verify a solver's route optimization proof (MVP: basic validation)
     * @param proof The ZK proof bytes (currently unused in MVP)
     * @param intentCommitment Commitment to the user's intent
     * @param claimedAPY The APY claimed by the solver (in basis points * 10)
     * @param claimedGasUsd Estimated gas cost in USD (with 18 decimals)
     * @param solver Address of the solver
     * @return bool Whether the proof is accepted
     */
    function verifySolverProof(
        bytes calldata /*proof*/,
        bytes32 intentCommitment,
        uint256 claimedAPY,
        uint256 claimedGasUsd,
        address solver
    ) external returns (bool) {
        require(intentCommitment != bytes32(0), "IntentVerifier: invalid commitment");
        require(solver != address(0), "IntentVerifier: invalid solver");
        require(!intentProcessed[intentCommitment], "IntentVerifier: already processed");
        require(registry.isQualifiedSolver(solver), "IntentVerifier: solver not qualified");

        // MVP validation: Check basic constraints
        bool ok = (
            claimedAPY > 0 && 
            claimedAPY <= 50000 && // Max 500% APY (5000 bps * 10)
            claimedGasUsd <= 1e27 // Max $1B gas (with 18 decimals)
        );

        if (ok) {
            intentProcessed[intentCommitment] = true;
            intentWinner[intentCommitment] = solver;
        }

        emit SolverProofVerified(
            intentCommitment,
            solver,
            claimedAPY,
            claimedGasUsd,
            ok,
            block.timestamp
        );

        return ok;
    }

    /**
     * @notice Verify and record the execution result proof
     * @param proof The ZK execution proof bytes (currently unused in MVP)
     * @param intentCommitment Original intent commitment
     * @param finalBalanceCommitment Commitment to the final balance state
     * @param timestamp Execution timestamp
     * @return bool Whether the execution is accepted
     */
    function verifyAndRecordExecution(
        bytes calldata /*proof*/,
        bytes32 intentCommitment,
        bytes32 finalBalanceCommitment,
        uint256 timestamp
    ) external returns (bool) {
        require(intentCommitment != bytes32(0), "IntentVerifier: invalid intent commitment");
        require(finalBalanceCommitment != bytes32(0), "IntentVerifier: invalid balance commitment");
        require(intentProcessed[intentCommitment], "IntentVerifier: intent not verified");
        require(!executionCompleted[intentCommitment], "IntentVerifier: already executed");

        // MVP validation: Basic timestamp and commitment checks
        bool ok = (
            finalBalanceCommitment != bytes32(0) && 
            timestamp > 0 && 
            timestamp <= block.timestamp + 300 // Allow 5 min clock skew
        );

        if (ok) {
            executionCompleted[intentCommitment] = true;
        }

        emit ExecutionVerified(
            intentCommitment,
            finalBalanceCommitment,
            timestamp,
            ok
        );

        return ok;
    }

    /**
     * @notice Check if an intent has been processed
     * @param intentCommitment The intent commitment
     * @return bool Whether the intent is processed
     */
    function isIntentProcessed(bytes32 intentCommitment) external view returns (bool) {
        return intentProcessed[intentCommitment];
    }

    /**
     * @notice Get the winner for an intent
     * @param intentCommitment The intent commitment
     * @return address The winning solver address
     */
    function getWinner(bytes32 intentCommitment) external view returns (address) {
        return intentWinner[intentCommitment];
    }

    /**
     * @notice Check if an execution has been completed
     * @param intentCommitment The intent commitment
     * @return bool Whether the execution is completed
     */
    function isExecutionCompleted(bytes32 intentCommitment) external view returns (bool) {
        return executionCompleted[intentCommitment];
    }
}
