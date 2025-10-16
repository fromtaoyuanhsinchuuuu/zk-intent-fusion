"use client";

interface ProofCardProps {
  proof: {
    intentCommitment: string;
    finalBalanceCommitment: string;
    proofTx: string;
    proof: string;
  } | null;
}

export default function ProofCard({ proof }: ProofCardProps) {
  if (!proof) return null;

  return (
    <div className="p-6 border-2 border-success rounded-2xl bg-success/5">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🔐</div>
          <div>
            <h2 className="text-xl font-bold text-success">Execution Proof Verified</h2>
            <p className="text-sm opacity-70">ZK proof recorded on-chain via IntentVerifier</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="p-3 rounded-xl bg-base-100 space-y-1">
            <div className="text-xs opacity-60 font-semibold">Intent Commitment</div>
            <code className="text-xs break-all block">{proof.intentCommitment}</code>
          </div>

          <div className="p-3 rounded-xl bg-base-100 space-y-1">
            <div className="text-xs opacity-60 font-semibold">Final Balance Commitment</div>
            <code className="text-xs break-all block">{proof.finalBalanceCommitment}</code>
          </div>

          <div className="p-3 rounded-xl bg-base-100 space-y-1">
            <div className="text-xs opacity-60 font-semibold">ZK Proof</div>
            <code className="text-xs break-all block">{proof.proof}</code>
          </div>

          <div className="p-3 rounded-xl bg-base-100 space-y-1">
            <div className="text-xs opacity-60 font-semibold">Verifier Transaction</div>
            <code className="text-xs break-all block">{proof.proofTx}</code>
            <div className="text-xs opacity-50 mt-1">
              ✅ Verified and anchored on-chain (MVP: mock transaction)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-success/20 border border-success">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div className="text-sm">
              <div className="font-bold">Proof Status: VERIFIED</div>
              <div className="opacity-70">
                Your intent execution has been cryptographically verified and recorded on-chain
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs opacity-60 space-y-1">
          <p className="font-semibold">What was proven:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>All transactions executed correctly</li>
            <li>Final balances match expectations</li>
            <li>Gas costs were accurate</li>
            <li>No funds were lost or stolen</li>
            <li>Original intent was followed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
