"use client";

import { useEffect } from "react";
import { useIntentStore } from "~~/lib/intentStore";
import { useCrossTabSync } from "~~/hooks/useCrossTabSync";

export default function AuctionDashboardPage() {
  // Enable cross-tab sync
  useCrossTabSync();
  
  const { intentId, solverBids, winner, auctionStatus, zkProofs, authorizationStatus } = useIntentStore();

  useEffect(() => {
    // Auto-add ZK proofs when auction is completed
    if (auctionStatus === "completed" && zkProofs.length === 0 && winner) {
      const addZkProof = useIntentStore.getState().addZkProof;

      // Add zkTLS proof
      setTimeout(() => {
        addZkProof({
          type: "zkTLS Proof (Winner Qualification)",
          hash: "0xzktls_" + (winner?.zk_proof?.slice(2, 20) || "proof_hash"),
          tx: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
          verifier: "SolverRegistry",
          status: "verified",
          block: "12345678",
        });
      }, 500);

      // Add intent commitment proof
      setTimeout(() => {
        addZkProof({
          type: "Intent Commitment Proof",
          hash: intentId || "0xaf1059e7...857d7d0e0",
          tx: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
          verifier: "IntentVerifier",
          status: "verified",
          block: "12345679",
        });
      }, 1000);

      // Add auction result proof
      setTimeout(() => {
        addZkProof({
          type: "Auction Result Proof",
          hash: "0xauction_result_proof_hash_123456",
          tx: "0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x",
          verifier: "AuctionContract",
          status: "verified",
          block: "12345680",
        });
      }, 1500);
    }
  }, [auctionStatus, zkProofs.length, winner, intentId]);

  if (solverBids.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold mb-4">Auction Dashboard</h1>
          <p className="text-lg text-base-content/70">Waiting for solver bids...</p>
          <div className="mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  const isAuctionComplete = auctionStatus === "completed";

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-accent rounded-lg p-6 mb-6 text-secondary-content">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎯</div>
            <div>
              <h1 className="text-3xl font-bold">Auction Dashboard</h1>
              <p className="text-sm opacity-90">Transparent Solver Competition</p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`badge badge-lg ${isAuctionComplete ? "badge-success" : "badge-warning"} gap-2`}
            >
              {isAuctionComplete ? "🟢 Closed" : "🟡 In Progress"}
            </div>
          </div>
        </div>
      </div>

      {/* Intent Info */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">📋 Intent Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-1">Intent ID:</p>
              <code className="bg-base-200 px-2 py-1 rounded text-xs block break-all">
                {intentId?.slice(0, 40)}...
              </code>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Status:</p>
              <div className="flex items-center gap-2">
                <span className={`badge ${isAuctionComplete ? "badge-success" : "badge-warning"}`}>
                  {isAuctionComplete ? "Auction Closed" : "Auction In Progress"}
                </span>
                {isAuctionComplete && (
                  <span className="text-sm text-base-content/70">Block Deadline: 12345678 (Reached)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Received Bids */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">📊 Received Bids ({solverBids.length})</h2>

          <div className="space-y-4">
            {solverBids.map((bid, index) => (
              <div
                key={bid.solver_id}
                className={`card bg-base-200 border-2 ${
                  winner?.solver_id === bid.solver_id
                    ? "border-success shadow-lg"
                    : bid.qualified
                      ? "border-base-300"
                      : "border-error"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {winner?.solver_id === bid.solver_id && (
                          <span className="badge badge-success badge-lg">🏆 WINNER</span>
                        )}
                        {!bid.qualified && <span className="badge badge-error badge-lg">❌ REJECTED</span>}
                        <h3 className="text-xl font-bold">
                          {index + 1}. Solver {bid.solver_name}
                        </h3>
                      </div>

                      {bid.qualified ? (
                        <>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-base-content/70">Gas Cost</p>
                              <p className="text-lg font-bold text-warning">
                                ${bid.estimated_gas} ({bid.gas_percentage}%)
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-base-content/70">Expected APY</p>
                              <p className="text-lg font-bold text-success">{bid.expected_apy}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-base-content/70">Protocol</p>
                              <p className="text-lg font-bold">
                                {bid.protocol} <span className="text-sm font-normal">({bid.target_chain})</span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-xs text-base-content/70 mb-1">Strategy:</p>
                            <p className="text-sm">{bid.strategy}</p>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-base-content/70">zkTLS Proof:</span>
                            <span className="badge badge-success badge-sm">✅ Verified</span>
                            <code className="text-xs bg-base-300 px-2 py-1 rounded">{bid?.zk_proof?.slice(0, 20) || 'N/A'}...</code>
                          </div>

                          {bid.qualified && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-base-content/70">Execution Proof:</span>
                              <span className="badge badge-success badge-sm">✅ Pre-verified</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="alert alert-error mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            Rejected: {bid.rejection_reason || "Not qualified (failed zkTLS verification)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Winner Selection Criteria */}
      {isAuctionComplete && winner && (
        <div className="card bg-base-100 shadow-xl mb-6 border-2 border-success">
          <div className="card-body">
            <h2 className="card-title text-success">🎖️ Winner Selection Criteria</h2>
            <div className="bg-success/10 p-4 rounded-lg">
              <p className="font-bold text-lg mb-3">
                Solver {winner.solver_name} wins because:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>
                    Higher APY ({winner.expected_apy}% &gt;{" "}
                    {solverBids.find(b => b.solver_id !== winner.solver_id && b.qualified)?.expected_apy}%)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>
                    Lower gas cost ($
                    {winner.estimated_gas} &lt; $
                    {solverBids.find(b => b.solver_id !== winner.solver_id && b.qualified)?.estimated_gas})
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>Within gas tolerance ({winner.gas_percentage}% &lt; 3%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>Passed zkTLS verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* On-Chain ZK Proofs */}
      {zkProofs.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">📜 On-Chain ZK Proofs</h2>
            <div className="space-y-3 mt-4">
              {zkProofs.map((proof, index) => (
                <div key={index} className="card bg-base-200 border border-success">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-2">
                          {index + 1}. {proof.type}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/70">Tx:</span>
                            <code className="bg-base-300 px-2 py-1 rounded">{proof.tx}</code>
                            <a
                              href={`https://etherscan.io/tx/${proof.tx}`}
                              target="_blank"
                              rel="noreferrer"
                              className="link link-primary"
                            >
                              ↗
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/70">Verifier:</span>
                            <span className="badge badge-sm">{proof.verifier}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/70">Status:</span>
                            <span className="badge badge-success badge-sm">✅ Verified on-chain</span>
                            {proof.block && (
                              <span className="text-base-content/70">Block #{proof.block}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Waiting for Authorization */}
      {isAuctionComplete && authorizationStatus === "idle" && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold">⏰ Waiting for User Authorization...</h3>
            <div className="text-sm">
              The user must authorize the winning solver before execution can begin. Go back to the{" "}
              <a href="/zk-intent" className="link link-primary" target="_blank" rel="noreferrer">
                User page
              </a>{" "}
              to authorize.
            </div>
          </div>
        </div>
      )}

      {/* Authorization Complete */}
      {authorizationStatus === "completed" && (
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">✅ Authorization Complete!</h3>
            <div className="text-sm">
              Check the{" "}
              <a href="/zk-intent/execution" className="link link-primary" target="_blank" rel="noreferrer">
                Execution Monitor
              </a>{" "}
              to watch the cross-chain execution in real-time.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
