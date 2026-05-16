const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("\n" + "═".repeat(70));
  console.log("🚀 PAYAFTERPROOF DEPLOYMENT TO ARC TESTNET (VANILLA ETHERS)");
  console.log("═".repeat(70) + "\n");

  try {
    const rpcUrl = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
    const privateKey = process.env.PRIVATE_KEY.replace(/^0x/, "").trim();
    
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not found in .env");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const deployer = new ethers.Wallet(privateKey, provider);
    const network = await provider.getNetwork();

    console.log("📊 DEPLOYMENT INFORMATION");
    console.log("─".repeat(70));
    console.log(`Chain ID:       ${network.chainId}`);
    console.log(`RPC URL:        ${rpcUrl}`);
    console.log(`Deployer:       ${deployer.address}`);

    const balance = await provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`Balance:        ${balanceEth} ETH`);

    if (balance === 0n) {
      console.error("\n❌ ERROR: Deployer has 0 balance!");
      console.error("💡 You need testnet tokens. Check Arc's faucet.");
      process.exit(1);
    }

    console.log("─".repeat(70) + "\n");

    // Load compiled artifacts
    const mockUSDCArtifact = require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json");
    const payAfterProofArtifact = require("../artifacts/contracts/PayAfterProof.sol/PayAfterProof.json");

    // ========== STEP 1: Deploy MockUSDC ==========
    console.log("📝 STEP 1: Deploying Mock USDC Token");
    console.log("─".repeat(70));

    const MockUSDCFactory = new ethers.ContractFactory(mockUSDCArtifact.abi, mockUSDCArtifact.bytecode, deployer);
    const mockUSDC = await MockUSDCFactory.deploy();
    await mockUSDC.waitForDeployment();
    
    const usdcAddress = await mockUSDC.getAddress();
    console.log(`✅ MockUSDC deployed at: ${usdcAddress}\n`);

    // ========== STEP 2: Deploy PayAfterProof ==========
    console.log("📝 STEP 2: Deploying PayAfterProof Contract");
    console.log("─".repeat(70));

    const PayAfterProofFactory = new ethers.ContractFactory(payAfterProofArtifact.abi, payAfterProofArtifact.bytecode, deployer);
    const payAfterProof = await PayAfterProofFactory.deploy(usdcAddress);
    await payAfterProof.waitForDeployment();

    const contractAddress = await payAfterProof.getAddress();
    console.log(`✅ PayAfterProof deployed at: ${contractAddress}\n`);

    // ========== STEP 3: Mint Test USDC ==========
    console.log("📝 STEP 3: Minting Test USDC");
    console.log("─".repeat(70));

    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC
    const mintTx = await mockUSDC.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log(`✅ Minted: 10,000 USDC to ${deployer.address}\n`);

    // ========== STEP 4: Approve Contract ==========
    console.log("📝 STEP 4: Approving PayAfterProof to Spend USDC");
    console.log("─".repeat(70));

    const approvalAmount = ethers.parseUnits("100000", 6);
    const approveTx = await mockUSDC.approve(contractAddress, approvalAmount);
    await approveTx.wait();
    console.log(`✅ Approved Contract to spend USDC\n`);

    // ========== CREATE DEPLOYMENT CONFIG ==========
    const config = {
      network: "arcTestnet",
      chainId: Number(network.chainId),
      rpc: rpcUrl,
      contracts: {
        payAfterProof: contractAddress,
        usdc: usdcAddress,
      },
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      blockExplorer: "https://testnet.arcscan.app",
    };

    const configPath = path.join(__dirname, "..", "deployment-config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("════════════════════════════════════════════════════════════════════");
    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log("════════════════════════════════════════════════════════════════════\n");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED");
    console.error("─".repeat(70));
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
