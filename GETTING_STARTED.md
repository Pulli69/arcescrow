# 🚀 Complete Arc dApp Deployment - Getting Started

**Status: Ready to Deploy** ✅

Your ArcEscrow escrow contract and frontend integration are complete. Follow this guide to deploy and launch your Arc ecosystem dApp.

---

## Quick Start (5 Minutes)

### 1. Install Hardhat Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers @openzeppelin/contracts dotenv ts-node
```

### 2. Configure Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit .env and add your test wallet private key
# PRIVATE_KEY=your_private_key_without_0x_prefix
```

Get test wallet key from MetaMask:
- Settings → Security & Privacy → Show Private Key
- Copy WITHOUT the `0x` prefix

### 3. Deploy to Arc Testnet

```bash
# First, compile contracts
npx hardhat compile

# Deploy to Arc Testnet
npx hardhat run scripts/deploy.js --network arcTestnet
```

### 4. Update Frontend

Copy contract addresses from deployment output to `.env`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0...  # From deployment output
NEXT_PUBLIC_USDC_ADDRESS=0xabcd...      # From deployment output
NEXT_PUBLIC_CHAIN_ID=5042002
```

### 5. Restart Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - Your contract is now live! 🎉

---

## Step-by-Step Deployment

### Prerequisites

- ✅ Node.js v18+ installed
- ✅ Arc Testnet in MetaMask/Rabby
- ✅ Testnet ETH from Arc faucet
- ✅ This project with all contracts

### Step 1: Install Dependencies (2 minutes)

```bash
npm install --save-dev \
  hardhat \
  @nomicfoundation/hardhat-ethers \
  @openzeppelin/contracts \
  dotenv \
  ts-node
```

**What gets installed:**
| Package | Purpose |
|---------|---------|
| `hardhat` | Smart contract development framework |
| `@nomicfoundation/hardhat-ethers` | Hardhat + ethers.js integration |
| `@openzeppelin/contracts` | Secure smart contract library |
| `dotenv` | Environment variable loader |
| `ts-node` | TypeScript runner |

### Step 2: Set Up Environment (3 minutes)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```
# Arc Testnet RPC
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network

# Your test wallet private key (NO 0x prefix!)
PRIVATE_KEY=abc123def456...

# These will be filled after deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=5042002
```

**⚠️ Safety Tips:**
- Never share your private key
- Use a test wallet only
- `.env` is in `.gitignore` (won't be committed)

### Step 3: Verify Setup (1 minute)

```bash
# Check Hardhat is installed
npx hardhat --version
# Should show: 2.22.x or higher

# Check your wallet has balance
# Go to: https://faucet.testnet.arc.network
# Request testnet ETH
```

### Step 4: Compile Contracts (1 minute)

```bash
npx hardhat compile
```

Expected output:
```
Compiling 2 files with 0.8.20
Solc 0.8.20 finished in 1.2s
✅ Successfully compiled 2 Solidity files
```

### Step 5: Deploy to Arc Testnet (2-3 minutes)

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

Watch the output:

```
════════════════════════════════════════════════════════════════════
🚀 ArcEscrow DEPLOYMENT TO ARC TESTNET
════════════════════════════════════════════════════════════════════

📊 DEPLOYMENT INFORMATION
───────────────────────────────────────────────────────────────────
Network:        arcTestnet
Chain ID:       5042002
RPC URL:        https://rpc.testnet.arc.network
Deployer:       0x1234567890...
Balance:        0.5 ETH
───────────────────────────────────────────────────────────────────

✅ DEPLOYMENT SUCCESSFUL!

📋 DEPLOYMENT SUMMARY
───────────────────────────────────────────────────────────────────
ArcEscrow Contract: 0xdef0123456789abcdef0123456789abcdef01234
USDC Test Token:        0xabcd123456789abcdef0123456789abcdef01234
───────────────────────────────────────────────────────────────────

NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_USDC_ADDRESS=0xabcd123456789abcdef0123456789abcdef01234
```

### Step 6: Update Environment (1 minute)

Copy the addresses from deployment output into `.env`:

```bash
# .env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_USDC_ADDRESS=0xabcd123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_CHAIN_ID=5042002
```

### Step 7: Restart Frontend Server (1 minute)

```bash
npm run dev
```

Your dApp is now live at `http://localhost:3000` with real blockchain interaction!

---

## Verify Deployment

### Check 1: Contract on Block Explorer

Visit your contract:
```
https://explorer.testnet.arc.network/address/0xdef0...
```

You should see:
- ✅ Contract code verified
- ✅ Deployment transaction
- ✅ Your wallet as creator

### Check 2: Test Contract Calls

In your React app, test these actions:

1. ✅ **Create Task** - Send USDC to escrow
2. ✅ **Submit Proof** - Worker uploads proof link
3. ✅ **Approve Task** - Release payment to worker
4. ✅ **Check Balance** - Verify USDC transfer

### Check 3: MetaMask Transactions

Each action should show in MetaMask:
- ✅ Transaction hash
- ✅ Gas fee
- ✅ Status (pending/confirmed)

---

## Using the Frontend Integration

### Available React Hooks

In your components, import and use hooks:

```typescript
import { useCreateTask, useApproveTask } from "@/lib/useContract";
import { ethers } from "ethers";

export function MyComponent() {
  const { createTask, loading, error } = useCreateTask();

  const handleCreate = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    await createTask(signer, workerAddress, "100", 7);
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? "Creating..." : "Create Task"}
    </button>
  );
}
```

### Available Functions

```typescript
// Create escrow task
createTask(signer, workerAddress, rewardUSDC, deadlineDays)

// Submit proof
submitProof(signer, taskId, proofLink)

// Approve and pay
approveTask(signer, taskId)

// Refund after deadline
refundTask(signer, taskId)

// Read functions
getTask(signer, taskId)          // Get task details
getTotalTasks(signer)            // Get task count
getUSDCBalance(signer, address)  // Get USDC balance
```

Full documentation: See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your React dApp                          │
│              (http://localhost:3000)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         UI Components                                │  │
│  │  (Buttons, Forms, Task Cards)                       │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ uses                                     │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │       React Hooks (useContract.ts)                  │  │
│  │  (useCreateTask, useApproveTask, etc.)             │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ calls                                    │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │   Contract Service (contractService.ts)            │  │
│  │  (ArcEscrowService)                            │  │
│  └────────────────┬─────────────────────────────────────┘  │
└────────────────┬─────────────────────────────────────────────┘
                 │ uses
        ┌────────▼────────────────────────────────┐
        │  ethers.js                              │
        │  (Blockchain interaction library)       │
        └────────┬────────────────────────────────┘
                 │
        ┌────────▼────────────────────────────────┐
        │  Arc Testnet                            │
        │  https://rpc.testnet.arc.network        │
        │  Chain ID: 5042002                      │
        └────────┬────────────────────────────────┘
                 │
        ┌────────▼────────────────────────────────┐
        │  Smart Contracts                        │
        │  ✅ ArcEscrow                       │
        │  ✅ MockUSDC                            │
        └─────────────────────────────────────────┘
```

---

## File Structure

```
arc dapp/
├── 📄 .env                          # Configuration (PRIVATE!)
├── 📄 .env.example                  # Template for .env
├── 📄 hardhat.config.js             # Hardhat configuration
│
├── 📁 contracts/                    # Smart contracts
│   ├── ArcEscrow.sol            # Main escrow contract
│   ├── MockUSDC.sol                 # Test USDC token
│   └── README.md                    # Contract documentation
│
├── 📁 scripts/                      # Deployment scripts
│   └── deploy.js                    # Deployment to Arc Testnet
│
├── 📁 lib/                          # Frontend integration
│   ├── contractConfig.ts            # Contract addresses & ABIs
│   ├── contractService.ts           # Service for interactions
│   ├── useContract.ts               # React hooks
│   └── utils.ts                     # Utility functions
│
├── 📁 app/                          # Next.js app
│   └── page.tsx                     # Homepage
│
├── 📁 components/                   # React components
│   └── ...
│
├── 📄 DEPLOYMENT_GUIDE.md           # Full deployment guide
├── 📄 DEPLOYMENT_CHECKLIST.md       # Checklist
├── 📄 FRONTEND_INTEGRATION.md       # Integration guide
└── 📄 QUICK_START.md                # Quick reference
```

---

## Troubleshooting

### "Cannot find module hardhat"

```bash
npm install --save-dev hardhat
```

### "PRIVATE_KEY not found"

1. Open `.env`
2. Add: `PRIVATE_KEY=your_test_wallet_key`
3. No `0x` prefix!

### "Insufficient funds"

1. Visit Arc faucet: https://faucet.testnet.arc.network
2. Request testnet ETH
3. Wait 1-2 minutes for tokens

### "Invalid network"

Check in `hardhat.config.js`:
- Chain ID is `5042002`
- RPC is `https://rpc.testnet.arc.network`
- Network name is `arcTestnet`

### "Contract address not found"

1. Check `.env` has the contract addresses
2. After deployment, restart `npm run dev`
3. Variables must start with `NEXT_PUBLIC_`

---

## Important Reminders

### Security
- ✅ Never commit `.env` file (it's in `.gitignore`)
- ✅ Never share your private key
- ✅ Use test wallet for development only
- ✅ Don't use mainnet private key in testnet

### Cost
- ✅ Arc Testnet is FREE
- ✅ Get free testnet tokens from faucet
- ✅ No real money involved

### Deployment
- ✅ Takes 2-3 minutes to deploy
- ✅ Contract is permanent on Arc Testnet
- ✅ Transactions are irreversible
- ✅ Check explorer before submitting

---

## Next Steps

After successful deployment:

1. ✅ Test creating tasks from UI
2. ✅ Test submitting proofs
3. ✅ Test approving payments
4. ✅ View transactions on block explorer
5. ✅ Add more features (fees, notifications, etc.)

---

## Complete Documentation

- 📚 [Smart Contract Docs](./contracts/README.md)
- 📖 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🎨 [Frontend Integration](./FRONTEND_INTEGRATION.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

## Key Commands Reference

```bash
# Setup & Installation
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers @openzeppelin/contracts dotenv ts-node
cp .env.example .env

# Development
npx hardhat compile              # Compile contracts
npx hardhat node                 # Run local node
npm run dev                       # Start frontend

# Deployment
npx hardhat run scripts/deploy.js --network arcTestnet

# Verification
npx hardhat verify --network arcTestnet CONTRACT_ADDRESS "constructor_args"
```

---

## Support & Resources

**Arc Testnet:**
- 🔗 [Arc Network Docs](https://docs.arc.network)
- 🌐 [Block Explorer](https://explorer.testnet.arc.network)
- 💧 [Testnet Faucet](https://faucet.testnet.arc.network)

**Smart Contracts:**
- 📚 [Hardhat Docs](https://hardhat.org)
- 🛡️ [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

**Frontend:**
- 🔗 [ethers.js Docs](https://docs.ethers.org)
- ⚛️ [React Docs](https://react.dev)

---

## Feedback & Improvements

Your dApp is complete and ready to deploy! 

Questions? Check the documentation files for detailed information on every aspect.

**Happy deploying! 🚀**

---

**Last Updated:** May 2026  
**Version:** 1.0  
**Status:** Ready for Arc Testnet Deployment ✅
