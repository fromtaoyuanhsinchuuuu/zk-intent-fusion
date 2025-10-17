"use client";

import { authorize } from "../lib/apiClient";
import { useState } from "react";

interface AuctionPanelProps {
  auction: any;
  onAuthorized: () => void;
}

export default function AuctionPanel({ auction, onAuthorized }: AuctionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  if (!auction) return null;

  const { bids, winner, intent_commitment, stats } = auction;

  const handleAuthorize = async () => {
    setLoading(true);
    setError("");

    try {
      await authorize(intent_commitment);
      onAuthorized();
    } catch (err: any) {
      setError(err.message || "Failed to authorize");
      console.error("Authorization error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border-2 border-base-300 rounded-2xl bg-base-100">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">🏆 Step 2: Solver Auction Results</h2>
        <p className="text-sm opacity-70">
          Multiple solvers competed to optimize your intent with ZK proofs
        </p>
      </div>

      {/* Auction Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-base-200">
          <div>
            <div className="text-xs opacity-60">Total Bids</div>
            <div className="text-2xl font-bold">{stats.total_bids}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Valid Bids</div>
            <div className="text-2xl font-bold text-success">{stats.valid_bids}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">APY Range</div>
            <div className="text-sm font-bold">
              {stats.apy_range?.min?.toFixed(1)}% - {stats.apy_range?.max?.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Bids List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm opacity-70">Solver Bids</h3>
        <div className="space-y-2">
          {bids.map((bid: any, i: number) => (
            <div
              key={i}
              className={`p-4 rounded-xl border-2 transition-all ${
                bid.solver === winner.solver
                  ? "border-success bg-success/10"
                  : bid.valid
                  ? "border-base-300 bg-base-200"
                  : "border-error/30 bg-error/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {bid.solver === "0xSolverA" && "🔷 Morpho Optimizer"}
                      {bid.solver === "0xSolverB" && "🔶 Aave Efficiency"}
                      {!["0xSolverA", "0xSolverB"].includes(bid.solver) && bid.solver}
                    </span>
                    {bid.solver === winner.solver && (
                      <span className="badge badge-success badge-sm">WINNER</span>
                    )}
                  </div>
                  
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="opacity-60">APY:</span>{" "}
                      <span className="font-semibold text-success">
                        {(bid.claimed_apy_bps10 / 10).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="opacity-60">Gas:</span>{" "}
                      <span className="font-semibold">${bid.claimed_gas_usd.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Execution Trace - Modern Arrow Flow */}
                  {bid.plan && (
                    <div className="mt-3 p-3 rounded-lg bg-base-300/50 space-y-2">
                      <div className="text-xs font-semibold opacity-70 flex items-center gap-1">
                        <span>🛣️ Execution Trace</span>
                        <span className="badge badge-xs">{bid.plan.protocol}</span>
                      </div>
                      <div className="text-xs opacity-80 mb-2">
                        <strong>Route:</strong> {bid.plan.route}
                      </div>
                      
                      {/* Arrow-based Flow */}
                      <div className="space-y-0">
                        {bid.plan.steps.map((step: string, idx: number) => (
                          <div key={idx}>
                            <div className="flex items-start gap-2.5">
                              <div className="flex flex-col items-center min-w-[20px]">
                                <div className="badge badge-xs badge-outline w-5 h-5 flex items-center justify-center font-bold">
                                  {idx + 1}
                                </div>
                                {idx < bid.plan.steps.length - 1 && (
                                  <div className="text-primary text-base leading-tight my-0.5">↓</div>
                                )}
                              </div>
                              <div className="flex-1 text-xs opacity-80 pt-0.5">{step}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs opacity-60 pt-2 border-t border-base-content/10 flex items-center gap-3">
                        <span>⏱️ {bid.plan.estimated_duration}s</span>
                        <span>•</span>
                        <span>📊 {bid.plan.protocol}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs opacity-50">
                    Proof: <code className="bg-base-300 px-1 rounded">{bid.proof.slice(0, 16)}...</code>
                  </div>
                </div>

                <div>
                  {bid.valid ? (
                    <span className="text-success text-2xl">✅</span>
                  ) : (
                    <span className="text-error text-2xl">❌</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winner Highlight */}
      <div className="p-4 rounded-xl bg-success/20 border-2 border-success space-y-3">
        <div className="text-sm font-semibold opacity-70 mb-2">🎉 Selected Winner</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">
              {winner.solver === "0xSolverA" && "Morpho Optimizer"}
              {winner.solver === "0xSolverB" && "Aave Efficiency Optimizer"}
            </div>
            <div className="text-sm">
              APY: <span className="font-bold">{(winner.claimed_apy_bps10 / 10).toFixed(1)}%</span>
              {" • "}
              Gas: <span className="font-bold">${winner.claimed_gas_usd.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Winner's Execution Plan - Modern Arrow Flow */}
        {winner.plan && (
          <div className="mt-3 p-4 rounded-lg bg-base-100/80 space-y-3">
            <div className="text-sm font-semibold flex items-center gap-2">
              <span>📋 Winning Execution Plan</span>
              <span className="badge badge-success badge-sm">{winner.plan.protocol.toUpperCase()}</span>
            </div>
            <div className="text-sm">
              <strong className="opacity-70">Route:</strong> {winner.plan.route}
            </div>
            
            {/* Arrow-based Flow with Enhanced Visual */}
            <div className="space-y-2 mt-3">
              <div className="text-xs font-semibold opacity-60 mb-2">Execution Steps:</div>
              {winner.plan.steps.map((step: string, idx: number) => (
                <div key={idx}>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="badge badge-success badge-sm min-w-[24px] h-[24px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                      {idx < winner.plan.steps.length - 1 && (
                        <div className="flex flex-col items-center my-1">
                          <div className="text-success text-lg leading-none">↓</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="text-sm font-medium">{step}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-xs opacity-60 pt-3 border-t border-base-content/10 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                <strong>{winner.plan.estimated_duration}s</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>📊</span>
                <strong>{winner.plan.protocol}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>💰</span>
                <strong>${winner.claimed_gas_usd.toFixed(2)} gas</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error text-error">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {/* Authorization Button */}
      <button
        className="btn btn-primary w-full"
        onClick={handleAuthorize}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span>
            Authorizing...
          </>
        ) : (
          "✓ Authorize Execution (via Vincent)"
        )}
      </button>

      <div className="text-xs opacity-60">
        🔒 Authorization uses Vincent/Lit Protocol for secure access control (MVP: mock)
      </div>
    </div>
  );
}
