# 🎭 Multi-Role Demo Guide - ZK-Intent Fusion

## 📖 Overview

This guide explains how to run the complete multi-role demonstration of ZK-Intent Fusion, showcasing the entire system from 7 different perspectives.

## 🚀 Quick Start (Complete Demo in 7 Minutes)

### Prerequisites

✅ Backend running on `http://localhost:8787`  
✅ Frontend running on `http://localhost:3000`  
✅ Wallet connected (use Anvil account for local testing)  
✅ Smart contracts deployed to local Anvil

---

## 🎬 Demo Flow

### **Phase 0: Setup (Before Demo Starts)**

Open **7 browser tabs** with the following URLs:

1. **Tab 1:** `http://localhost:3000/zk-intent` (👤 User Alice)
2. **Tab 2:** `http://localhost:3000/zk-intent/parsing` (🤖 Parsing Agent)
3. **Tab 3:** `http://localhost:3000/zk-intent/solvers/bob` (🏆 Solver Bob - Qualified)
4. **Tab 4:** `http://localhost:3000/zk-intent/solvers/charlie` (🏆 Solver Charlie - Qualified)
5. **Tab 5:** `http://localhost:3000/zk-intent/solvers/eve` (⛔ Solver Eve - Unqualified)
6. **Tab 6:** `http://localhost:3000/zk-intent/auction` (🎯 Auction Dashboard)
7. **Tab 7:** `http://localhost:3000/zk-intent/execution` (🚀 Execution Monitor)

**💡 Tip:** Arrange your tabs or windows so you can see multiple perspectives at once.

---

### **Phase 1: User Submits Intent (Tab 1 - ~30 seconds)**

**Navigate to:** Tab 1 (User Alice)

**What you see:**
- Intent input form
- Wallet connection status
- Empty auction and execution panels

**Actions:**
1. Enter natural language intent:
   ```
   Use all my stablecoins for 3 months, highest APY, tolerate 3% gas
   ```
2. Click **"Parse Intent & Run Auction"**

**What happens:**
- Intent is sent to the backend
- Backend parses the intent using ASI (simulated)
- Intent gets encrypted and broadcast to solver network
- Multi-role demo links appear

**Expected result:**
```
✅ Intent parsed successfully
✅ Auction initiated
🔗 Links to other perspective pages appear
```

---

### **Phase 2: Check Parsing Agent (Tab 2 - ~10 seconds)**

**Navigate to:** Tab 2 (Parsing Agent)

**What you see:**
- Real-time parsing progress (animated)
- Original natural language intent
- Step-by-step parsing indicators
- Parsed JSON structure
- Encryption status
- Intent commitment hash

**Key highlight:**
> "This shows how AI (ASI) converts natural language into structured, machine-readable format, then encrypts it for privacy."

**Timeline:**
- ⏳ Detecting tokens... (16%)
- ⏳ Detecting chains... (33%)
- ⏳ Detecting constraints... (50%)
- ⏳ Detecting goal... (67%)
- ✅ Generating JSON... (83%)
- ✅ Encrypting payload... (100%)

---

### **Phase 3: Solver Perspectives (Tabs 3, 4, 5 - ~1 minute)**

#### **Tab 3: Solver Bob (Qualified) ✅**

**What you see:**
- ✅ Status: Qualified (AUM: $5.2M, Track: 98.5%)
- 🔓 **Can see decrypted intent** (plaintext visible)
- zkTLS verification passed
- Bob's proposal:
  - Strategy: Supply to Morpho (Optimism)
  - APY: 12.5%
  - Gas: $12.50 (2.5%)
  - Route with 4 steps
  - ZK Proof: ✅ Verified

**Action:** Click **"Submit Bid"**

---

#### **Tab 4: Solver Charlie (Qualified) ✅**

**What you see:**
- ✅ Status: Qualified (AUM: $3.8M, Track: 95.2%)
- 🔓 **Can see decrypted intent** (plaintext visible)
- Charlie's proposal:
  - Strategy: Supply to Aave V3 (Base)
  - APY: 11.8%
  - Gas: $15.00 (3.0%)

**Action:** Click **"Submit Bid"**

---

#### **Tab 5: Solver Eve (Unqualified) ❌ - ⭐ PRIVACY DEMO**

**What you see:**
- ❌ Status: Not Verified (AUM: $100K, Track: N/A)
- 🔐 **ONLY SEES ENCRYPTED DATA** (gibberish hex)
- Cannot decrypt intent
- zkTLS verification failed
- Access Denied message with explanation

**Key Message:**
```
🔒 Privacy Protection: Even though this intent is on-chain, 
you cannot see the details because you don't meet the 
qualification criteria. This demonstrates selective disclosure 
with zero-knowledge proofs.
```

**Highlights:**
- Shows why zkTLS matters
- Demonstrates privacy even with public data
- Explains how it protects users from MEV bots
- Technical comparison section

**演讲重点：**
> "这是整个系统的核心创新！即使Intent的commitment在链上公开，不合格的Solver也无法看到明文内容。这保护了用户的交易策略不被抢跑或MEV攻击。"

---

### **Phase 4: Auction Dashboard (Tab 6 - ~30 seconds)**

**Navigate to:** Tab 6 (Auction Dashboard)

**What you see:**
- Intent ID and status: 🟢 Closed
- Received Bids (3 total):
  
  **1. 🏆 Solver Bob (WINNER)**
  - ✅ Qualified
  - Gas: $12.50 (2.5%)
  - APY: 12.5%
  - Protocol: Morpho (Optimism)
  - zkTLS Proof: ✅ Verified

  **2. Solver Charlie**
  - ✅ Qualified
  - Gas: $15.00 (3.0%)
  - APY: 11.8%
  - Protocol: Aave V3 (Base)

  **3. ❌ Solver Eve (REJECTED)**
  - ❌ Not qualified
  - Reason: Failed zkTLS verification

- **Winner Selection Criteria:**
  - ✅ Higher APY (12.5% > 11.8%)
  - ✅ Lower gas cost ($12.50 < $15.00)
  - ✅ Within gas tolerance (2.5% < 3%)

- **On-Chain ZK Proofs:**
  1. zkTLS Proof (Bob qualified)
  2. Intent Commitment Proof  
  3. Auction Result Proof

**Status:** ⏰ Waiting for User Authorization...

---

### **Phase 5: User Authorization (Back to Tab 1 - ~10 seconds)**

**Navigate to:** Tab 1 (User Alice)

**What you see:**
- ✅ Intent parsed
- ✅ Auction completed
- 🏆 Winning proposal displayed (Bob's)
- **Authorization prompt**

**Action:** Click **"Authorize Execution"**

**What happens:**
- Authorization transaction simulated
- State updates across all tabs
- Execution begins automatically

---

### **Phase 6: Execution Monitor (Tab 7 - ~2 minutes)** 🚀

**Navigate to:** Tab 7 (Execution Monitor)

**What you see (Real-time updates):**

**Executor:** Solver Bob

**Step 1: Bridge USDC (Arbitrum → Optimism)**
- Status: ⏳ In Progress → ✅ Completed
- Via: Avail Nexus
- Source Tx: 0xabc... (Arbitrum)
- Dest Tx: 0x123... (Optimism)
- Amount: 250 USDC
- Fee: $3.50

**Step 2: Bridge USDT (Polygon → Optimism)**
- Status: ⏳ In Progress → ✅ Completed
- Via: Avail Nexus
- Source Tx: 0xghi... (Polygon)
- Dest Tx: 0x789... (Optimism)
- Amount: 250 USDT
- Fee: $3.00

**Step 3: Swap USDT → USDC (Optimism)**
- Status: ⏳ In Progress → ✅ Completed
- Via: Uniswap V3
- Amount: 250 USDT → 249.5 USDC
- Fee: $2.00

**Step 4: Supply to Morpho (Optimism)**
- Status: ⏳ In Progress → ✅ Completed
- Amount: 499.5 USDC
- Current APY: 12.5%
- Fee: $4.00

**💰 Final Result:**
- Initial Assets: 500 USD (250 USDC + 250 USDT)
- Total Gas Fees: $12.50
- Final Position: 499.5 USDC @ Morpho (Optimism)
- Expected Monthly Yield: ~$5.20
- Net Return (3 months): ~$3.10 profit

**🔐 ZK Proof Generation:**
- Proof Type: Execution Correctness
- What was proven:
  - ✅ All transactions executed correctly
  - ✅ Final balance matches expectation
  - ✅ Gas costs were accurate
  - ✅ No funds lost or stolen
  - ✅ Original intent was followed
- Status: ✅ Verified on-chain (Block #12345690)
- Verifier: IntentVerifier Contract

**🎉 Execution Complete!**

---

## 🎯 Key Demo Highlights

### **1. Privacy Protection (Tab 5 - Eve)**
⭐ **Most Important Feature**
- Unqualified solver sees only encrypted data
- Even though commitment is on-chain
- Demonstrates zkTLS access control
- Protects against MEV and front-running

### **2. AI-Powered Parsing (Tab 2)**
- Natural language → Structured JSON
- Real-time progress visualization
- Encryption for privacy

### **3. Transparent Competition (Tab 6)**
- Multiple qualified solvers compete
- Winner selected based on merit
- All proofs recorded on-chain

### **4. Cross-Chain Execution (Tab 7)**
- Avail Nexus integration
- Real-time step-by-step updates
- Complete transparency

### **5. End-to-End Verification**
- ZK proofs at every stage
- On-chain verification
- Trustless execution

---

## 🎤 Presentation Script (7 Minutes)

```
[00:00 - Opening]
"大家好，我将通过7个不同的视角展示ZK-Intent Fusion如何解决跨链DeFi的隐私和信任问题。"

[00:30 - Tab 1]
"首先，用户Alice用自然语言描述她的投资意图，无需理解复杂的跨链操作。"
*Submit intent*

[01:00 - Tab 2]
"AI Agent实时解析自然语言，生成结构化数据，并加密保护隐私。"
*Show parsing progress*

[01:30 - Tab 3, 4]
"合格的Solver（Bob和Charlie）通过zkTLS验证，可以看到明文并提出方案。"
*Show decrypted views*

[02:30 - Tab 5] ⭐
"但是！不合格的Solver Eve只能看到密文。这展示了我们的核心创新：
即使数据在链上，也能通过zkTLS实现选择性披露，保护用户隐私。"
*Highlight encrypted view*

[03:30 - Tab 6]
"拍卖系统自动选择最优方案，所有证明都上链，完全透明。"
*Show auction results and ZK proofs*

[04:00 - Tab 1]
"Alice确认后，授权执行。"
*Click authorize*

[04:30 - Tab 7] ⭐
"执行阶段，我们集成Avail Nexus进行真实的跨链桥接，生成ZK Proof证明执行正确性，
所有证明通过Avail DA锚定到链上。"
*Show real-time execution*

[06:30 - Summary]
"整个流程实现了三个目标：
1. 用户友好：自然语言输入
2. 隐私保护：zkTLS + 选择性披露
3. 可验证性：所有步骤都有ZK Proof

这就是Web3应该有的样子：简单、安全、透明。谢谢大家！"
```

---

## 🔧 Troubleshooting

### Tabs not updating?
- Make sure Zustand store is working (check browser console)
- Try refreshing all tabs
- Check if backend is running

### Authorization not working?
- Make sure auction is completed first
- Check Tab 6 to see auction status
- Winner must be selected before authorization

### Execution not starting?
- Make sure authorization is completed (Tab 1)
- Check Tab 7 - it should auto-start after authorization
- Refresh Tab 7 if needed

---

## 📊 Success Checklist

- [ ] All 7 tabs opened successfully
- [ ] Intent parsed and displayed (Tab 2)
- [ ] Bob and Charlie can see decrypted intent (Tabs 3, 4)
- [ ] Eve can only see encrypted data (Tab 5) ⭐
- [ ] Auction completed with winner (Tab 6)
- [ ] User authorized execution (Tab 1)
- [ ] All 4 execution steps completed (Tab 7)
- [ ] ZK proofs generated and verified (Tab 7)

---

## 🎉 You're Ready!

Open `http://localhost:3000/zk-intent` and start the demo!

Remember: **Tab 5 (Eve)** is your key highlight for privacy protection! 🔒
