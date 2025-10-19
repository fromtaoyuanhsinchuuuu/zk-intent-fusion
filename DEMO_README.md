# 🎭 ZK-Intent Fusion Multi-Role Demo

## Quick Start

### 1. Start all services

```bash
# Terminal 1: Start Anvil (local blockchain)
cd packages/foundry
anvil

# Terminal 2: Deploy contracts
cd packages/foundry
forge script script/DeployIntentContracts.s.sol --rpc-url http://localhost:8545 --broadcast

# Terminal 3: Start backend
cd packages/solver
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload

# Terminal 4: Start frontend
cd packages/nextjs
npm run dev
```

### 2. Open all demo tabs

```bash
# From project root
./open-demo-tabs.sh
```

This will open 7 tabs:
1. 👤 **User (Alice)** - Submit intent
2. 🤖 **Parsing Agent** - AI parsing process
3. 🏆 **Solver Bob** - Qualified solver (can decrypt)
4. 🏆 **Solver Charlie** - Qualified solver (can decrypt)
5. ⛔ **Solver Eve** - Unqualified solver (**PRIVACY DEMO** - cannot decrypt) 🔥
6. 🎯 **Auction Dashboard** - Winner selection with ZK proofs
7. 🚀 **Execution Monitor** - Avail Nexus cross-chain execution

### 3. Run the demo

1. **Tab 1 (User):** Enter intent and submit
   ```
   Use all my stablecoins for 3 months, highest APY, tolerate 3% gas
   ```

2. **Tab 2 (Parsing):** Watch AI parse the intent

3. **Tabs 3-5 (Solvers):** See different perspectives
   - Bob & Charlie: Can see decrypted intent ✅
   - Eve: Can only see encrypted data ❌ **(Key highlight!)**

4. **Tab 6 (Auction):** View auction results and ZK proofs

5. **Tab 1 (User):** Authorize execution

6. **Tab 7 (Execution):** Watch Avail Nexus execute cross-chain operations

## Key Highlights

### 🔒 Privacy Protection (Tab 5 - Eve)
**Most Important Feature:**  
Even though the intent commitment is publicly on-chain, unqualified solvers cannot see the plaintext. This demonstrates:
- zkTLS access control
- Selective disclosure with ZK proofs
- Protection against MEV and front-running

### 🤖 AI-Powered (Tab 2)
Natural language → Structured JSON → Encrypted

### 🎯 Transparent Competition (Tab 6)
Multiple qualified solvers compete, winner selected on merit, all proofs on-chain

### 🚀 Cross-Chain Execution (Tab 7)
Avail Nexus integration for seamless cross-chain operations

## Architecture

```
User Input (NL) → AI Parsing → Encryption
                       ↓
    ┌──────────────────┴──────────────────┐
    │                                     │
Solver Bob (✅)    Solver Charlie (✅)    Solver Eve (❌)
Can decrypt        Can decrypt           Cannot decrypt
    │                                     │
    └──────────────────┬──────────────────┘
                       ↓
               Auction (ZK Proofs)
                       ↓
            User Authorization
                       ↓
      Avail Nexus Execution (Cross-chain)
                       ↓
           ZK Proof Verification
```

## Demo Time: ~7 Minutes

- Phase 1: Intent submission (30s)
- Phase 2: Parsing (10s)
- Phase 3: Solver perspectives (1min) - **Focus on Eve!**
- Phase 4: Auction (30s)
- Phase 5: Authorization (10s)
- Phase 6: Execution (2min)

## Full Documentation

See [`MULTI_ROLE_DEMO_GUIDE.md`](./MULTI_ROLE_DEMO_GUIDE.md) for:
- Detailed walkthrough
- Presentation script
- Troubleshooting guide
- Success checklist

## Technical Stack

- **Frontend:** Next.js 15 + React + TypeScript + DaisyUI
- **Backend:** FastAPI (Python) + Pydantic
- **Smart Contracts:** Solidity + Foundry
- **State Management:** Zustand
- **ZK Proofs:** Noir (mocked in MVP)
- **Cross-chain:** Avail Nexus (simulated in MVP)
- **Access Control:** zkTLS + Vincent/Lit Protocol (simulated in MVP)

## Production Roadmap

- [ ] Real Noir/Barretenberg ZK proofs
- [ ] ASI Chat semantic reasoning
- [ ] Live Avail Nexus integration
- [ ] Real Vincent/Lit Protocol access control
- [ ] Multi-protocol support (Aave, Compound, Morpho, etc.)
- [ ] Real cross-chain bridges

---

**🎉 Enjoy the demo!**

For questions or issues, check `MULTI_ROLE_DEMO_GUIDE.md` or open an issue on GitHub.
