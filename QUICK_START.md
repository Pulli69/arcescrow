# ArcEscrow Quick Start Guide

A complete marketplace-style escrow system for Arc Testnet with:
- ✅ **ArcEscrow.sol** - Main marketplace contract
- ✅ **MockUSDC.sol** - Test token for development
- ✅ **deploy.js** - Automated deployment script
- ✅ **useBlockchain.ts** - Production React hooks

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env` and add your `PRIVATE_KEY`.

### 3. Deploy to Arc Testnet
```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

The deployment script will:
- ✅ Deploy ArcEscrow contract
- ✅ Deploy MockUSDC token
- ✅ Mint test USDC
- ✅ Save config to `deployment-config.json`

## Marketplace Workflow

```
1️⃣  Creator posts task (Status: Open)
    └─> USDC locked in escrow

2️⃣  Worker claims task (acceptTask)
    └─> Status: Accepted

3️⃣  Worker submits proof link
    └─> Status: ProofSubmitted

4️⃣  Creator approves and pay (Status: Paid)
    └─> Worker receives USDC
```

## Developer Resources
- [Detailed Documentation](./INDEX.md)
- [Contract README](./contracts/README.md)
- [Quick Reference](./QUICK_REFERENCE.md)

Happy building! 🚀
