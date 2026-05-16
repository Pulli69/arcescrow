# ✅ Deployment Checklist - Step by Step

Follow this checklist to deploy to Arc Testnet safely and correctly.

## Pre-Deployment Checklist

- [ ] Installed dependencies: `npm install --save-dev hardhat @nomicfoundation/hardhat-ethers @openzeppelin/contracts dotenv ts-node`
- [ ] Created `.env` file with `PRIVATE_KEY`
- [ ] Have Arc Testnet ETH from faucet
- [ ] Have MetaMask or Rabby installed
- [ ] Arc Testnet network added to wallet
  - RPC: https://rpc.testnet.arc.network
  - Chain ID: 5042002

## Step 1: Verify Hardhat Installation

```bash
npx hardhat --version
```

✅ Should show: `2.22.x` or higher

## Step 2: Compile Contracts

```bash
npx hardhat compile
```

**Expected output:**
```
Compiling 2 files with 0.8.20
Solc 0.8.20 finished in 1.2s
Successfully compiled 2 Solidity files
```

✅ Files should be generated:
- `artifacts/contracts/ArcEscrow.sol/ArcEscrow.json`
- `artifacts/contracts/MockUSDC.sol/MockUSDC.json`

## Step 3: Verify Network Configuration

Check your `hardhat.config.js`:

```bash
grep -A 5 "arcTestnet:" hardhat.config.js
```

Should show:
```
arcTestnet: {
  url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 5042002,
```

✅ Verify: Chain ID is `5042002`

## Step 4: Check Wallet Balance

```bash
npx hardhat run -e scripts/check-balance.js --network arcTestnet
```

(If file doesn't exist, create it - see below)

You should see a balance > 0 ETH

## Step 5: Deploy to Arc Testnet

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

**This will:**
1. Deploy ArcEscrow contract
2. Deploy MockUSDC contract
3. Mint test USDC
4. Save addresses to `deployment-config.json`

## Step 6: Save Contract Addresses

After deployment succeeds, you'll see output like:

```
ArcEscrow Contract: 0xdef0123456789abcdef0123456789abcdef01234
USDC Test Token:        0xabcd123456789abcdef0123456789abcdef01234
```

Copy these addresses into `.env`:

```bash
# .env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_USDC_ADDRESS=0xabcd123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_CHAIN_ID=5042002
```

## Step 7: Restart Frontend Server

```bash
npm run dev
```

Visit http://localhost:3000 and verify your wallet is connected to Arc Testnet.

## Step 8: Verify on Block Explorer

Visit your contract on Arc block explorer:

```
https://explorer.testnet.arc.network/address/0xdef0123456789abcdef0123456789abcdef01234
```

You should see:
- ✅ Contract code
- ✅ Transactions (deployment + setup)
- ✅ Your wallet address as creator

## Post-Deployment Verification

Run these checks:

### Check 1: Contract Exists

```bash
npx hardhat run scripts/check-contract.js --network arcTestnet
```

### Check 2: USDC Balance

```bash
npx hardhat run scripts/check-usdc-balance.js --network arcTestnet
```

Should show: 10000.000000 USDC

### Check 3: Test Contract Read

```bash
npx hardhat run scripts/test-read.js --network arcTestnet
```

Should show total tasks = 0

## Common Issues During Deployment

| Issue | Solution |
|-------|----------|
| "Cannot find module 'hardhat'" | `npm install --save-dev hardhat` |
| "PRIVATE_KEY not found" | Add `PRIVATE_KEY=your_key` to `.env` |
| "insufficient funds" | Get more testnet ETH from faucet |
| "invalid privateKey" | Remove `0x` prefix from private key |
| "unknown account" | Check PRIVATE_KEY is correct |
| "Network request failed" | Check RPC URL and internet connection |

## Deployment Success Signs

✅ You'll know deployment succeeded when:

1. Script completes without errors
2. `deployment-config.json` is created
3. Contract addresses are printed
4. You see "✅ DEPLOYMENT SUCCESSFUL!"

## Next: Frontend Integration

Once deployment succeeds:

1. ✅ Copy contract addresses to `.env`
2. ✅ Restart `npm run dev`
3. ✅ Create React hooks for contract functions
4. ✅ Connect UI buttons to smart contract
5. ✅ Test creating a task from the UI

See: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

## Need Help?

- 📖 Full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 📚 Contract docs: [contracts/README.md](./contracts/README.md)
- 🔗 Arc Testnet: https://docs.arc.network

---

**Remember:** Take your time with each step. Rushing through deployment can cause issues.

Good luck! 🚀
