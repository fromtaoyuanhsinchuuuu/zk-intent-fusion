import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Asset {
  chain: string;
  token: string;
  amount: string;
}

export interface Constraints {
  duration: string;
  max_gas_tolerance: string;
}

export interface ParsedIntent {
  goal: string;
  assets: Asset[];
  constraints: Constraints;
}

export interface SolverBid {
  solver_id: string;
  solver_name: string;
  solver_address: string;
  strategy: string;
  expected_apy: number;
  estimated_gas: number;
  gas_percentage: number;
  protocol: string;
  target_chain: string;
  route: string[];
  zk_proof: string;
  qualified: boolean;
  rejection_reason?: string;
}

export interface ExecutionStep {
  step_number: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  via?: string;
  source_tx?: string;
  dest_tx?: string;
  source_chain?: string;
  dest_chain?: string;
  amount?: string;
  fee?: string;
  timestamp?: string;
}

export interface IntentState {
  // Intent data
  intentId: string | null;
  commitment: string | null;
  encryptedPayload: string | null;
  originalText: string | null;
  parsedIntent: ParsedIntent | null;
  
  // Auction data
  auctionStatus: 'idle' | 'pending' | 'completed';
  solverBids: SolverBid[];
  winner: SolverBid | null;
  
  // Authorization
  authorizationStatus: 'idle' | 'pending' | 'completed';
  authorizationTx: string | null;
  
  // Execution data
  executionStatus: 'idle' | 'pending' | 'in-progress' | 'completed' | 'failed';
  executionSteps: ExecutionStep[];
  finalResult: {
    initial_assets: string;
    total_gas_fees: string;
    final_position: string;
    expected_monthly_yield: string;
    net_return: string;
  } | null;
  
  // ZK Proofs
  zkProofs: {
    type: string;
    hash: string;
    tx: string;
    verifier: string;
    status: 'pending' | 'verified';
    block?: string;
  }[];
  
  // Actions
  setIntent: (data: {
    intentId: string;
    commitment: string;
    encryptedPayload: string;
    originalText: string;
    parsedIntent: ParsedIntent;
  }) => void;
  
  setAuctionResults: (bids: SolverBid[], winner: SolverBid) => void;
  
  setAuthorization: (tx: string) => void;
  
  startExecution: () => void;
  
  updateExecutionStep: (stepNumber: number, status: ExecutionStep['status'], data?: Partial<ExecutionStep>) => void;
  
  setFinalResult: (result: IntentState['finalResult']) => void;
  
  addZkProof: (proof: IntentState['zkProofs'][0]) => void;
  
  reset: () => void;
}

const initialState = {
  intentId: null,
  commitment: null,
  encryptedPayload: null,
  originalText: null,
  parsedIntent: null,
  auctionStatus: 'idle' as const,
  solverBids: [],
  winner: null,
  authorizationStatus: 'idle' as const,
  authorizationTx: null,
  executionStatus: 'idle' as const,
  executionSteps: [],
  finalResult: null,
  zkProofs: [],
};

export const useIntentStore = create<IntentState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setIntent: (data) => set({
        intentId: data.intentId,
        commitment: data.commitment,
        encryptedPayload: data.encryptedPayload,
        originalText: data.originalText,
        parsedIntent: data.parsedIntent,
        auctionStatus: 'pending',
      }),
  
  setAuctionResults: (bids, winner) => set({
    solverBids: bids,
    winner,
    auctionStatus: 'completed',
  }),
  
  setAuthorization: (tx) => set({
    authorizationTx: tx,
    authorizationStatus: 'completed',
  }),
  
  startExecution: () => set({
    executionStatus: 'in-progress',
    executionSteps: [
      {
        step_number: 1,
        description: 'Bridge USDC (Arbitrum → Optimism)',
        status: 'pending',
        via: 'Avail Nexus',
        source_chain: 'Arbitrum',
        dest_chain: 'Optimism',
      },
      {
        step_number: 2,
        description: 'Bridge USDT (Polygon → Optimism)',
        status: 'pending',
        via: 'Avail Nexus',
        source_chain: 'Polygon',
        dest_chain: 'Optimism',
      },
      {
        step_number: 3,
        description: 'Swap USDT → USDC (Optimism)',
        status: 'pending',
        via: 'Uniswap V3',
      },
      {
        step_number: 4,
        description: 'Supply to Morpho (Optimism)',
        status: 'pending',
      },
    ],
  }),
  
  updateExecutionStep: (stepNumber, status, data) => set((state) => ({
    executionSteps: state.executionSteps.map((step) =>
      step.step_number === stepNumber
        ? { ...step, status, ...data, timestamp: new Date().toISOString() }
        : step
    ),
  })),
  
  setFinalResult: (result) => set({
    finalResult: result,
    executionStatus: 'completed',
  }),
  
  addZkProof: (proof) => set((state) => ({
    zkProofs: [...state.zkProofs, proof],
  })),
  
  reset: () => set(initialState),
    }),
    {
      name: 'intent-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
