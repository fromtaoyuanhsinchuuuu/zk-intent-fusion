"use client";

import { useEffect, useState } from "react";
import { useIntentStore, type ExecutionStep } from "~~/lib/intentStore";
import { useCrossTabSync } from "~~/hooks/useCrossTabSync";

export default function ExecutionMonitorPage() {
  // Enable cross-tab sync
  useCrossTabSync();
  
  const {
    intentId,
    winner,
    authorizationStatus,
    executionStatus,
    executionSteps,
    finalResult,
    zkProofs,
    startExecution,
    updateExecutionStep,
    setFinalResult,
    addZkProof,
  } = useIntentStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [autoCompleted, setAutoCompleted] = useState(false);

  // Auto-complete execution instantly when page loads with authorization
  useEffect(() => {
    if (authorizationStatus === "completed" && !autoCompleted) {
      setAutoCompleted(true);
      
      // Start execution
      if (executionStatus === "idle") {
        startExecution();
      }

      // Auto-complete all steps instantly
      const completeAllSteps = async () => {
        // Complete step 1
        updateExecutionStep(1, "in-progress");
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(1, "completed", {
          source_tx: "0xabc123...def456 (Arbitrum)",
          dest_tx: "0x123456...789012 (Optimism)",
          amount: "250 USDC",
          fee: "$3.50",
        });

        // Complete step 2
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(2, "in-progress");
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(2, "completed", {
          source_tx: "0xghi789...jkl012 (Polygon)",
          dest_tx: "0x789012...345678 (Optimism)",
          amount: "250 USDT",
          fee: "$3.00",
        });

        // Complete step 3
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(3, "in-progress");
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(3, "completed", {
          source_tx: "0xmno345...pqr678 (Optimism)",
          amount: "250 USDT → 249.5 USDC",
          fee: "$2.00",
        });

        // Complete step 4
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(4, "in-progress");
        await new Promise(resolve => setTimeout(resolve, 100));
        updateExecutionStep(4, "completed", {
          source_tx: "0xstu901...vwx234 (Optimism)",
          amount: "499.5 USDC",
          fee: "$6.50",
        });

        // Set final result
        await new Promise(resolve => setTimeout(resolve, 200));
        setFinalResult({
          initial_assets: "500 USD (250 USDC + 250 USDT)",
          total_gas_fees: "$15.00",
          final_position: "499.5 USDC @ Morpho (Optimism)",
          expected_monthly_yield: "~$5.47",
          net_return: "~$1.41 profit (3 months)",
        });

        // Add execution proof
        await new Promise(resolve => setTimeout(resolve, 300));
        addZkProof({
          type: "Execution Correctness Proof",
          hash: "0xexec_07a0a2f92686d2082",
          tx: "0xverifier_tx_mock_13ecdcaa",
          verifier: "IntentVerifier",
          status: "verified",
          block: "12345690",
        });
      };

      completeAllSteps();
    }
  }, [authorizationStatus, autoCompleted, executionStatus, startExecution, updateExecutionStep, setFinalResult, addZkProof]);

  // Auto-start execution when authorized (legacy support)
  useEffect(() => {
    if (authorizationStatus === "completed" && executionStatus === "idle" && !autoCompleted) {
      startExecution();
      setCurrentStepIndex(0);
    }
  }, [authorizationStatus, executionStatus, startExecution, autoCompleted]);

  // Simulate step-by-step execution
  useEffect(() => {
    if (executionStatus === "in-progress" && currentStepIndex >= 0 && currentStepIndex < 4) {
      const step = executionSteps[currentStepIndex];
      if (step && step.status === "pending") {
        // Mark as in-progress
        updateExecutionStep(step.step_number, "in-progress");

        // Complete after delay
        const delay = 2000 + Math.random() * 2000; // 2-4 seconds
        setTimeout(() => {
          const completedData = getStepCompletionData(step.step_number);
          updateExecutionStep(step.step_number, "completed", completedData);

          // Move to next step
          if (currentStepIndex < 3) {
            setCurrentStepIndex(currentStepIndex + 1);
          } else {
            // All steps complete - set final result
            setTimeout(() => {
              setFinalResult({
                initial_assets: "500 USD (250 USDC + 250 USDT)",
                total_gas_fees: "$15.00",
                final_position: "499.5 USDC @ Morpho (Optimism)",
                expected_monthly_yield: "~$5.47",
                net_return: "~$1.41 profit (3 months)",
              });

              // Add execution proof
              setTimeout(() => {
                addZkProof({
                  type: "Execution Correctness Proof",
                  hash: "0xexec_264df27fa3e3362d",
                  tx: "0xverifier_tx_9857d0e0",
                  verifier: "IntentVerifier",
                  status: "verified",
                  block: "12345690",
                });
              }, 1000);
            }, 1000);
          }
        }, delay);
      }
    }
  }, [currentStepIndex, executionStatus, executionSteps, updateExecutionStep, setFinalResult, addZkProof]);

  function getStepCompletionData(stepNumber: number): Partial<ExecutionStep> {
    const dataMap: Record<number, Partial<ExecutionStep>> = {
      1: {
        source_tx: "0xabc123...def456 (Arbitrum)",
        dest_tx: "0x123456...789012 (Optimism)",
        amount: "250 USDC",
        fee: "$3.50",
      },
      2: {
        source_tx: "0xghi789...jkl012 (Polygon)",
        dest_tx: "0x789012...345678 (Optimism)",
        amount: "250 USDT",
        fee: "$3.00",
      },
      3: {
        source_tx: "0xmno345...pqr678 (Optimism)",
        amount: "250 USDT → 249.5 USDC",
        fee: "$2.00",
      },
      4: {
        source_tx: "0xstu901...vwx234 (Optimism)",
        amount: "499.5 USDC",
        fee: "$4.00",
      },
    };
    return dataMap[stepNumber] || {};
  }

  if (authorizationStatus !== "completed") {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold mb-4">Execution Monitor</h1>
          <p className="text-lg text-base-content/70">Waiting for user authorization...</p>
          <div className="mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
          <p className="text-sm text-base-content/60 mt-4">
            The user must authorize execution before cross-chain operations can begin.
          </p>
        </div>
      </div>
    );
  }

  const isComplete = executionStatus === "completed";
  const executionProof = zkProofs.find(p => p.type.includes("Execution"));

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-6 text-primary-content">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🚀</div>
            <div>
              <h1 className="text-3xl font-bold">Execution Monitor</h1>
              <p className="text-sm opacity-90">Powered by Avail Nexus Cross-Chain Infrastructure</p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`badge badge-lg ${
                isComplete ? "badge-success" : "badge-warning"
              } gap-2`}
            >
              {isComplete ? "🟢 Completed" : "🟡 In Progress"}
            </div>
          </div>
        </div>
      </div>

      {/* Executor Info */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-1">Intent ID:</p>
              <code className="bg-base-200 px-2 py-1 rounded text-xs block break-all">
                {intentId?.slice(0, 40)}...
              </code>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Executor:</p>
              <p className="text-sm">
                Solver {winner?.solver_name} (<code className="bg-base-200 px-2 py-1 rounded text-xs">{winner?.solver_address.slice(0, 10)}...</code>)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Steps */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">📋 Execution Steps</h2>

          <div className="space-y-4">
            {executionSteps.map((step, index) => (
              <div
                key={step.step_number}
                className={`card bg-base-200 border-2 ${
                  step.status === "completed"
                    ? "border-success"
                    : step.status === "in-progress"
                      ? "border-warning"
                      : "border-base-300"
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {step.status === "completed" ? (
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-success-content font-bold">
                          ✓
                        </div>
                      ) : step.status === "in-progress" ? (
                        <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center">
                          <span className="loading loading-spinner loading-sm"></span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-base-content/50 font-bold">
                          {step.step_number}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">
                          Step {step.step_number}: {step.description}
                        </h3>
                        <span
                          className={`badge ${
                            step.status === "completed"
                              ? "badge-success"
                              : step.status === "in-progress"
                                ? "badge-warning"
                                : "badge-ghost"
                          }`}
                        >
                          {step.status === "completed"
                            ? "✅ Completed"
                            : step.status === "in-progress"
                              ? "⏳ In Progress"
                              : "⏸️ Pending"}
                        </span>
                      </div>

                      {step.via && (
                        <p className="text-sm text-base-content/70 mb-2">Via: {step.via}</p>
                      )}

                      {step.status === "completed" && (
                        <div className="bg-base-300 p-3 rounded mt-2 space-y-1 text-xs">
                          {step.source_tx && (
                            <div className="flex items-center gap-2">
                              <span className="text-base-content/70">
                                {step.source_chain ? `Source Tx (${step.source_chain}):` : "Tx:"}
                              </span>
                              <code className="bg-base-100 px-2 py-1 rounded">{step.source_tx}</code>
                            </div>
                          )}
                          {step.dest_tx && (
                            <div className="flex items-center gap-2">
                              <span className="text-base-content/70">Dest Tx ({step.dest_chain}):</span>
                              <code className="bg-base-100 px-2 py-1 rounded">{step.dest_tx}</code>
                            </div>
                          )}
                          {step.amount && (
                            <div className="flex items-center gap-2">
                              <span className="text-base-content/70">Amount:</span>
                              <span className="font-semibold">{step.amount}</span>
                            </div>
                          )}
                          {step.fee && (
                            <div className="flex items-center gap-2">
                              <span className="text-base-content/70">Fee:</span>
                              <span className="text-warning font-semibold">{step.fee}</span>
                            </div>
                          )}
                          {step.timestamp && (
                            <div className="flex items-center gap-2">
                              <span className="text-base-content/70">Completed:</span>
                              <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                            </div>
                          )}
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

      {/* Final Result */}
      {finalResult && (
        <div className="card bg-base-100 shadow-xl mb-6 border-2 border-success">
          <div className="card-body">
            <h2 className="card-title text-success">💰 Final Result</h2>
            <div className="bg-success/10 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Initial Assets:</span>
                <span>{finalResult.initial_assets}</span>
              </div>
              <div className="flex justify-between text-warning">
                <span className="font-semibold">Total Gas Fees:</span>
                <span>{finalResult.total_gas_fees}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between text-success text-lg">
                <span className="font-bold">Final Position:</span>
                <span className="font-bold">{finalResult.final_position}</span>
              </div>
              <div className="flex justify-between text-info">
                <span className="font-semibold">Expected Monthly Yield:</span>
                <span>{finalResult.expected_monthly_yield}</span>
              </div>
              <div className="flex justify-between text-success text-lg">
                <span className="font-bold">Net Return (3 months):</span>
                <span className="font-bold">{finalResult.net_return}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZK Proof Generation & Verification */}
      {executionProof && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">🔐 ZK Proof Generation & Verification</h2>
            <div className="bg-base-200 p-4 rounded-lg space-y-3">
              <div>
                <p className="font-semibold mb-1">Proof Type:</p>
                <p>{executionProof.type}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Proof Hash:</p>
                <code className="bg-base-300 px-2 py-1 rounded text-xs block break-all">{executionProof.hash}</code>
              </div>
              <div>
                <p className="font-semibold mb-1">Status:</p>
                <span className="badge badge-success">✅ Generated & Verified</span>
              </div>

              <div className="divider">What was proven</div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>All transactions executed correctly</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>Final balance matches expectation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>Gas costs were accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>No funds lost or stolen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✅</span>
                  <span>Original intent was followed</span>
                </div>
              </div>

              <div className="divider">On-Chain Verification</div>

              <div className="bg-base-300 p-3 rounded space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base-content/70">Verifier Tx:</span>
                  <code className="bg-base-100 px-2 py-1 rounded text-xs">{executionProof.tx}</code>
                  <a
                    href={`https://etherscan.io/tx/${executionProof.tx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link link-primary text-xs"
                  >
                    ↗
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base-content/70">Verified on-chain:</span>
                  <span className="badge badge-success">✅ Block #{executionProof.block}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base-content/70">Verifier Contract:</span>
                  <span className="badge">{executionProof.verifier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isComplete && (
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
            <h3 className="font-bold">🎉 Execution Complete!</h3>
            <div className="text-sm">All proofs have been anchored on-chain via Avail DA. The intent has been successfully fulfilled.</div>
          </div>
        </div>
      )}
    </div>
  );
}
