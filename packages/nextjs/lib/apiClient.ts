/**
 * API client for communicating with the solver backend
 */

import { CONFIG } from "../app/api/config";

const API_BASE = CONFIG.solverApiBase;

export interface ExecutionPlan {
  solver: string;
  protocol: string;
  route: string;
  apy_bps10: number;
  gas_usd: number;
  estimated_duration: number;
  steps: string[];
}

export interface SolverBid {
  solver: string;
  proof: string;
  claimed_apy_bps10: number;
  claimed_gas_usd: number;
  valid: boolean;
  plan?: ExecutionPlan;
  timestamp?: number;
}

export interface IntentResponse {
  intent_commitment: string;
  parsed_intent?: {
    commitment: string;
    user: string;
    action: string;
    strategy: string;
    tokens: Array<{
      symbol: string;
      chain: string;
      address: string;
      amount?: string;
    }>;
    duration_days: number;
    min_apy_bps: number;
    max_gas_usd: number;
    timestamp: number;
  };
  public_metadata: {
    action: string;
    strategy: string;
    duration: string;
    estimated_total: string;
    max_gas: string;
    timestamp: number;
  };
  auction: {
    intent_commitment: string;
    bids: SolverBid[];
    winner: SolverBid;
    stats: any;
  };
  status: string;
}

export interface AuthResponse {
  ok: boolean;
  intent_commitment: string;
  authorized_solver: string;
  message: string;
}

export interface ExecutionResponse {
  intent_commitment: string;
  txs: string[];
  totalGas: number;
  finalPosition: {
    protocol: string;
    chain: string;
    amount: string;
    amount_usd: number;
    position_type: string;
    apy: number;
    timestamp: number;
  };
  proof: string;
  finalBalanceCommitment: string;
  proofTx: string;
  status: string;
}

export interface ParsedIntentResponse {
  intent: {
    user: string;
    action: string;
    tokens: Array<{
      symbol: string;
      chain: string;
      amount: number;
      address: string;
    }>;
    total_value_usd: number;
    duration_days: number;
    strategy: string;
    max_gas_usd: number;
    timestamp: number;
    commitment: string;
  };
  public_metadata: {
    action: string;
    strategy: string;
    duration: string;
    estimated_total: string;
    max_gas: string;
    timestamp: number;
  };
  status: string;
}

export interface AuctionResponse {
  intent_commitment: string;
  auction: {
    intent_commitment: string;
    bids: SolverBid[];
    winner: SolverBid;
    stats: any;
  };
  status: string;
}

export async function parseIntent(nl: string, user: string = "0xAlice"): Promise<ParsedIntentResponse> {
  const response = await fetch(
    `${API_BASE}/parse-intent?nl=${encodeURIComponent(nl)}&user=${encodeURIComponent(user)}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to parse intent");
  }
  
  return response.json();
}

export async function runAuction(commitment: string): Promise<AuctionResponse> {
  const response = await fetch(
    `${API_BASE}/run-auction?commitment=${encodeURIComponent(commitment)}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to run auction");
  }
  
  return response.json();
}

export async function submitIntent(nl: string, user: string = "0xAlice"): Promise<IntentResponse> {
  const response = await fetch(
    `${API_BASE}/submit-intent?nl=${encodeURIComponent(nl)}&user=${encodeURIComponent(user)}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to submit intent");
  }
  
  return response.json();
}

export async function authorize(intentCommitment: string, signature: string = ""): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE}/authorize?commitment=${encodeURIComponent(intentCommitment)}&signature=${encodeURIComponent(signature)}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to authorize");
  }
  
  return response.json();
}

export async function execute(intentCommitment: string): Promise<ExecutionResponse> {
  const response = await fetch(
    `${API_BASE}/execute?commitment=${encodeURIComponent(intentCommitment)}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to execute");
  }
  
  return response.json();
}

export async function getStatus(intentCommitment: string): Promise<any> {
  const response = await fetch(
    `${API_BASE}/status/${encodeURIComponent(intentCommitment)}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to get status");
  }
  
  return response.json();
}

export async function listIntents(): Promise<any> {
  const response = await fetch(`${API_BASE}/intents`);
  
  if (!response.ok) {
    throw new Error("Failed to list intents");
  }
  
  return response.json();
}
