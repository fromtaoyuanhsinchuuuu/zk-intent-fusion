"use client";

import { useIntentStore } from "~~/lib/intentStore";
import { useCrossTabSync } from "~~/hooks/useCrossTabSync";

export default function SolverEvePage() {
  // Enable cross-tab sync
  useCrossTabSync();
  
  const { intentId, encryptedPayload } = useIntentStore();

  if (!encryptedPayload) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-3xl font-bold mb-4">Solver Eve</h1>
          <p className="text-lg text-base-content/70">Waiting for intent broadcast...</p>
          <div className="mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  // Generate fake encrypted data for display
  const encryptedData = encryptedPayload || 
    "0x7a8f3c2e9b4d1a6f8c5e2d7b3f9a1c6e8d4b2a7f5c3e1d9b6a4c8f2e7d5b3a1f9c7e5d3b1a9f7c5e3d1b9a7f5c3e1d9b7a5c3f1e9d7b5a3c1f9e7d5b3a1f9c7e5d3b1a9f7c5e3d1b9a7f5c3e";

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-error to-warning rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">⛔</div>
          <div>
            <h1 className="text-3xl font-bold">Solver Eve</h1>
            <p className="text-sm opacity-90">Not Qualified</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="card bg-base-100 shadow-xl mb-6 border-2 border-error">
        <div className="card-body">
          <h2 className="card-title text-error">❌ Status: Not Verified</h2>
          <div className="stats stats-horizontal shadow mt-2">
            <div className="stat">
              <div className="stat-title">AUM</div>
              <div className="stat-value text-error text-2xl">$100K</div>
              <div className="stat-desc text-error">Below threshold ($1M)</div>
            </div>
            <div className="stat">
              <div className="stat-title">Track Record</div>
              <div className="stat-value text-error text-2xl">N/A</div>
              <div className="stat-desc text-error">Unverified</div>
            </div>
          </div>
          <p className="text-sm text-base-content/70 mt-2">
            Connected: <code className="bg-base-200 px-2 py-1 rounded">0xEve999999999999999999999999999999999</code>
          </p>
        </div>
      </div>

      {/* New Intent Detected */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📩</span>
            <h2 className="card-title">New Intent Detected</h2>
          </div>
          {intentId && (
            <p className="text-sm text-base-content/70">
              Intent ID: <code className="bg-base-200 px-2 py-1 rounded">{intentId.slice(0, 30)}...</code>
            </p>
          )}
        </div>
      </div>

      {/* Encrypted Intent - Cannot Decrypt */}
      <div className="card bg-base-100 shadow-xl mb-6 border-2 border-warning">
        <div className="card-body">
          <h2 className="card-title text-warning">🔐 Encrypted Intent (Cannot Decrypt)</h2>
          <div className="bg-base-300 p-4 rounded-lg font-mono text-xs break-all leading-relaxed opacity-60">
            {encryptedData}
          </div>
          <div className="alert alert-warning mt-4">
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
            <span>Unable to decrypt - zkTLS verification required</span>
          </div>
        </div>
      </div>

      {/* Access Denied */}
      <div className="card bg-base-100 shadow-xl mb-6 border-2 border-error">
        <div className="card-body">
          <h2 className="card-title text-error">⚠️ Access Denied</h2>
          <div className="alert alert-error">
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
            <span className="font-semibold">zkTLS verification failed</span>
          </div>

          <div className="bg-base-200 p-6 rounded-lg mt-4 space-y-4">
            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-error">❌</span>
                Reason: Insufficient Qualifications
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                <li>Your AUM ($100K) is below the minimum threshold ($1M)</li>
                <li>Your track record is unverified</li>
                <li>You have not passed zkTLS verification</li>
              </ul>
            </div>

            <div className="divider"></div>

            <div className="bg-info/10 border border-info rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span className="text-info">Privacy Protection Demonstration</span>
              </p>
              <p className="text-sm leading-relaxed">
                Even though this intent commitment is publicly visible on-chain, you cannot see the details because you
                don&apos;t meet the qualification criteria. This demonstrates the core innovation of our system:{" "}
                <span className="font-bold text-info">
                  selective disclosure with zero-knowledge proofs ensures that only qualified solvers can access
                  sensitive information
                </span>
                , protecting user privacy and trading strategies from unauthorized access.
              </p>
            </div>

            <div className="bg-warning/10 border border-warning rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span className="text-warning">How zkTLS Works</span>
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                <li>User submits intent → Encrypted with access control conditions</li>
                <li>Intent commitment published on-chain (public but encrypted)</li>
                <li>Solver attempts to access → zkTLS verification required</li>
                <li>
                  Only solvers with valid credentials (AUM &gt; $1M, proven track record) can decrypt and view intent
                </li>
                <li>Unqualified solvers (like Eve) see only encrypted data</li>
              </ol>
            </div>
          </div>

          <div className="card-actions justify-center mt-6">
            <button className="btn btn-disabled btn-lg" disabled>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Cannot Participate
            </button>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-medium">🔬 Technical Details: Why This Matters</div>
        <div className="collapse-content">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Traditional Systems:</p>
              <ul className="list-disc list-inside space-y-1 text-base-content/70">
                <li>Either fully public (no privacy) or fully private (no transparency)</li>
                <li>Solvers can front-run or extract MEV from visible intents</li>
                <li>Users must trust centralized gatekeepers</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">ZK-Intent Fusion Approach:</p>
              <ul className="list-disc list-inside space-y-1 text-success">
                <li>✅ Intent commitment is public (verifiable, auditable)</li>
                <li>✅ Intent details are encrypted (private from unqualified parties)</li>
                <li>✅ Access control enforced by zkTLS (no centralized trust)</li>
                <li>✅ Only qualified solvers compete (reduces spam and manipulation)</li>
                <li>✅ User privacy protected throughout the entire flow</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-info">
                <li>Protects user trading strategies from MEV bots</li>
                <li>Ensures only reputable solvers can participate</li>
                <li>Maintains transparency through verifiable proofs</li>
                <li>Decentralized access control (no single point of failure)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with qualified solvers */}
      <div className="alert alert-info mt-6">
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
          <h3 className="font-bold">Compare with Qualified Solvers</h3>
          <div className="text-sm">
            Check out{" "}
            <a href="/zk-intent/solvers/bob" className="link link-primary" target="_blank" rel="noreferrer">
              Solver Bob
            </a>{" "}
            or{" "}
            <a href="/zk-intent/solvers/charlie" className="link link-primary" target="_blank" rel="noreferrer">
              Solver Charlie
            </a>{" "}
            to see what qualified solvers can see and do.
          </div>
        </div>
      </div>
    </div>
  );
}
