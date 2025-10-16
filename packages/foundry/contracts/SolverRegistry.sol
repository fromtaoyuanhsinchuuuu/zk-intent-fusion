// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SolverRegistry
 * @notice Registry for qualified solvers that can participate in intent auctions
 * @dev Maintains a whitelist of authorized solver addresses
 */
contract SolverRegistry {
    address public owner;
    mapping(address => bool) public isQualifiedSolver;

    event SolverStatusUpdated(address indexed solver, bool qualified);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SolverRegistry: caller is not owner");
        _;
    }

    /**
     * @notice Set the qualification status of a solver
     * @param solver The address of the solver
     * @param qualified Whether the solver is qualified
     */
    function setQualified(address solver, bool qualified) external onlyOwner {
        require(solver != address(0), "SolverRegistry: zero address");
        isQualifiedSolver[solver] = qualified;
        emit SolverStatusUpdated(solver, qualified);
    }

    /**
     * @notice Batch set qualification status for multiple solvers
     * @param solvers Array of solver addresses
     * @param qualified Array of qualification statuses
     */
    function batchSetQualified(address[] calldata solvers, bool[] calldata qualified) external onlyOwner {
        require(solvers.length == qualified.length, "SolverRegistry: length mismatch");
        for (uint256 i = 0; i < solvers.length; i++) {
            require(solvers[i] != address(0), "SolverRegistry: zero address");
            isQualifiedSolver[solvers[i]] = qualified[i];
            emit SolverStatusUpdated(solvers[i], qualified[i]);
        }
    }

    /**
     * @notice Transfer ownership of the registry
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SolverRegistry: zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
