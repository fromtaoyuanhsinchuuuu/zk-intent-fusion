"use client";

import { useEffect, useState } from "react";
import { useIntentStore, type SolverBid } from "~~/lib/intentStore";
import { useCrossTabSync } from "~~/hooks/useCrossTabSync";

export default function SolverBobPage() {
  // Enable cross-tab sync
  useCrossTabSync();
  
  const { intentId, parsedIntent, solverBids } = useIntentStore();
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [showDecryption, setShowDecryption] = useState(false);

  const bobBid: SolverBid = solverBids.find(bid => bid.solver_id === "solver_a") || {
    solver_id: "solver_a",
    solver_name: "Bob",
    solver_address: "0xBob1234567890123456789012345678901234",
    strategy: "Supply to Morpho (Optimism)",
    expected_apy: 12.5,
    estimated_gas: 12.5,
    gas_percentage: 2.5,
    protocol: "Morpho",
    target_chain: "Optimism",
    route: [
      "Bridge USDC (Arb → Opt) via Nexus",
      "Bridge USDT (Poly → Opt) via Nexus",
      "Swap USDT → USDC on Optimism",
      "Supply 499.5 USDC to Morpho",
    ],
    zk_proof: "0x8f3c2e9b4d1a6f8c5e2d7b3f9a1c6e8d",
    qualified: true,
  };

  useEffect(() => {
    if (parsedIntent && !showDecryption) {
      // Simulate decryption delay
      setTimeout(() => setShowDecryption(true), 1000);
    }
  }, [parsedIntent, showDecryption]);

  useEffect(() => {
    if (solverBids.length > 0) {
      setBidSubmitted(true);
    }
  }, [solverBids]);

  if (!parsedIntent) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold mb-4">Solver Bob</h1>
          <p className="text-lg text-base-content/70">Waiting for intent broadcast...</p>
          <div className="mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-success to-info rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🏆</div>
          <div>
            <h1 className="text-3xl font-bold">Solver Bob</h1>
            <p className="text-sm opacity-90">zkTLS Verified Solver</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title text-success">✅ Status: Qualified</h2>
          <div className="stats stats-horizontal shadow mt-2">
            <div className="stat">
              <div className="stat-title">AUM</div>
              <div className="stat-value text-success text-2xl">$5.2M</div>
            </div>
            <div className="stat">
              <div className="stat-title">Track Record</div>
              <div className="stat-value text-success text-2xl">98.5%</div>
            </div>
          </div>
          <p className="text-sm text-base-content/70 mt-2">
            Connected: <code className="bg-base-200 px-2 py-1 rounded">{bobBid.solver_address}</code>
          </p>
        </div>
      </div>

      {/* New Intent Received */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📩</span>
            <h2 className="card-title">New Intent Received</h2>
          </div>
          {intentId && (
            <p className="text-sm text-base-content/70">
              Intent ID: <code className="bg-base-200 px-2 py-1 rounded">{intentId.slice(0, 30)}...</code>
            </p>
          )}
        </div>
      </div>

      {/* Decrypted Intent */}
      {showDecryption ? (
        <div className="card bg-base-100 shadow-xl mb-6 border-2 border-success">
          <div className="card-body">
            <h2 className="card-title text-success">🔓 Decrypted Intent (You can see the plaintext)</h2>
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
              <span>zkTLS verification passed - Access granted</span>
            </div>

            <div className="bg-base-200 p-4 rounded-lg mt-4">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-sm mb-1">Goal:</p>
                  <p className="text-lg">{parsedIntent?.goal?.replace("_", " ").toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Assets:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {parsedIntent?.assets?.map((asset, idx) => (
                      <li key={idx}>
                        {(parseInt(asset.amount) / 1000000).toFixed(0)} {asset.token} ({asset.chain})
                      </li>
                    )) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Constraints:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Duration: {parsedIntent?.constraints?.duration || 'N/A'}</li>
                    <li>Max Gas: {parsedIntent?.constraints?.max_gas_tolerance || 'N/A'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">🔐 Decrypting Intent...</h2>
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-md"></span>
              <span>Verifying zkTLS credentials...</span>
            </div>
          </div>
        </div>
      )}

      {/* Bob's Proposal */}
      {showDecryption && (
        <div className="card bg-base-100 shadow-xl mb-6 border-2 border-primary">
          <div className="card-body">
            <h2 className="card-title text-primary">💡 Bob&apos;s Proposal</h2>
            <div className="bg-base-200 p-4 rounded-lg space-y-3">
              <div>
                <p className="font-semibold text-sm mb-1">Strategy:</p>
                <p className="text-lg">{bobBid.strategy}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Expected APY:</p>
                  <p className="text-2xl font-bold text-success">{bobBid.expected_apy}%</p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Estimated Gas:</p>
                  <p className="text-2xl font-bold text-warning">
                    ${bobBid.estimated_gas} ({bobBid.gas_percentage}%)
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Route:</p>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  {bobBid?.route?.map((step, idx) => (
                    <li key={idx} className="text-sm">
                      {step}
                    </li>
                  )) || <li>N/A</li>}
                </ol>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">ZK Proof:</p>
                <code className="bg-base-300 px-2 py-1 rounded text-xs block break-all">
                  {bobBid.zk_proof} ✅
                </code>
              </div>
            </div>

            {!bidSubmitted ? (
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-lg" onClick={() => setBidSubmitted(true)}>
                  Submit Bid: ${bobBid.estimated_gas}
                </button>
              </div>
            ) : (
              <div className="alert alert-success mt-4">
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
                <span className="font-semibold">✅ Bid Submitted Successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {bidSubmitted && (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Bid Submitted to Auction</h3>
            <div className="text-sm">
              Check the{" "}
              <a href="/zk-intent/auction" className="link link-primary" target="_blank" rel="noreferrer">
                Auction Dashboard
              </a>{" "}
              to see the results
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
