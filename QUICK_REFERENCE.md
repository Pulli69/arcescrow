# 📌 Quick Reference Card

Print this or bookmark it for easy access while deploying ArcEscrow!

---

## 🚀 Deployment Flow (5 Steps)

```
1️⃣  npm install
         ↓
2️⃣  cp .env.example .env  →  Edit with PRIVATE_KEY
         ↓
3️⃣  npx hardhat compile
         ↓
4️⃣  npx hardhat run scripts/deploy.js --network arcTestnet
         ↓
5️⃣  Copy addresses to .env → npm run dev
         ✅ DONE!
```

---

## 🔑 Arc Testnet Details

| Property | Value |
|----------|-------|
| **RPC URL** | `https://rpc.testnet.arc.network` |
| **Chain ID** | `5042002` |
| **Currency** | USDC |
| **Explorer** | https://testnet.arcscan.app |
| **Faucet** | https://faucet.testnet.arc.network |

---

## 📦 Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `hardhat.config.js` | Hardhat config for Arc | ✅ Done |
| `.env` | Private key & addresses | 🔄 To Do |
| `contracts/ArcEscrow.sol` | Main marketplace contract | ✅ Done |
| `scripts/deploy.js` | Deployment script | ✅ Done |
| `lib/contracts.ts` | Unified ABIs & config | ✅ Done |
| `hooks/useBlockchain.ts` | Production React hooks | ✅ Done |

---

## 🎣 React Hooks Cheat Sheet

```typescript
// Import from blockchain hooks
import { useCreateTask, useAcceptTask, useSubmitProof, ... } from "@/hooks/useBlockchain";

// Create Task (Open or Assigned)
const { createTask, loading } = useCreateTask();
await createTask(workerAddrOrZero, "100", 7);

// Accept Task (Worker)
const { acceptTask } = useAcceptTask();
await acceptTask(taskId);

// Submit Proof
const { submitProof } = useSubmitProof();
await submitProof(taskId, "ipfs://Qm...");

// Approve & Release
const { approveTask } = useApproveTask();
await approveTask(taskId);
```

---

## 📝 .env Template

```
# Arc Testnet
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network

# Your test wallet private key (NO 0x prefix!)
PRIVATE_KEY=

# After deployment (copy from script output)
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
```

---

## 🚀 Deployment Command

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

---

## 🔗 Contract Functions

### Marketplace Logic
- **createTask**: Fund an escrow (can be unassigned).
- **acceptTask**: Worker claims an open task.
- **submitProof**: Worker uploads proof of delivery.
- **approveTask**: Creator releases payment.
- **refundTask**: Creator refunds after deadline.
- **cancelTask**: Creator cancels within 30m (open tasks only).

---

## 📊 Task Status Enum

```typescript
0 → "Open"           // Waiting for claim or work
1 → "Accepted"       // Worker is assigned
2 → "ProofSubmitted" // Proof waiting for approval
3 → "Paid"           // Approved and paid
4 → "Refunded"       // Returned after deadline
5 → "Cancelled"      // Cancelled within 30m
```

---

## 🌐 Block Explorer Links

**View your contract:**
`https://testnet.arcscan.app/address/{YOUR_CONTRACT_ADDRESS}`

**View a transaction:**
`https://testnet.arcscan.app/tx/{TRANSACTION_HASH}`

---

## 📞 Need Help?

1. Check [contracts/README.md](./contracts/README.md) for contract info
2. Join [Discord](https://discord.com/invite/buildonarc)
3. Visit [Docs](https://docs.arc.io/)

**Happy Deploying! 🚀**
