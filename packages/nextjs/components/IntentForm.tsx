"use client";

import { useState } from "react";
import { submitIntent, type IntentResponse } from "../lib/apiClient";

interface IntentFormProps {
  onParsed: (data: IntentResponse) => void;
}

export default function IntentForm({ onParsed }: IntentFormProps) {
  const [text, setText] = useState(
    "Use all my stablecoins for 3 months, highest APY, tolerate 3% gas"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await submitIntent(text);
      onParsed(result);
    } catch (err: any) {
      setError(err.message || "Failed to parse intent");
      console.error("Intent parsing error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border-2 border-base-300 rounded-2xl bg-base-100">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">📝 Step 1: Describe Your Intent</h2>
        <p className="text-sm opacity-70">
          Tell us what you want to do in natural language
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Natural Language Intent</label>
        <textarea
          className="w-full p-4 rounded-xl border-2 border-base-300 bg-base-200 focus:border-primary focus:outline-none transition-colors min-h-[120px]"
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g., Swap 1000 USDC to ETH with lowest fees"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error text-error">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      <button
        className="btn btn-primary w-full"
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span>
            Parsing Intent...
          </>
        ) : (
          "Parse Intent & Run Auction"
        )}
      </button>

      <div className="text-xs opacity-60 space-y-1">
        <p>💡 Try these examples:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"Use all my stablecoins for 3 months, highest APY"</li>
          <li>"Swap 1000 USDC to ETH with lowest gas fees"</li>
          <li>"Provide liquidity on Uniswap, balanced risk"</li>
        </ul>
      </div>
    </div>
  );
}
