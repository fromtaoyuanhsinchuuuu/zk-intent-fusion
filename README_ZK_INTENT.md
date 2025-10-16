# ZK-Intent Fusion 🌉

Cross-chain intent optimization with zero-knowledge proofs, powered by Avail Nexus, Vincent, and Noir.

## 🚀 Quick Start (5-minute Demo)

### Prerequisites
- Node.js 18+ and pnpm/yarn
- Python 3.10+
- Foundry (for contracts)

### 1. Clone and Install

```bash
git clone <your-repo>
cd zk-intent-fusion
pnpm install
```

### 2. Start the Solver Backend

```bash
cd packages/solver
pip install poetry
poetry install
poetry run uvicorn src.api.server:app --port 8787 --reload
```

Or with pip:
```bash
pip install fastapi uvicorn pydantic python-dotenv httpx eth-hash web3
python -m uvicorn src.api.server:app --port 8787 --reload
```

### 3. Start the Frontend

```bash
cd packages/nextjs
cp .env.example .env.local
# Edit .env.local if needed
pnpm dev
```

Visit `http://localhost:3000` and follow the demo flow!

### 4. (Optional) Deploy Contracts

```bash
cd packages/foundry
cp .env.example .env
# Add your DEPLOYER_PRIVATE_KEY
forge script script/DeployIntentContracts.s.sol --rpc-url <YOUR_RPC> --broadcast
# Copy the deployed addresses to packages/nextjs/.env.local
```

## 📁 Project Structure

```
zk-intent-fusion/
├── packages/
│   ├── foundry/              # Smart contracts
│   │   ├── contracts/
│   │   │   ├── SolverRegistry.sol
│   │   │   └── IntentVerifier.sol
│   │   └── script/
│   │       └── DeployIntentContracts.s.sol
│   │
│   ├── nextjs/               # Frontend (Scaffold-ETH)
│   │   ├── app/
│   │   │   └── page-intent.tsx    # Main demo page
│   │   ├── components/
│   │   │   ├── IntentForm.tsx
│   │   │   ├── AuctionPanel.tsx
│   │   │   ├── ExecutionPanel.tsx
│   │   │   └── ProofCard.tsx
│   │   └── lib/
│   │       └── apiClient.ts
│   │
│   └── solver/               # Python backend
│       ├── src/
│       │   ├── api/
│       │   │   └── server.py          # FastAPI endpoints
│       │   ├── agents/
│       │   │   ├── intent_parser_agent.py
│       │   │   ├── solver_a_agent.py
│       │   │   ├── solver_b_agent.py
│       │   │   └── auction_agent.py
│       │   ├── core/
│       │   │   ├── models.py
│       │   │   ├── state.py
│       │   │   └── orchestration.py
│       │   ├── zk/
│       │   │   ├── circuits/          # Noir circuit templates
│       │   │   └── mock_prover.py
│       │   └── integrations/
│       │       ├── lit.py             # Vincent/Lit mock
│       │       └── avail_nexus.py     # Nexus mock
│       └── pyproject.toml
```

## 🎯 Demo Flow

1. **📝 Parse Intent**: Enter natural language (e.g., "Use all my stablecoins for 3 months, highest APY")
2. **🏆 Auction**: Multiple solvers compete with ZK proofs
3. **✓ Authorize**: Vincent/Lit Protocol access control (mock)
4. **⚡ Execute**: Avail Nexus cross-chain execution (mock)
5. **🔐 Verify**: On-chain proof verification

## 🛠 Technology Stack

### MVP (Current)
- **Frontend**: Next.js + TypeScript + Scaffold-ETH
- **Backend**: Python + FastAPI
- **Contracts**: Solidity + Foundry
- **ZK**: Mock proofs (Noir circuit templates ready)
- **Cross-chain**: Mock Avail Nexus execution
- **Auth**: Mock Vincent/Lit Protocol

### Production Roadmap
- ✅ Real Noir/Barretenberg ZK proofs
- ✅ ASI Chat semantic intent parsing
- ✅ Live Avail Nexus integration
- ✅ Real Vincent access control
- ✅ Multi-protocol support (Morpho, Aave, Compound, Uniswap, Curve)

## 🧪 API Endpoints

### Solver Backend (http://localhost:8787)

- `GET /submit-intent?nl=<text>&user=<address>` - Parse intent and run auction
- `GET /authorize?commitment=<hash>` - Authorize execution
- `GET /execute?commitment=<hash>` - Execute intent
- `GET /status/<commitment>` - Get intent status
- `GET /intents` - List all intents (debug)
- `POST /reset` - Clear state (testing)

## 🔧 Configuration

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SOLVER_REGISTRY=0x...
NEXT_PUBLIC_INTENT_VERIFIER=0x...
NEXT_PUBLIC_SOLVER_API=http://localhost:8787
```

### Solver Backend (.env)
```bash
NEXUS_API_KEY=your_key
AGENTVERSE_KEY=your_key
LIT_PROTOCOL_ENV=cayenne
```

### Foundry (.env)
```bash
DEPLOYER_PRIVATE_KEY=0x...
OPTIMISM_RPC_URL=https://mainnet.optimism.io
```

## 📦 Dependencies

### Frontend
- Next.js 14+
- TypeScript
- Scaffold-ETH 2 components
- wagmi + viem

### Backend
- FastAPI
- pydantic
- python-dotenv
- httpx
- web3.py
- eth-hash

### Contracts
- Solidity ^0.8.24
- Foundry
- OpenZeppelin Contracts

## 🚧 Development

### Run Tests
```bash
# Contracts
cd packages/foundry
forge test

# Backend (add pytest tests)
cd packages/solver
poetry run pytest

# Frontend
cd packages/nextjs
pnpm test
```

### Format Code
```bash
# Contracts
forge fmt

# Backend
poetry run black src/
poetry run ruff src/

# Frontend
pnpm format
```

## 📝 License

MIT

## 🤝 Contributing

PRs welcome! See CONTRIBUTING.md for guidelines.

## 📧 Contact

For questions or support, open an issue or reach out to the team.

---

Built with ❤️ using Scaffold-ETH, Avail, Vincent, Noir, and ASI
