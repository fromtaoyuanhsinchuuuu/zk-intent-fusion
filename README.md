# 🧩 ZK-Intent Fusion

<h4 align="center">
  <a href="./DEMO_README.md">🎭 Multi-Role Demo</a> |
  <a href="./STARTUP_GUIDE.md">Startup Guide</a> |
  <a href="http://localhost:8787/docs">API Docs</a> |
  <a href="./CONTRIBUTING.md">Contributing</a>
</h4>

🚀 **ZK-Intent Fusion** is a decentralized intent-centric protocol that combines natural language processing, zero-knowledge proofs, solver auctions, and cross-chain execution to optimize user outcomes in DeFi.

Built for the **AlphaMax Hackathon**, this project demonstrates:
- 🤖 **ASI Chat Integration**: Natural language intent parsing
- 🔐 **Vincent/Lit Protocol**: Privacy-preserving access control
- 🔗 **Avail Nexus**: Cross-chain intent execution
- 🧮 **ZK Proofs (Noir)**: Privacy-preserving verification
- 🏆 **Solver Auctions**: Competitive route optimization

## ⚡ Quick Start (2 Minutes)

### Automated Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd zk-intent-fusion

# Run the demo (deploys contracts, starts backend & frontend)
./start-demo.sh

# Open browser and go to:
# http://localhost:3000/zk-intent
```

The script will:
1. ✅ Start local blockchain (Anvil)
2. ✅ Deploy SolverRegistry & IntentVerifier contracts
3. ✅ Start Python solver backend (port 8787)
4. ✅ Start Next.js frontend (port 3000)
5. ✅ Configure all environment variables

**Stop all services:**
```bash
./stop-demo.sh
```

### Manual Setup

For detailed step-by-step instructions, see **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)**

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  Next.js + Scaffold-ETH 2 + RainbowKit + Wagmi                  │
│  - Natural language input                                        │
│  - Wallet connection & signatures                                │
│  - Real-time auction visualization                               │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SOLVER BACKEND (FastAPI)                     │
│  - Intent Parser (ASI Chat simulation)                           │
│  - Solver Agents (A: Morpho, B: Aave, C: Unqualified)          │
│  - Auction Engine (selects optimal solver)                       │
│  - Cross-chain Execution Simulator (Nexus)                       │
│  - ZK Proof Generation (Noir)                                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SMART CONTRACTS (Solidity)                     │
│  - SolverRegistry: Qualified solver whitelist                    │
│  - IntentVerifier: Anti-replay + ZK verification anchor          │
│  - Access Control: On-chain registry checks                      │
└──────────────────────────────────────────────────────────────────┘
```

## 🎯 Demo Flow

### 1. Parse Intent
User enters natural language:
```
"Use all my stablecoins for 3 months, highest APY, tolerate 3% gas"
```

System generates:
- Structured Intent object
- Encrypted with Lit Protocol access control
- Intent commitment hash

### 2. Solver Auction
Three solvers compete:
- ✅ **Solver A (Morpho)**: 13.2% APY, $15 gas → **WINNER**
- ✅ **Solver B (Aave)**: 12.1% APY, $11 gas → Valid
- ❌ **Solver C (Unqualified)**: Not in registry → **REJECTED**

Auction selects winner based on user strategy (highest APY).

### 3. Authorization
- User authorizes winner via Vincent/Lit Protocol
- Access control enforced (only qualified solvers can decrypt)
- Winner gets execution permission

### 4. Execution
Winner executes via Avail Nexus:
1. Bridge USDC from Arbitrum → Optimism
2. Bridge USDT from Polygon → Optimism  
3. Swap USDT → USDC
4. Supply to Morpho protocol

Final position: **~499.5 USDC on Morpho/Optimism at 13.2% APY**

### 5. Verification
- ZK proof generated and submitted
- IntentVerifier contract records commitment
- Anti-replay protection enforced
- On-chain event emitted

## 📁 Project Structure

```
zk-intent-fusion/
├── packages/
│   ├── foundry/                    # Smart contracts (Solidity)
│   │   ├── contracts/
│   │   │   ├── IntentVerifier.sol  # Anti-replay + verification
│   │   │   └── SolverRegistry.sol  # Qualified solver list
│   │   ├── script/
│   │   │   └── DeployIntentContracts.s.sol
│   │   └── test/
│   │
│   ├── nextjs/                     # Frontend (Next.js)
│   │   ├── app/
│   │   │   ├── page.tsx            # Home
│   │   │   └── zk-intent/
│   │   │       └── page.tsx        # Main demo page
│   │   ├── components/
│   │   │   ├── IntentForm.tsx      # Natural language input
│   │   │   ├── AuctionPanel.tsx    # Solver bids
│   │   │   ├── ExecutionPanel.tsx  # Cross-chain execution
│   │   │   └── ProofCard.tsx       # ZK verification
│   │   └── lib/
│   │       └── apiClient.ts        # Backend API client
│   │
│   └── solver/                     # Python backend (FastAPI)
│       ├── src/
│       │   ├── api/
│       │   │   └── server.py       # Main API routes
│       │   ├── agents/
│       │   │   ├── solver_a_agent.py  # Morpho solver
│       │   │   ├── solver_b_agent.py  # Aave solver
│       │   │   └── solver_c_agent.py  # Unqualified solver
│       │   ├── core/
│       │   │   └── orchestration.py   # Auction engine
│       │   ├── integrations/
│       │   │   ├── lit.py          # Access control
│       │   │   └── nexus.py        # Cross-chain execution
│       │   └── zk/
│       │       ├── circuits/       # Noir ZK circuits
│       │       └── mock_prover.py  # Mock proof generation
│       └── .env.example
│
├── start-demo.sh                   # Automated startup
├── stop-demo.sh                    # Stop all services
├── STARTUP_GUIDE.md                # Detailed setup guide
└── README.md                       # This file
```

## 🔑 Key Features Implemented

### ✅ Security & Access Control
- **Anti-Replay Protection**: `intentProcessed` mapping prevents double-spending
- **Qualified Solver Registry**: On-chain whitelist enforces access control
- **State Management**: Separate tracking for intent processing, winner selection, execution
- **Lit Protocol Integration**: Privacy-preserving access control (MVP uses hardcoded list)

### ✅ Solver Auction
- **Multi-Solver Competition**: 3 solvers (Morpho, Aave, Unqualified)
- **Strategy-Based Selection**: Highest APY vs. Lowest Gas
- **Access Control Demo**: Solver C always rejected (not in registry)
- **Transparent Bidding**: All bids visible to user

### ✅ Cross-Chain Execution
- **Avail Nexus Simulation**: Multi-step cross-chain operations
- **Asset Bridging**: USDC/USDT from Arbitrum/Polygon → Optimism
- **Protocol Integration**: Morpho, Aave yield strategies
- **Execution Tracking**: Real-time progress visualization

### ✅ ZK Verification
- **Noir Circuit Structure**: Poseidon hash ready (uses addition in MVP)
- **Proof Generation**: Mock prover generates valid-looking proofs
- **On-Chain Anchor**: IntentVerifier contract records commitments
- **Verification Events**: On-chain events for auditability

### ✅ User Experience
- **Wallet Connection Required**: Uses RainbowKit + wagmi
- **Natural Language Input**: Plain English intent parsing
- **Real-Time Updates**: Live auction and execution status
- **Progress Stepper**: Visual flow indicator
- **Error Handling**: Loading states and error messages

## 🧪 Testing

### Run Smart Contract Tests
```bash
cd packages/foundry
forge test
```

### Test Solver Backend
```bash
cd packages/solver
python -m pytest tests/
```

### Manual API Testing
```bash
# Start backend first
cd packages/solver
python -m uvicorn src.api.server:app --port 8787

# Test endpoints
curl http://localhost:8787/
curl -X POST http://localhost:8787/parse-intent \
  -H "Content-Type: application/json" \
  -d '{"intent": "Use all stablecoins for 3 months, highest APY"}'
```

## 🚨 Known Limitations (MVP)

### Backend
- ⚠️ State is in-memory (lost on restart)
- ⚠️ ZK proofs are mocked (no real Noir proving)
- ⚠️ Access control uses hardcoded list (not querying on-chain registry)
- ⚠️ Cross-chain execution is simulated (not using Avail Nexus SDK)
- ⚠️ ASI Chat is mocked (simple pattern matching)

### Smart Contracts
- ⚠️ No actual ZK verification (only records commitment)
- ⚠️ Test solvers hardcoded in deployment script
- ⚠️ No upgradeability (would need proxy pattern)

### Frontend
- ⚠️ Limited error handling in AuctionPanel/ExecutionPanel
- ⚠️ No persistent transaction history
- ⚠️ Assumes single-chain deployment (Anvil only)

## 🛣️ Roadmap to Production

### Phase 1: Core Components
- [ ] Real Noir circuit with Poseidon hash
- [ ] Query on-chain registry from Python backend
- [ ] Integrate actual Lit Protocol SDK
- [ ] Use real Avail Nexus SDK for bridging
- [ ] Integrate ASI Chat API

### Phase 2: Infrastructure
- [ ] PostgreSQL database for state persistence
- [ ] Redis for caching and rate limiting
- [ ] Docker Compose for easy deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Testnet deployment (Optimism Sepolia)

### Phase 3: Advanced Features
- [ ] Multi-chain support (Arbitrum, Base, Polygon)
- [ ] Intent batching and aggregation
- [ ] Solver reputation system
- [ ] MEV protection
- [ ] Advanced strategies (DCA, limit orders, etc.)

### Phase 4: Production Hardening
- [ ] Comprehensive test coverage (>90%)
- [ ] Security audit (contracts + backend)
- [ ] Load testing and optimization
- [ ] Monitoring and alerting
- [ ] User documentation and tutorials

## 📖 Documentation

- **[Startup Guide](./STARTUP_GUIDE.md)**: Complete setup and troubleshooting
- **[API Documentation](http://localhost:8787/docs)**: FastAPI interactive docs
- **[Contributing](./CONTRIBUTING.md)**: Guidelines for contributors

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENCE](./LICENCE) file for details.

## 🙏 Acknowledgments

Built with:
- [Scaffold-ETH 2](https://scaffoldeth.io) - Ethereum development toolkit
- [Foundry](https://getfoundry.sh) - Smart contract framework
- [Next.js](https://nextjs.org) - React framework
- [FastAPI](https://fastapi.tiangolo.com) - Python API framework
- [Noir](https://noir-lang.org) - ZK circuit language

Sponsored by AlphaMax Hackathon:
- **Fetch.ai** (ASI Chat)
- **Lit Protocol** (Vincent)
- **Avail** (Nexus)

---

<div align="center">

**Built for AlphaMax Hackathon 2025** 🚀

[Report Bug](https://github.com/your-repo/issues) · [Request Feature](https://github.com/your-repo/issues)

</div>