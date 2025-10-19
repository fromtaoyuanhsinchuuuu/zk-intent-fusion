"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import {
  NexusProvider,
  BridgeButton,
  useNexus,
  type EthereumProvider,
} from "@avail-project/nexus-widgets";

function isEthereumProvider(provider: unknown): provider is EthereumProvider {
  if (!provider || typeof provider !== "object") {
    return false;
  }
  return (
    "request" in provider &&
    typeof (provider as EthereumProvider).request === "function" &&
    "on" in provider &&
    typeof (provider as EthereumProvider).on === "function" &&
    "removeListener" in provider &&
    typeof (provider as EthereumProvider).removeListener === "function"
  );
}

// Wallet Bridge Component to forward provider to Nexus
function WalletBridge() {
  const { isConnected, connector } = useAccount();
  const { setProvider } = useNexus();
  const providerRef = useRef<EthereumProvider | null>(null);
  const [providerSet, setProviderSet] = useState(false);

  useEffect(() => {
    if (isConnected && connector?.getProvider && typeof window !== "undefined" && !providerSet) {
      let cancelled = false;
      
      // Add small delay to avoid race condition with wallet initialization
      const timer = setTimeout(() => {
        connector
          .getProvider()
          .then((provider) => {
            if (cancelled) return;
            if (isEthereumProvider(provider) && providerRef.current !== provider) {
              providerRef.current = provider;
              setProvider(provider);
              setProviderSet(true);
              console.log("Nexus provider initialized successfully");
            }
          })
          .catch((err) => {
            console.error("Failed to fetch wallet provider", err);
          });
      }, 300);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [isConnected, connector, setProvider, providerSet]);

  return null;
}

export default function NexusBridgePage() {
  const { address, isConnected, chain } = useAccount();
  const [mounted, setMounted] = useState(false);
  const nexusConfig = useMemo(
    () => ({
      network: "testnet",
      debug: true,
    }),
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCorrectNetwork = chain?.id === 421614 || chain?.id === 11155420;

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-3xl justify-center mb-4">🌉 Nexus Bridge</h2>
            <p className="text-lg text-base-content/70 mb-6">
              Please connect your wallet to use the Nexus bridge
            </p>
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
              <span>Connect your wallet using the button in the header</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-6 text-primary-content">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🌉</div>
          <div>
            <h1 className="text-3xl font-bold">Nexus Bridge</h1>
            <p className="text-sm opacity-90">Cross-chain token bridge powered by Avail Nexus</p>
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">📍 Connected Wallet</h2>
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="font-mono text-sm break-all">{address}</p>
            <p className="text-sm mt-2">
              Network: <span className="font-semibold">{chain?.name || "Unknown"}</span> (ID: {chain?.id})
            </p>
          </div>
        </div>
      </div>

      {/* Network Warning */}
      {!isCorrectNetwork && (
        <div className="alert alert-warning mb-6">
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
          <div>
            <h3 className="font-bold">Wrong Network!</h3>
            <div className="text-sm">
              Please switch to <strong>Arbitrum Sepolia</strong> or <strong>OP Sepolia</strong> using
              your wallet before bridging. Current network: {chain?.name || "Unknown"}
            </div>
          </div>
        </div>
      )}

      {/* Nexus Bridge Widget */}
      <NexusProvider config={nexusConfig}>
        <WalletBridge />
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">🚀 Bridge ETH from Arbitrum Sepolia to OP Sepolia</h2>

            <div className="space-y-6">
              {/* Example 1: Bridge 0.0001 ETH */}
              <div className="border border-base-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Bridge 0.0001 ETH to OP Sepolia</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Bridge your ETH from Arbitrum Sepolia to Optimism Sepolia
                </p>
                <BridgeButton
                  prefill={{
                    chainId: 11155420, // OP Sepolia
                    token: "ETH",
                    amount: "0.0001",
                  }}
                  title="Bridge to OP Sepolia"
                >
                  {({ onClick, isLoading }) => (
                    <button
                      onClick={onClick}
                      disabled={isLoading}
                      className="btn btn-primary btn-block btn-lg"
                    >
                      {isLoading ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Bridging...
                        </>
                      ) : (
                        "🌉 Bridge 0.0001 ETH → OP Sepolia"
                      )}
                    </button>
                  )}
                </BridgeButton>
              </div>

              {/* Example 2: Bridge 0.001 ETH */}
              <div className="border border-base-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Bridge 0.001 ETH to OP Sepolia</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Larger amount for testing
                </p>
                <BridgeButton
                  prefill={{
                    chainId: 11155420, // OP Sepolia
                    token: "ETH",
                    amount: "0.001",
                  }}
                  title="Bridge to OP Sepolia"
                >
                  {({ onClick, isLoading }) => (
                    <button
                      onClick={onClick}
                      disabled={isLoading}
                      className="btn btn-primary btn-block btn-lg"
                    >
                      {isLoading ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Bridging...
                        </>
                      ) : (
                        "🌉 Bridge 0.001 ETH → OP Sepolia"
                      )}
                    </button>
                  )}
                </BridgeButton>
              </div>

              {/* Example 3: Flexible Bridge */}
              <div className="border border-base-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Custom Bridge</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Open the Nexus widget to customize your bridge parameters
                </p>
                <BridgeButton title="Custom Bridge">
                  {({ onClick, isLoading }) => (
                    <button
                      onClick={onClick}
                      disabled={isLoading}
                      className="btn btn-secondary btn-block btn-lg"
                    >
                      {isLoading ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Processing...
                        </>
                      ) : (
                        "⚙️ Open Custom Bridge Widget"
                      )}
                    </button>
                  )}
                </BridgeButton>
              </div>
            </div>

            {/* Info */}
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
                <h3 className="font-bold">About Nexus Bridge</h3>
                <div className="text-xs">
                  Nexus automatically finds the best route for your cross-chain transactions,
                  optimizing for speed and cost.
                </div>
              </div>
            </div>
          </div>
        </div>
      </NexusProvider>

      {/* Instructions */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">📖 How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're connected to the correct wallet</li>
            <li>Ensure you have ETH on Arbitrum Sepolia for gas fees</li>
            <li>Click on a bridge button above</li>
            <li>Review the transaction details in the Nexus modal</li>
            <li>Confirm the transaction in your wallet</li>
            <li>Wait for the bridge to complete (usually takes a few minutes)</li>
            <li>Check your balance on OP Sepolia after completion</li>
          </ol>
        </div>
      </div>

      {/* Network Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-sm">🔵 Arbitrum Sepolia</h3>
            <div className="text-xs space-y-1">
              <p>Chain ID: 421614</p>
              <p>RPC: sepolia-rollup.arbitrum.io</p>
              <a
                href={`https://sepolia.arbiscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                View on Explorer →
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-sm">🔴 OP Sepolia</h3>
            <div className="text-xs space-y-1">
              <p>Chain ID: 11155420</p>
              <p>RPC: sepolia.optimism.io</p>
              <a
                href={`https://sepolia-optimism.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-secondary"
              >
                View on Explorer →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
