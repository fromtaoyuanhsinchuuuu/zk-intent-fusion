"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import IntentForm from "~~/components/IntentForm";
import ParsedIntentPanel from "~~/components/ParsedIntentPanel";
import AuctionPanel from "~~/components/AuctionPanel";
import ExecutionPanel from "~~/components/ExecutionPanel";
import ProofCard from "~~/components/ProofCard";
import type { ParsedIntentResponse, AuctionResponse, ExecutionResponse } from "~~/lib/apiClient";

const ZKIntentPage: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [parsedIntent, setParsedIntent] = useState<ParsedIntentResponse | null>(null);
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);

  const handleReset = () => {
    setParsedIntent(null);
    setAuction(null);
    setAuthorized(false);
    setExecutionResult(null);
  };

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <>
        <div className="flex items-center flex-col grow pt-10">
          <div className="px-5 max-w-5xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ZK-Intent Fusion
              </h1>
              <p className="text-xl opacity-70">
                Cross-chain intent optimization with ZK proofs
              </p>
            </div>

            {/* Connection Required */}
            <div className="p-8 border-2 border-warning rounded-2xl bg-warning/10">
              <div className="text-center space-y-4">
                <div className="text-6xl">🔐</div>
                <h2 className="text-2xl font-bold">Wallet Connection Required</h2>
                <p className="text-lg opacity-70">
                  Please connect your wallet to use ZK-Intent Fusion
                </p>
                <div className="text-sm opacity-60">
                  You need to connect your wallet to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Submit intents from your address</li>
                    <li>Authorize solver execution</li>
                    <li>Sign transactions for on-chain verification</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <p className="text-xs opacity-50">
                    Use the "Connect Wallet" button in the header to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Info Footer */}
            <div className="mt-8 p-4 rounded-xl bg-base-200 text-sm opacity-70">
              <strong>💡 What is ZK-Intent Fusion?</strong>
              <p className="mt-2">
                A cross-chain intent optimization protocol that uses zero-knowledge proofs to securely
                coordinate solver auctions, execute cross-chain transactions via Avail Nexus, and verify
                execution correctness on-chain.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ZK-Intent Fusion
            </h1>
            <p className="text-xl opacity-70">
              Cross-chain intent optimization with ZK proofs
            </p>
            <div className="flex justify-center gap-2 mt-4 text-sm">
              <div className="badge badge-primary">Avail Nexus</div>
              <div className="badge badge-secondary">Vincent Auth</div>
              <div className="badge badge-accent">Noir ZK</div>
              <div className="badge">ASI Chat</div>
            </div>
            <div className="mt-2 text-sm opacity-70">
              Connected: <code className="bg-base-300 px-2 py-1 rounded">{address}</code>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <ul className="steps steps-horizontal w-full">
              <li className={`step ${parsedIntent ? "step-primary" : ""}`}>Parse Intent</li>
              <li className={`step ${auction ? "step-primary" : ""}`}>Auction</li>
              <li className={`step ${authorized ? "step-primary" : ""}`}>Authorize</li>
              <li className={`step ${executionResult ? "step-primary" : ""}`}>Execute</li>
              <li className={`step ${executionResult ? "step-primary" : ""}`}>Verify</li>
            </ul>
          </div>

          {/* Main Flow */}
          <div className="space-y-6">
            {/* Step 1: Intent Form */}
            <IntentForm onParsed={(res) => {
              setParsedIntent(res);
              setAuction(null);
              setAuthorized(false);
              setExecutionResult(null);
            }} />

            {/* Step 1.5: Parsed Intent JSON Display with Run Auction Button */}
            {parsedIntent && !auction && (
              <ParsedIntentPanel 
                parsedIntent={parsedIntent.intent}
                onAuctionComplete={(auctionResult) => {
                  setAuction(auctionResult);
                }}
              />
            )}

            {/* Step 2: Auction Results */}
            {auction && !authorized && (
              <AuctionPanel
                auction={auction.auction}
                onAuthorized={() => setAuthorized(true)}
              />
            )}

            {/* Step 3: Execution */}
            {authorized && !executionResult && (
              <ExecutionPanel
                commitment={auction!.intent_commitment}
                onExecuted={(result) => setExecutionResult(result)}
              />
            )}

            {/* Step 4: Proof Verification */}
            {executionResult && (
              <ProofCard
                proof={{
                  intentCommitment: executionResult.intent_commitment,
                  finalBalanceCommitment: executionResult.finalBalanceCommitment,
                  proofTx: executionResult.proofTx,
                  proof: executionResult.proof
                }}
              />
            )}

            {/* Reset Button */}
            {parsedIntent && (
              <div className="text-center pt-4">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleReset}
                >
                  🔄 Start New Intent
                </button>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-6 rounded-2xl bg-base-200 space-y-3">
            <h3 className="font-bold">🔬 MVP Demo Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-1">✅ Implemented (MVP)</div>
                <ul className="list-disc list-inside opacity-70 space-y-1">
                  <li>Natural language intent parsing</li>
                  <li>Multi-solver auction with ZK proofs</li>
                  <li>Access control (qualified solvers only)</li>
                  <li>Vincent/Lit authorization flow</li>
                  <li>Avail Nexus execution simulation</li>
                  <li>On-chain proof verification</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-1">🚧 Production Roadmap</div>
                <ul className="list-disc list-inside opacity-70 space-y-1">
                  <li>Real Noir/Barretenberg proofs</li>
                  <li>ASI Chat semantic reasoning</li>
                  <li>Live Avail Nexus integration</li>
                  <li>Real Vincent access control</li>
                  <li>Multi-protocol support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZKIntentPage;
