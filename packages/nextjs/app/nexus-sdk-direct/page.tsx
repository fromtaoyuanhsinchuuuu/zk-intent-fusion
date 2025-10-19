"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { NexusSDK } from "@avail-project/nexus-core";
import type { BridgeParams } from "@avail-project/nexus-core";

export default function NexusSDKPage() {
  const { address, isConnected, connector } = useAccount();
  const [sdk, setSdk] = useState<NexusSDK | null>(null);
  const [status, setStatus] = useState("");
  const [balances, setBalances] = useState<any>(null);
  const [bridging, setBridging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && connector) {
      initializeSDK();
    }
  }, [isConnected, connector]);

  const initializeSDK = async () => {
    try {
      setStatus("🔄 Initializing Nexus SDK...");
      
      const provider = await connector?.getProvider();
      if (!provider) {
        setStatus("❌ No provider available");
        return;
      }

      const nexusSDK = new NexusSDK({
        network: "testnet",
      });

      await nexusSDK.initialize(provider as any);
      setSdk(nexusSDK);
      setStatus("✅ SDK initialized successfully!");

      // Fetch balances
      const unifiedBalances = await nexusSDK.getUnifiedBalances();
      setBalances(unifiedBalances);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error("SDK init error:", error);
    }
  };

  const handleBridge = async () => {
    if (!sdk || !address) {
      alert("Please initialize SDK first");
      return;
    }

    setBridging(true);
    setError(null);

    try {
      console.log("Starting bridge...");
      const params = {
        chainId: 11155420 as any, // OP Sepolia
        token: "ETH" as const,
        amount: "0.0001", // 0.0001 ETH
      };
      
      console.log("Bridge params:", params);
      
      // Step 1: Call bridge() to get the result
      const result = await sdk.bridge(params);
      console.log("Bridge result:", result);
      console.log("Result keys:", Object.keys(result));
      
      // Check if result has success property (BridgeResult type)
      if ("success" in result) {
        if (result.success) {
          alert(`Bridge successful! Explorer: ${result.explorerUrl}`);
          // Refresh balances
          const updatedBalances = await sdk.getUnifiedBalances();
          setBalances(updatedBalances);
        } else {
          throw new Error(result.error);
        }
      } else {
        // If result is the handler object with exec/simulate
        console.log("Result appears to be a handler object");
        alert("Bridge result: " + JSON.stringify(result));
      }
    } catch (err: any) {
      console.error("Bridge error:", err);
      setError(err.message || "Failed to bridge tokens");
      alert(`Bridge failed: ${err.message}`);
    } finally {
      setBridging(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-3xl justify-center mb-4">🌉 Nexus SDK Direct</h2>
            <p className="text-lg mb-6">Please connect your wallet to continue</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-6 text-primary-content">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🌉</div>
          <div>
            <h1 className="text-3xl font-bold">Nexus SDK Direct Integration</h1>
            <p className="text-sm opacity-90">Using @avail-project/nexus-core without widgets</p>
          </div>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div
          className={`alert mb-6 ${
            status.includes("✅")
              ? "alert-success"
              : status.includes("❌")
                ? "alert-error"
                : "alert-info"
          }`}
        >
          <span>{status}</span>
        </div>
      )}

      {/* Wallet Info */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">📍 Connected Wallet</h2>
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="font-mono text-sm break-all">{address}</p>
          </div>
        </div>
      </div>

      {/* Balances */}
      {balances && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">💰 Unified Balances</h2>
            <div className="bg-base-200 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">{JSON.stringify(balances, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Bridge Action */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">🚀 Bridge ETH</h2>
          <p className="text-sm mb-4">Bridge 0.0001 ETH to OP Sepolia</p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleBridge}
            disabled={!sdk || bridging}
            className="btn btn-primary btn-block btn-lg"
          >
            {!sdk ? "Initializing SDK..." : bridging ? "🔄 Bridging..." : "🌉 Bridge ETH → OP Sepolia"}
          </button>

          <div className="divider">How this works</div>

          <div className="text-sm space-y-2">
            <p>✅ Uses @avail-project/nexus-core directly</p>
            <p>✅ No widget UI dependencies</p>
            <p>✅ Full control over SDK methods</p>
            <p>⚠️ Still depends on Avail's backend services</p>
            <p>💡 If this works, widgets should too (eventually)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
