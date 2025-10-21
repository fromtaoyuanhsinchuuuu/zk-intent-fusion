"use client";

import { useState } from "react";
import { parseIntentWithAgent, type ParsedIntentResponse } from "../lib/apiClient";

interface IntentFormProps {
  onParsed: (data: ParsedIntentResponse) => void;
  userAddress?: string;
}

export default function IntentForm({ onParsed, userAddress }: IntentFormProps) {
  const [text, setText] = useState(
    "Supply 500 USDC on Morpho with highest APY on Optimism"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [source, setSource] = useState<"uAgent" | "fallback" | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSource(null);
    
    try {
      const result = await parseIntentWithAgent(text, userAddress || "0xAlice");
      
      // Show which parser was used
      if (result.source === "uAgent") {
        setSource("uAgent");
        console.log("✅ Parsed by Fetch.ai uAgent");
      } else {
        setSource("fallback");
        console.log("ℹ️ Parsed by fallback system");
      }
      
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

      {source && (
        <div className={`p-3 rounded-lg text-sm ${
          source === "uAgent" 
            ? "bg-success/10 border border-success text-success" 
            : "bg-info/10 border border-info text-info"
        }`}>
          {source === "uAgent" ? (
            <span>✅ Parsed by Fetch.ai uAgent</span>
          ) : (
            <span>ℹ️ Parsed by fallback system (uAgent unavailable)</span>
          )}
        </div>
      )}

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
          "Parse Intent"
        )}
      </button>

      <div className="text-xs opacity-60 space-y-1">
        <p>💡 Try these examples:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"Supply 500 USDC on Morpho with highest APY on Optimism"</li>
          <li>"Swap 1000 USDC to ETH with lowest gas fees"</li>
          <li>"Bridge 200 USDT from Arbitrum to Base"</li>
        </ul>
      </div>
    </div>
  );
}
