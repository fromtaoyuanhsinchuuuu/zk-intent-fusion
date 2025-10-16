"use client";

import { useState } from "react";
import type { NextPage } from "next";
import IntentForm from "~~/components/IntentForm";
import AuctionPanel from "~~/components/AuctionPanel";
import ExecutionPanel from "~~/components/ExecutionPanel";
import ProofCard from "~~/components/ProofCard";
import type { IntentResponse, ExecutionResponse } from "~~/lib/apiClient";

const Home: NextPage = () => {
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);

  const handleReset = () => {
    setIntent(null);
    setAuthorized(false);
    setExecutionResult(null);
  };

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
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <ul className="steps steps-horizontal w-full">
              <li className={`step ${intent ? "step-primary" : ""}`}>Parse Intent</li>
              <li className={`step ${intent ? "step-primary" : ""}`}>Auction</li>
              <li className={`step ${authorized ? "step-primary" : ""}`}>Authorize</li>
              <li className={`step ${executionResult ? "step-primary" : ""}`}>Execute</li>
              <li className={`step ${executionResult ? "step-primary" : ""}`}>Verify</li>
            </ul>
          </div>

          {/* Main Flow */}
          <div className="space-y-6">
            {/* Step 1: Intent Form */}
            <IntentForm onParsed={(res) => {
              setIntent(res);
              setAuthorized(false);
              setExecutionResult(null);
            }} />

            {/* Step 2: Auction Results */}
            {intent && !authorized && (
              <AuctionPanel
                auction={intent.auction}
                onAuthorized={() => setAuthorized(true)}
              />
            )}

            {/* Step 3: Execution */}
            {authorized && !executionResult && (
              <ExecutionPanel
                commitment={intent!.intent_commitment}
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
            {intent && (
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

export default Home;
