# 🚀 ZK-Intent Fusion - Complete Startup Guide

This guide will help you run the complete ZK-Intent Fusion demo from scratch.

## Prerequisites

- Node.js 18+ (with pnpm/yarn/npm)
- Python 3.10+
- Foundry (for smart contracts)
- Git

## Quick Start (5 Minutes)

### Option A: Using the Automated Script

```bash
# From project root
./start-demo.sh
```

This will:
1. Install all dependencies
2. Start the solver backend on port 8787
3. Start the frontend on port 3000
4. Open demo instructions

### Option B: Manual Setup (Recommended for First Time)

Follow these steps to understand each component:

---

## Step 1: Deploy Smart Contracts

### 1a. Start Local Blockchain (Anvil)

Open a new terminal:

```bash
cd packages/foundry
anvil
```

Leave this running. Anvil provides a local Ethereum node with pre-funded accounts.

**Default Account (for testing):**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 1b. Deploy Contracts

Open another terminal:

```bash
cd packages/foundry

# Copy environment file
cp .env.example .env

# Deploy to local Anvil
forge script script/DeployIntentContracts.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# You should see output like:
# SolverRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# IntentVerifier deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**📝 Copy these addresses!** You'll need them in the next steps.

---

## Step 2: Configure and Start Solver Backend

```bash
cd packages/solver

# Install Python dependencies
pip install fastapi uvicorn pydantic python-dotenv httpx eth-hash web3

# OR with Poetry (recommended)
pip install poetry
poetry install

# Create .env file
cp .env.example .env

# Edit .env and add deployed addresses:
# SOLVER_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
# INTENT_VERIFIER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
# RPC_URL=http://127.0.0.1:8545

# Start the server
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload

# OR with Poetry
poetry run uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload
```

**✅ Test the API:**
```bash
curl http://localhost:8787/
# Should return: {"service":"ZK-Intent Fusion Solver API",...}
```

**API Documentation:** http://localhost:8787/docs

---

## Step 3: Configure and Start Frontend

```bash
cd packages/nextjs

# Install dependencies (if not already done)
pnpm install  # or yarn install or npm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local and add:
# NEXT_PUBLIC_SOLVER_REGISTRY=0x5FbDB2315678afecb367f032d93F642f64180aa3
# NEXT_PUBLIC_INTENT_VERIFIER=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
# NEXT_PUBLIC_SOLVER_API=http://localhost:8787

# Start the frontend
pnpm dev  # or yarn dev or npm run dev
```

**✅ Frontend ready at:** http://localhost:3000

---

## Step 4: Run the Demo

### 4a. Navigate to ZK-Intent Page

Open your browser and go to:
```
http://localhost:3000/zk-intent
```

### 4b. Connect Your Wallet

1. Click "Connect Wallet" in the header (RainbowKit)
2. For local testing, use **Anvil's account #0**:
   - Import this private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Network: Localhost (Chain ID: 31337)

### 4c. Follow the Demo Flow

**Step 1: Parse Intent**
- Enter natural language: `"Use all my stablecoins for 3 months, highest APY, tolerate 3% gas"`
- Click **"Parse Intent & Run Auction"**
- Wait for the backend to process (~2-3 seconds)

**Step 2: Review Auction Results**
You'll see 3 solver bids:
- ❌ **Solver C (Unqualified)** - Rejected (not in qualified list)
- ✅ **Solver A (Morpho)** - 13.2% APY, $15 gas - **WINNER** (highest APY strategy)
- ✅ **Solver B (Aave)** - 12.1% APY, $11 gas - Valid but not selected

**Step 3: Authorize Execution**
- Click **"Authorize Execution (via Vincent)"**
- This simulates Vincent/Lit Protocol access control
- Authorization completes instantly in MVP

**Step 4: Execute Intent**
- Click **"Execute Intent"**
- Watch the cross-chain transactions execute (simulated via Avail Nexus):
  - Bridge USDC from Arbitrum → Optimism
  - Bridge USDT from Polygon → Optimism
  - Swap USDT to USDC
  - Supply to Morpho protocol
- See final position: ~499.5 USDC on Morpho/Optimism at 13.2% APY

**Step 5: Verify Proof**
- ZK proof is automatically generated and displayed
- On-chain verification event is emitted (mock transaction)
- All commitments and proof hashes are shown

### 4d. Start a New Intent

Click **"🔄 Start New Intent"** to try again with different parameters.

---

## 🧪 Testing Different Scenarios

### Test 1: Lowest Gas Strategy

```
"Use my stablecoins for 1 month, prioritize lowest gas"
```

Expected: Solver B (Aave) should win due to lower gas cost.

### Test 2: Invalid Intent

```
"Give me free money"
```

Expected: Parser should handle gracefully or return error.

### Test 3: Check Solver C Rejection

Look at the auction panel - Solver C should always show as ❌ rejected with "not qualified" status.

---

## 🔍 Debugging

### Backend Not Starting?

```bash
# Check if port 8787 is in use
lsof -i :8787

# View backend logs
cd packages/solver
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload --log-level debug
```

### Frontend Can't Connect to Backend?

1. Check CORS is enabled in `packages/solver/src/api/server.py`
2. Verify `.env.local` has correct `NEXT_PUBLIC_SOLVER_API`
3. Test backend directly: `curl http://localhost:8787/`

### Contracts Not Deploying?

```bash
# Check Anvil is running
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://localhost:8545

# Should return: {"jsonrpc":"2.0","id":1,"result":"0x7a69"}

# Try deploying again
forge script script/DeployIntentContracts.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  -vvvv
```

### Wallet Connection Issues?

1. Make sure you're on **Localhost network** (Chain ID: 31337)
2. Check that Anvil is running
3. Import the correct private key

---

## 📊 Architecture Overview

```
┌─────────────────┐
│   Frontend      │  Next.js + Scaffold-ETH
│   localhost:300 │  - IntentForm
│                 │  - AuctionPanel  
│                 │  - ExecutionPanel
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Solver Backend  │  FastAPI (Python)
│ localhost:8787  │  - Intent Parser
│                 │  - Solver Agents (A, B, C)
│                 │  - Auction Engine
│                 │  - Nexus Integration
└────────┬────────┘
         │ Web3
         ▼
┌─────────────────┐
│ Smart Contracts │  Foundry (Solidity)
│ Anvil :8545     │  - SolverRegistry
│                 │  - IntentVerifier
└─────────────────┘
```

---

## 🎯 What's Happening Behind the Scenes?

### 1. Intent Parsing
- Natural language → Structured Intent object
- Generate intent commitment (hash)
- Encrypt details with Lit Protocol access control

### 2. Solver Auction
- Qualified solvers (A, B) decrypt and access intent
- Each generates optimal route + ZK proof
- Unqualified solver (C) fails to decrypt, creates invalid bid
- Auction selects winner based on strategy (highest APY)

### 3. Authorization
- User authorizes winning solver via Vincent/Lit
- Access control conditions enforced
- Winner gets permission to execute

### 4. Execution
- Winner bridges assets via Avail Nexus
- Executes swaps and deposits
- Generates execution proof

### 5. Verification
- ZK proof submitted to IntentVerifier contract
- On-chain event emitted
- Final state recorded

---

## 🛠 Advanced: Deploy to Testnet

### Deploy to Optimism Sepolia

```bash
cd packages/foundry

# Get testnet ETH from faucet:
# https://sepoliafaucet.com

# Deploy
forge script script/DeployIntentContracts.s.sol \
  --rpc-url $OPTIMISM_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Update frontend .env.local with new addresses
```

---

## 📝 Next Steps

### Integrate Real Components

1. **Real ZK Proofs**: Replace `mock_prover.py` with Noir circuits
   ```bash
   cd packages/solver/src/zk/circuits
   nargo prove
   ```

2. **ASI Chat**: Replace intent parser with ASI semantic reasoning

3. **Avail Nexus**: Use real Nexus SDK for cross-chain execution
   ```python
   from avail_nexus import NexusClient
   nexus = NexusClient(api_key=os.getenv("NEXUS_API_KEY"))
   ```

4. **Vincent/Lit**: Integrate real access control
   ```python
   from lit_protocol import LitClient
   lit = LitClient()
   ```

---

## ❓ FAQ

**Q: Why is Solver C always rejected?**  
A: Solver C is not in the qualified solvers list (in `lit.py`), demonstrating access control.

**Q: Can I add more solvers?**  
A: Yes! Create `solver_d_agent.py` and register in `orchestration.py`.

**Q: How do I reset the state?**  
A: Call `POST http://localhost:8787/reset` or restart the backend.

**Q: Where are transaction details stored?**  
A: In-memory state (MVP). Production would use a database.

---

## 🐛 Known Issues (MVP)

- ⚠️ State is lost when backend restarts
- ⚠️ No persistent storage (use database in production)
- ⚠️ ZK proofs are mocked (integrate Noir for real proofs)
- ⚠️ Cross-chain execution is simulated (use Avail Nexus SDK)
- ⚠️ Access control uses hardcoded list (query on-chain registry)

---

## 📧 Need Help?

- Check logs in terminal windows
- Visit API docs: http://localhost:8787/docs
- Review code comments in source files
- Open an issue on GitHub

---

**🎉 You're ready to demo ZK-Intent Fusion!**

Navigate to http://localhost:3000/zk-intent and start optimizing intents!
