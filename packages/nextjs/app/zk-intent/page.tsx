"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import IntentForm from "~~/components/IntentForm";
import ParsedIntentPanel from "~~/components/ParsedIntentPanel";
import AuctionPanel from "~~/components/AuctionPanel";
import ExecutionPanel from "~~/components/ExecutionPanel";
import ProofCard from "~~/components/ProofCard";
import type { ParsedIntentResponse, AuctionResponse, ExecutionResponse } from "~~/lib/apiClient";
import { useIntentStore } from "~~/lib/intentStore";

const ZKIntentPage: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [parsedIntent, setParsedIntent] = useState<ParsedIntentResponse | null>(null);
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);

  // Use Zustand store
  const { setIntent, setAuctionResults, setAuthorization, winner, authorizationStatus } = useIntentStore();

  // Sync parsed intent to store
  useEffect(() => {
    if (parsedIntent?.intent) {
      setIntent({
        intentId: parsedIntent.intent_commitment,
        commitment: parsedIntent.intent_commitment,
        encryptedPayload: parsedIntent.encrypted_payload || "0x" + "a".repeat(128),
        originalText: parsedIntent.original_text || "",
        parsedIntent: parsedIntent.intent,
      });
    }
  }, [parsedIntent, setIntent]);

  // Sync auction results to store
  useEffect(() => {
    if (auction?.auction) {
      const bids = auction.auction.bids.map(bid => ({
        ...bid,
        solver_address: bid.solver_id === "solver_a" ? "0xBob1234567890123456789012345678901234" : "0xCharlie567890123456789012345678905678",
      }));
      const winningBid = bids.find(b => b.solver_id === auction.auction.winner_id);
      if (winningBid) {
        setAuctionResults(bids, winningBid);
      }
    }
  }, [auction, setAuctionResults]);

  const handleReset = () => {
    setParsedIntent(null);
    setAuction(null);
    setAuthorized(false);
    setExecutionResult(null);
    useIntentStore.getState().reset();
  };

  const handleAuthorize = () => {
    setAuthorized(true);
    setAuthorization("0xauthorization_tx_hash_" + Date.now());
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

            {/* Multi-Role Demo Links */}
            {parsedIntent && (
              <div className="mt-6 p-4 bg-info/10 border border-info rounded-xl">
                <p className="font-semibold mb-3 flex items-center justify-center gap-2">
                  <span className="text-2xl">🎭</span>
                  <span>Multi-Role Demo: Open These Pages in Separate Tabs</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <a href="/zk-intent/parsing" target="_blank" rel="noreferrer" className="btn btn-sm btn-info">
                    🤖 Parsing Agent
                  </a>
                  <a href="/zk-intent/solvers/bob" target="_blank" rel="noreferrer" className="btn btn-sm btn-success">
                    🏆 Solver Bob (Qualified)
                  </a>
                  <a href="/zk-intent/solvers/charlie" target="_blank" rel="noreferrer" className="btn btn-sm btn-success">
                    🏆 Solver Charlie (Qualified)
                  </a>
                  <a href="/zk-intent/solvers/eve" target="_blank" rel="noreferrer" className="btn btn-sm btn-warning">
                    ⛔ Solver Eve (Privacy Demo)
                  </a>
                  <a href="/zk-intent/auction" target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
                    🎯 Auction Dashboard
                  </a>
                  <a href="/zk-intent/execution" target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                    🚀 Execution Monitor
                  </a>
                </div>
                <p className="text-xs opacity-70 mt-2">
                  💡 Tip: Open each page in a new tab to see different perspectives simultaneously
                </p>
              </div>
            )}
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
                onAuthorized={handleAuthorize}
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
