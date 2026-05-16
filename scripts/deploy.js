const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "═".repeat(70));
  console.log("🚀 ARCESCROW DEPLOYMENT TO ARC TESTNET");
  console.log("═".repeat(70) + "\n");

  try {
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    const [deployer] = await hre.ethers.getSigners();

    console.log("📊 DEPLOYMENT INFORMATION");
    console.log("─".repeat(70));
    console.log(`Network:        ${hre.network.name}`);
    console.log(`Chain ID:       ${network.chainId}`);
    console.log(`RPC URL:        ${hre.network.config.url}`);
    console.log(`Deployer:       ${deployer.address}`);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceEth = hre.ethers.formatEther(balance);
    console.log(`Balance:        ${balanceEth} ETH`);

    if (balance === 0n) {
      console.error("\n❌ ERROR: Deployer has 0 balance!");
      console.error("💡 You need testnet tokens. Check Arc's faucet.");
      process.exit(1);
    }

    console.log("─".repeat(70) + "\n");

    // ========== STEP 1: Deploy MockUSDC ==========
    console.log("📝 STEP 1: Deploying Mock USDC Token");
    console.log("─".repeat(70));

    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    const usdcAddress = await mockUSDC.getAddress();
    console.log(`✅ MockUSDC deployed at: ${usdcAddress}`);
    console.log("   (This is a test token for development)\n");

    // ========== STEP 2: Deploy ArcEscrow ==========
    console.log("📝 STEP 2: Deploying ArcEscrow Contract");
    console.log("─".repeat(70));

    const ArcEscrow = await hre.ethers.getContractFactory("ArcEscrow");
    const arcEscrow = await ArcEscrow.deploy(usdcAddress);
    await arcEscrow.waitForDeployment();

    const contractAddress = await arcEscrow.getAddress();
    console.log(`✅ ArcEscrow deployed at: ${contractAddress}`);
    console.log("   (This is your main escrow contract)\n");

    // ========== STEP 3: Mint Test USDC ==========
    console.log("📝 STEP 3: Minting Test USDC");
    console.log("─".repeat(70));

    const mintAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDC
    const mintTx = await mockUSDC.mint(deployer.address, mintAmount);
    await mintTx.wait();

    const balance2 = await mockUSDC.balanceOf(deployer.address);
    console.log(`✅ Minted: ${hre.ethers.formatUnits(balance2, 6)} USDC`);
    console.log("   (You can now create escrow tasks)\n");

    // ========== STEP 4: Approve Contract ==========
    console.log("📝 STEP 4: Approving ArcEscrow to Spend USDC");
    console.log("─".repeat(70));

    const approvalAmount = hre.ethers.parseUnits("100000", 6);
    const approveTx = await mockUSDC.approve(contractAddress, approvalAmount);
    await approveTx.wait();

    console.log(`✅ Approved: ${hre.ethers.formatUnits(approvalAmount, 6)} USDC`);
    console.log("   (Contract can now transfer USDC)\n");

    // ========== CREATE DEPLOYMENT CONFIG ==========
    const config = {
      network: hre.network.name,
      chainId: network.chainId,
      rpc: hre.network.config.url,
      contracts: {
        arcEscrow: contractAddress,
        usdc: usdcAddress,
      },
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      blockExplorer: "https://testnet.arcscan.app",
    };

    // Save to file
    const configPath = path.join(__dirname, "..", "deployment-config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("════════════════════════════════════════════════════════════════════");
    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log("════════════════════════════════════════════════════════════════════\n");

    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("─".repeat(70));
    console.log(`ArcEscrow Contract:   ${contractAddress}`);
    console.log(`USDC Test Token:      ${usdcAddress}`);
    console.log(`Deployer Account:     ${deployer.address}`);
    console.log(`Network:              Arc Testnet (Chain ID: ${network.chainId})`);
    console.log("─".repeat(70) + "\n");

    console.log("📁 SAVED: deployment-config.json");
    console.log("   Copy the contract addresses to your .env file:\n");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}\n`);

    console.log("🔗 NEXT STEPS:");
    console.log("   1. Copy the contract address above");
    console.log("   2. Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env");
    console.log("   3. Update NEXT_PUBLIC_USDC_ADDRESS in .env");
    console.log("   4. Restart your frontend dev server");
    console.log("   5. Test creating tasks from the UI\n");

    console.log("🧪 TESTING:");
    console.log("   - Go to http://localhost:3000/contracts");
    console.log("   - Click 'Create Task'");
    console.log("   - Your escrow contract is now live!\n");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED");
    console.error("─".repeat(70));
    console.error("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 HINT: You need testnet ETH to deploy!");
      console.error("   Get testnet tokens from Arc's faucet.");
    } else if (error.message.includes("invalid privateKey")) {
      console.error("\n💡 HINT: Check your PRIVATE_KEY in .env");
      console.error("   Make sure it's correct without 0x prefix.");
    }
    
    console.error("─".repeat(70) + "\n");
    process.exit(1);
  }
}

main();
