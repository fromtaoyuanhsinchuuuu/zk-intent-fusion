// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/SolverRegistry.sol";
import "../contracts/IntentVerifier.sol";
import "forge-std/Script.sol";

/**
 * @title Deploy
 * @notice Deployment script for ZK-Intent Fusion contracts
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy SolverRegistry
        SolverRegistry solverRegistry = new SolverRegistry();
        console2.log("SolverRegistry deployed at:", address(solverRegistry));
        
        // Deploy IntentVerifier with registry reference
        IntentVerifier intentVerifier = new IntentVerifier(address(solverRegistry));
        console2.log("IntentVerifier deployed at:", address(intentVerifier));
        
        // Register initial qualified solvers for testing
        // Using deterministic addresses for demo
        address solverA = 0x1111111111111111111111111111111111111111;
        address solverB = 0x2222222222222222222222222222222222222222;
        
        solverRegistry.setQualified(solverA, true);
        solverRegistry.setQualified(solverB, true);
        
        console2.log("Registered Solver A:", solverA);
        console2.log("Registered Solver B:", solverB);
        
        vm.stopBroadcast();
        
        console2.log("\n=== Deployment Summary ===");
        console2.log("SolverRegistry:", address(solverRegistry));
        console2.log("IntentVerifier:", address(intentVerifier));
        console2.log("\nAdd these addresses to your .env files:");
        console2.log("\nFrontend (.env.local):");
        console2.log("NEXT_PUBLIC_SOLVER_REGISTRY=%s", address(solverRegistry));
        console2.log("NEXT_PUBLIC_INTENT_VERIFIER=%s", address(intentVerifier));
        console2.log("\nBackend (.env):");
        console2.log("SOLVER_REGISTRY_ADDRESS=%s", address(solverRegistry));
        console2.log("INTENT_VERIFIER_ADDRESS=%s", address(intentVerifier));
    }
}
