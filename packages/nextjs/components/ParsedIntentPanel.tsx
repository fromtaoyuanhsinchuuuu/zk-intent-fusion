"use client";

import { useState } from "react";
import { runAuction, type AuctionResponse } from "../lib/apiClient";

interface ParsedIntentPanelProps {
  parsedIntent: any;
  onAuctionComplete?: (result: AuctionResponse) => void;
}

export default function ParsedIntentPanel({ parsedIntent, onAuctionComplete }: ParsedIntentPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleRunAuction = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await runAuction(parsedIntent.commitment);
      if (onAuctionComplete) {
        onAuctionComplete(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to run auction");
      console.error("Auction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border-2 border-primary/50 rounded-2xl bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">📊 Parsed Intent (Structured JSON)</h2>
          <p className="text-sm opacity-70">
            Your natural language was converted to this structured format
          </p>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "▼ Collapse" : "▶ Expand"}
        </button>
      </div>

      {expanded && (
        <>
          {/* Highlight Key Fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-base-200">
              <div className="text-xs opacity-60">Action</div>
              <div className="font-bold text-primary">
                {parsedIntent.action?.toUpperCase() || "N/A"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-base-200">
              <div className="text-xs opacity-60">Strategy</div>
              <div className="font-bold text-secondary">
                {parsedIntent.strategy?.replace("_", " ").toUpperCase() || "N/A"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-base-200">
              <div className="text-xs opacity-60">Duration</div>
              <div className="font-bold">
                {parsedIntent.duration_days ? `${parsedIntent.duration_days} days` : "N/A"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-base-200">
              <div className="text-xs opacity-60">Max Gas</div>
              <div className="font-bold">
                ${parsedIntent.max_gas_usd?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Full JSON Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Complete Intent Object</label>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(parsedIntent, null, 2));
                }}
              >
                📋 Copy JSON
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-base-300 overflow-x-auto text-xs border border-base-content/10">
              <code>{JSON.stringify(parsedIntent, null, 2)}</code>
            </pre>
          </div>

          {/* Token Details */}
          {parsedIntent.tokens && parsedIntent.tokens.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Token Specifications</label>
              <div className="space-y-2">
                {parsedIntent.tokens.map((token: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-base-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold">{token.symbol}</div>
                      <div className="text-xs opacity-60">
                        Chain: {token.chain} • Amount: {token.amount || "auto"}
                      </div>
                    </div>
                    <div className="text-xs badge badge-outline">
                      {token.address?.slice(0, 6)}...{token.address?.slice(-4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 text-xs opacity-60 border-t border-base-content/10">
            <strong>Intent Commitment:</strong>{" "}
            <code className="bg-base-300 px-2 py-1 rounded">
              {parsedIntent.commitment}
            </code>
          </div>

          {/* Run Auction Button */}
          {onAuctionComplete && (
            <>
              {error && (
                <div className="p-4 rounded-xl bg-error/10 border border-error text-error">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}
              
              <button
                className="btn btn-success w-full mt-4"
                onClick={handleRunAuction}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Running Auction...
                  </>
                ) : (
                  "🏆 Run Solver Auction"
                )}
              </button>
              
              <div className="text-xs opacity-60 text-center">
                Compete solvers to find the best execution plan
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
