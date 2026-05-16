# 🚀 Complete Arc Testnet Deployment Guide

This guide walks you through deploying ArcEscrow to Arc Testnet, step by step.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Compilation](#compilation)
5. [Deployment](#deployment)
6. [Verification](#verification)
7. [Frontend Integration](#frontend-integration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

- ✅ Node.js v18+ installed (`node --version`)
- ✅ npm or pnpm (`npm --version`)
- ✅ A test wallet with Arc Testnet tokens
  - MetaMask or Rabby wallet extension
  - Some testnet ETH from Arc's faucet
- ✅ This repository with ArcEscrow contracts already created

### Get Arc Testnet Tokens

Arc Testnet has a faucet for getting test tokens:

1. Go to [Arc Testnet Faucet](https://faucet.testnet.arc.network) (or similar)
2. Connect your wallet
3. Request testnet ETH/USDC
4. Wait for tokens to arrive (~1 minute)

---

## Installation

### Step 1: Install Dependencies

Run this command in your project root:

```bash
npm install --save-dev \
  hardhat \
  @nomicfoundation/hardhat-ethers \
  @openzeppelin/contracts \
  dotenv \
  ts-node
```

**What gets installed:**
- **hardhat** - Development framework
- **@nomicfoundation/hardhat-ethers** - Hardhat + ethers.js integration
- **@openzeppelin/contracts** - Secure smart contracts library
- **dotenv** - Environment variable management
- **ts-node** - TypeScript runtime

### Step 2: Verify Installation

Check that Hardhat was installed:

```bash
npx hardhat --version
```

Expected output: `2.22.x` or higher

---

## Environment Setup

### Step 1: Add Your Test Wallet Private Key

**IMPORTANT: Security Instructions**

1. Open MetaMask or Rabby
2. Go to Settings → Security
3. Click "Export Private Key"
4. Copy the key (it looks like: `abc123def456...`)
5. Open `.env` in your project
6. Paste it into the `PRIVATE_KEY` field (WITHOUT the `0x` prefix)

```bash
# .env
PRIVATE_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx
```

**Safety Tips:**
- ✅ Only use a test wallet for development
- ✅ Never commit `.env` to git (it's in `.gitignore`)
- ✅ Regenerate the wallet after testing
- ✅ Never share your private key with anyone

### Step 2: Verify .env Configuration

Your `.env` should have:

```bash
# Arc Testnet RPC
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network

# Your test wallet private key (without 0x)
PRIVATE_KEY=your_key_here

# These will be filled after deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=5042002
```

---

## Compilation

### Step 1: Compile Contracts

```bash
npx hardhat compile
```

**What happens:**
- Compiles ArcEscrow.sol and MockUSDC.sol
- Generates ABI files (needed for frontend)
- Creates type definitions (TypeScript support)

**Expected output:**
```
Compiling 2 files with 0.8.20
Solc 0.8.20 finished in 1.2s
Successfully compiled 2 Solidity files
```

### Step 2: Check for Errors

If you see errors:

```
Error: Cannot find module '@openzeppelin/contracts'
```

**Fix:** Install OpenZeppelin contracts

```bash
npm install @openzeppelin/contracts
```

Common errors and fixes:

| Error | Fix |
|-------|-----|
| `Cannot find module 'hardhat'` | `npm install --save-dev hardhat` |
| `Solidity version mismatch` | Edit first line of contract to match compiler version |
| `Unknown @openzeppelin/contracts` | `npm install @openzeppelin/contracts` |

---

## Deployment

### Step 1: Check Your Balance

Before deploying, verify you have Arc Testnet ETH:

```bash
npx hardhat run scripts/deploy.js --network arcTestnet --dry-run
```

This shows what will happen without actually deploying.

### Step 2: Deploy to Arc Testnet

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

**The script will:**
1. ✅ Deploy MockUSDC contract
2. ✅ Deploy ArcEscrow contract
3. ✅ Mint 10,000 test USDC
4. ✅ Approve contract to spend USDC
5. ✅ Save addresses to `deployment-config.json`

**Expected output:**

```
═══════════════════════════════════════════════════════════════════
🚀 ArcEscrow DEPLOYMENT TO ARC TESTNET
═══════════════════════════════════════════════════════════════════

📊 DEPLOYMENT INFORMATION
───────────────────────────────────────────────────────────────────
Network:        arcTestnet
Chain ID:       5042002
RPC URL:        https://rpc.testnet.arc.network
Deployer:       0x1234567890...
Balance:        0.5 ETH
───────────────────────────────────────────────────────────────────

📝 STEP 1: Deploying Mock USDC Token
───────────────────────────────────────────────────────────────────
✅ MockUSDC deployed at: 0xabcd...

📝 STEP 2: Deploying ArcEscrow Contract
───────────────────────────────────────────────────────────────────
✅ ArcEscrow deployed at: 0xdef0...

... (more steps)

✅ DEPLOYMENT SUCCESSFUL!
═══════════════════════════════════════════════════════════════════

📋 DEPLOYMENT SUMMARY
───────────────────────────────────────────────────────────────────
ArcEscrow Contract: 0xdef0...
USDC Test Token:        0xabcd...
Deployer Account:       0x1234...
Network:                Arc Testnet (Chain ID: 5042002)
───────────────────────────────────────────────────────────────────

📁 SAVED: deployment-config.json
```

### Step 3: Save Contract Addresses

The deployment script saves addresses to `deployment-config.json`. You'll see output like:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_USDC_ADDRESS=0xabcd123456789abcdef0123456789abcdef01234
```

**Copy these into your `.env` file:**

```bash
# .env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_USDC_ADDRESS=0xabcd123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_CHAIN_ID=5042002
```

---

## Verification

### Step 1: Check Deployment

View your deployed contract on Arc Testnet block explorer:

```
https://explorer.testnet.arc.network/address/{CONTRACT_ADDRESS}
```

Replace `{CONTRACT_ADDRESS}` with your ArcEscrow contract address.

### Step 2: Verify Contract Code (Optional)

If Arc Testnet has a block explorer, you can verify your source code:

1. Go to the contract address on the explorer
2. Click "Verify Contract"
3. Upload your contracts/ArcEscrow.sol
4. Select compiler version: 0.8.20
5. Select license: MIT

---

## Frontend Integration

### Step 1: Update Environment Variables

Ensure your `.env` has the contract address:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0...
NEXT_PUBLIC_USDC_ADDRESS=0xabcd...
NEXT_PUBLIC_CHAIN_ID=5042002
```

**Note:** Variables with `NEXT_PUBLIC_` prefix are available in your browser!

### Step 2: Restart Development Server

```bash
npm run dev
```

The frontend will now pick up the contract addresses from environment variables.

### Step 3: Test Connection

In your React component:

```typescript
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;

console.log("Contract:", contractAddress);
console.log("USDC:", usdcAddress);
```

If you see the addresses logged, your setup is correct!

---

## Testing

### Step 1: Manual Testing

1. Go to http://localhost:3000
2. Connect your wallet (MetaMask/Rabby)
3. Make sure you're on Arc Testnet (Chain ID: 5042002)
4. Try creating a task:
   - Enter a worker address
   - Set reward amount (e.g., 10 USDC)
   - Set deadline (e.g., 7 days)
   - Click "Create Task"

### Step 2: View Transactions

All transactions appear on Arc Testnet block explorer:

```
https://explorer.testnet.arc.network/tx/{TRANSACTION_HASH}
```

### Step 3: Check USDC Balance

```javascript
// In browser console or component
const usdcContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_USDC_ADDRESS,
  ["function balanceOf(address) view returns (uint256)"],
  provider
);

const balance = await usdcContract.balanceOf(yourAddress);
console.log("USDC Balance:", ethers.formatUnits(balance, 6));
```

---

## Troubleshooting

### "Insufficient Funds"

**Problem:** Deployment fails with "insufficient funds"

**Solution:**
1. Get testnet ETH from Arc faucet
2. Wait a few minutes for tokens to arrive
3. Check balance: `npx hardhat run scripts/check-balance.js --network arcTestnet`

### "Invalid Private Key"

**Problem:** `Error: invalid privateKey`

**Solution:**
1. Check your `.env` file
2. Make sure you removed the `0x` prefix
3. Make sure there are no spaces: `PRIVATE_KEY=abc123...` (no spaces)
4. Regenerate a new test wallet if corrupted

### "Network Error"

**Problem:** `Error: could not detect network`

**Solution:**
1. Check RPC URL in hardhat.config.js
2. Verify Arc Testnet RPC is working: `https://rpc.testnet.arc.network`
3. Check your internet connection
4. Try a different RPC endpoint

### "Contract Address Shows 0x000..."

**Problem:** Deployment completed but contract address is invalid

**Solution:**
1. Check gas limits (might be too low for Arc)
2. Verify you have enough ETH
3. Check network chain ID matches (should be 5042002)

### "MetaMask Shows Wrong Network"

**Problem:** MetaMask is on different network than Arc Testnet

**Solution:**
1. Open MetaMask
2. Click network dropdown (top-left)
3. Select "Add Network"
4. Fill in Arc Testnet details:
   - Network Name: `Arc Testnet`
   - RPC URL: `https://rpc.testnet.arc.network`
   - Chain ID: `5042002`
   - Currency: `USDC`
   - Explorer: `https://explorer.testnet.arc.network`

---

## Next Steps

After successful deployment:

1. ✅ Connect frontend buttons to contract functions
2. ✅ Create React hooks for contract interactions
3. ✅ Add loading/error states
4. ✅ Display task status in UI
5. ✅ Handle transaction confirmations

See the **Frontend Integration** guide for connecting your UI to the smart contract.

---

## Quick Commands Reference

```bash
# Compile contracts
npx hardhat compile

# Deploy to Arc Testnet
npx hardhat run scripts/deploy.js --network arcTestnet

# Deploy to local Hardhat node (for testing)
npx hardhat node                    # Terminal 1
npx hardhat run scripts/deploy.js   # Terminal 2

# Check contract ABI
cat artifacts/contracts/ArcEscrow.sol/ArcEscrow.json | jq '.abi'

# Format code
npx hardhat format

# Get block number
npx hardhat run scripts/get-block-number.js --network arcTestnet
```

---

## Support

Need help?

- 📚 [ArcEscrow Contract Docs](./contracts/README.md)
- 📖 [Hardhat Documentation](https://hardhat.org)
- 🔗 [Arc Network Docs](https://docs.arc.network)
- 🤝 [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

Happy deploying! 🎉
