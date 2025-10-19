"use client";

import { useEffect, useState } from "react";
import { useIntentStore } from "~~/lib/intentStore";
import { useCrossTabSync } from "~~/hooks/useCrossTabSync";

export default function ParsingAgentPage() {
  // Enable cross-tab sync
  useCrossTabSync();
  
  const { intentId, commitment, encryptedPayload, originalText, parsedIntent } = useIntentStore();
  const [parsingProgress, setParsingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");

  useEffect(() => {
    if (parsedIntent) {
      // Simulate parsing progress
      const steps = [
        "Detecting tokens...",
        "Detecting chains...",
        "Detecting constraints...",
        "Detecting goal...",
        "Generating JSON...",
        "Encrypting payload...",
      ];

      let progress = 0;
      const interval = setInterval(() => {
        if (progress < steps.length) {
          setCurrentStep(steps[progress]);
          setParsingProgress(((progress + 1) / steps.length) * 100);
          progress++;
        } else {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [parsedIntent]);

  if (!parsedIntent) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold mb-4">Vincent Auth - Parsing Agent</h1>
          <p className="text-lg text-base-content/70">Waiting for intent submission...</p>
          <div className="mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  const isComplete = parsingProgress === 100;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-6 text-primary-content">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🤖</div>
          <div>
            <h1 className="text-3xl font-bold">Vincent Auth - Parsing Agent</h1>
            <p className="text-sm opacity-90">Powered by ASI (Artificial Superintelligence)</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title text-success">
              ✅ Status: Intent {isComplete ? "Processed" : "Processing"}
            </h2>
            <div className="badge badge-info">
              {new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "UTC",
                timeZoneName: "short",
              })}
            </div>
          </div>
          {intentId && (
            <p className="text-sm text-base-content/70">
              Intent ID: <code className="bg-base-200 px-2 py-1 rounded">{intentId.slice(0, 20)}...</code>
            </p>
          )}
        </div>
      </div>

      {/* Original Intent */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">📄 Original Intent (Natural Language)</h2>
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="text-lg italic">&ldquo;{originalText}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Parsing Progress */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">
            🔄 Parsing Status: {isComplete ? "Completed" : "In Progress..."}
          </h2>

          {/* Progress Bar */}
          <div className="mb-4">
            <progress className="progress progress-primary w-full" value={parsingProgress} max="100"></progress>
            <p className="text-sm text-center mt-2">{Math.round(parsingProgress)}%</p>
          </div>

          {/* Parsing Steps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={parsingProgress >= 16.67 ? "text-success" : "text-base-content/50"}>
                {parsingProgress >= 16.67 ? "✅" : "⏳"}
              </span>
              <span className={parsingProgress >= 16.67 ? "" : "text-base-content/50"}>
                Detected tokens: USDC, USDT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={parsingProgress >= 33.34 ? "text-success" : "text-base-content/50"}>
                {parsingProgress >= 33.34 ? "✅" : "⏳"}
              </span>
              <span className={parsingProgress >= 33.34 ? "" : "text-base-content/50"}>
                Detected chains: Arbitrum, Polygon
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={parsingProgress >= 50 ? "text-success" : "text-base-content/50"}>
                {parsingProgress >= 50 ? "✅" : "⏳"}
              </span>
              <span className={parsingProgress >= 50 ? "" : "text-base-content/50"}>
                Detected constraints: {parsedIntent?.constraints?.duration || 'N/A'}, {parsedIntent?.constraints?.max_gas_tolerance || 'N/A'}{" "}
                gas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={parsingProgress >= 66.67 ? "text-success" : "text-base-content/50"}>
                {parsingProgress >= 66.67 ? "✅" : "⏳"}
              </span>
              <span className={parsingProgress >= 66.67 ? "" : "text-base-content/50"}>
                Detected goal: {parsedIntent?.goal?.replace("_", " ").toUpperCase() || 'N/A'}
              </span>
            </div>
          </div>

          {currentStep && !isComplete && (
            <div className="alert alert-info mt-4">
              <span className="loading loading-spinner loading-sm"></span>
              <span>{currentStep}</span>
            </div>
          )}
        </div>
      </div>

      {/* Parsed JSON Intent */}
      {parsingProgress >= 66.67 && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">📋 Parsed JSON Intent</h2>
            <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(parsedIntent, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Encryption Status */}
      {isComplete && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-success">🔐 Encryption Status: Completed</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1">Intent Commitment:</p>
                <code className="bg-base-200 px-3 py-2 rounded text-xs block break-all">{commitment}</code>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Encrypted Payload:</p>
                <code className="bg-base-200 px-3 py-2 rounded text-xs block break-all">{encryptedPayload}</code>
              </div>
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
                <span className="font-semibold">✅ Broadcasted to Solver Network</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {isComplete && (
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
            <h3 className="font-bold">Next Step: Check Solver Perspectives</h3>
            <div className="text-sm">
              Open the following tabs to see how different solvers respond:
              <ul className="list-disc list-inside mt-2">
                <li>
                  <a href="/zk-intent/solvers/bob" className="link link-primary" target="_blank" rel="noreferrer">
                    Solver Bob (Qualified)
                  </a>
                </li>
                <li>
                  <a href="/zk-intent/solvers/charlie" className="link link-primary" target="_blank" rel="noreferrer">
                    Solver Charlie (Qualified)
                  </a>
                </li>
                <li>
                  <a href="/zk-intent/solvers/eve" className="link link-warning" target="_blank" rel="noreferrer">
                    Solver Eve (Not Qualified - Privacy Demo)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
