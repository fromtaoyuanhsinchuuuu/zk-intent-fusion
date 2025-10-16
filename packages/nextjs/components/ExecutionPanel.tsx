"use client";

import { useState } from "react";
import { execute, type ExecutionResponse } from "../lib/apiClient";

interface ExecutionPanelProps {
  commitment: string;
  onExecuted: (result: ExecutionResponse) => void;
}

export default function ExecutionPanel({ commitment, onExecuted }: ExecutionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ExecutionResponse | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setError("");

    try {
      const execResult = await execute(commitment);
      setResult(execResult);
      onExecuted(execResult);
    } catch (err: any) {
      setError(err.message || "Failed to execute");
      console.error("Execution error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border-2 border-base-300 rounded-2xl bg-base-100">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">⚡ Step 3: Execute Intent</h2>
        <p className="text-sm opacity-70">
          Execute cross-chain transactions via Avail Nexus
        </p>
      </div>

      {!result ? (
        <>
          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error text-error">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <button
            className="btn btn-primary w-full btn-lg"
            onClick={handleExecute}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Executing via Avail Nexus...
              </>
            ) : (
              "🚀 Execute Intent"
            )}
          </button>

          <div className="text-xs opacity-60 space-y-1">
            <p>This will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Bridge assets across chains via Avail Nexus</li>
              <li>Execute optimal route on target protocols</li>
              <li>Generate ZK proof of execution</li>
              <li>Record verification on-chain</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Final Position */}
          <div className="p-4 rounded-xl bg-success/10 border-2 border-success">
            <div className="text-sm font-semibold opacity-70 mb-2">✅ Execution Complete</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-70">Protocol:</span>
                <span className="font-bold capitalize">{result.finalPosition.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Chain:</span>
                <span className="font-bold capitalize">{result.finalPosition.chain}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Amount:</span>
                <span className="font-bold">{result.finalPosition.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">APY:</span>
                <span className="font-bold text-success">{result.finalPosition.apy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Total Gas:</span>
                <span className="font-bold">${result.totalGas.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm opacity-70">Transactions</h3>
            <div className="space-y-1">
              {result.txs.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-base-200 text-sm"
                >
                  <span className="opacity-60">{i + 1}.</span>
                  <code className="flex-1 text-xs">{tx}</code>
                  <span className="text-success">✓</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proof Information */}
          <div className="p-4 rounded-xl bg-base-200 space-y-2">
            <div className="text-sm font-semibold">🔐 ZK Proof Generated</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="opacity-60">Proof:</span>
                <code className="bg-base-300 px-2 py-1 rounded">{result.proof.slice(0, 20)}...</code>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Balance Commitment:</span>
                <code className="bg-base-300 px-2 py-1 rounded">
                  {result.finalBalanceCommitment.slice(0, 20)}...
                </code>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Verifier Tx:</span>
                <code className="bg-base-300 px-2 py-1 rounded">{result.proofTx.slice(0, 20)}...</code>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center text-sm opacity-70">
            🎉 Your intent has been successfully executed and verified on-chain!
          </div>
        </div>
      )}
    </div>
  );
}
