export const CONFIG = {
  // Solver API base URL
  solverApiBase: process.env.NEXT_PUBLIC_SOLVER_API ?? "http://localhost:8787",
  
  // Smart contract addresses (set after deployment)
  contracts: {
    solverRegistry: process.env.NEXT_PUBLIC_SOLVER_REGISTRY ?? "0x...",
    intentVerifier: process.env.NEXT_PUBLIC_INTENT_VERIFIER ?? "0x...",
  },
  
  // Network settings
  defaultChain: process.env.NEXT_PUBLIC_DEFAULT_CHAIN ?? "optimism",
  
  // Feature flags
  features: {
    realZkProofs: process.env.NEXT_PUBLIC_REAL_ZK_PROOFS === "true",
    realLitProtocol: process.env.NEXT_PUBLIC_REAL_LIT === "true",
    realAvailNexus: process.env.NEXT_PUBLIC_REAL_NEXUS === "true",
  }
} as const;
