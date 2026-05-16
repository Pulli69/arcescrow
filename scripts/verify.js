const { ethers } = require("ethers");
require("dotenv").config({ path: __dirname + "/../.env" });

async function verify() {
  console.log("🔍 Verifying Deployed Smart Contract on Arc Testnet...\n");
  
  const rpcUrl = "https://rpc.testnet.arc.network";
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  
  console.log(`RPC URL: ${rpcUrl}`);
  console.log(`PayAfterProof: ${contractAddress}`);
  console.log(`MockUSDC: ${usdcAddress}\n`);
  
  if (!contractAddress || !usdcAddress) {
    console.error("❌ Missing contract addresses in .env!");
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    
    console.log("✅ Provider connected!");
    console.log(`✅ Network Chain ID: ${network.chainId}\n`);
    
    // Minimal ABI for verification
    const abi = [
      "function owner() external view returns (address)",
      "function getTotalTasks() external view returns (uint256)",
      "function usdcToken() external view returns (address)"
    ];
    
    const usdcAbi = [
      "function symbol() external view returns (string)",
      "function decimals() external view returns (uint8)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);
    
    console.log("📡 Testing Read Functions (PayAfterProof)...");
    const owner = await contract.owner();
    console.log(`   Owner: ${owner}`);
    
    const totalTasks = await contract.getTotalTasks();
    console.log(`   Total Tasks: ${totalTasks.toString()}`);
    
    const linkedUsdc = await contract.usdcToken();
    console.log(`   Linked USDC Address: ${linkedUsdc}`);
    console.log("✅ PayAfterProof read functions working perfectly!\n");

    console.log("📡 Testing Read Functions (MockUSDC)...");
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log("✅ MockUSDC read functions working perfectly!\n");
    
    if (linkedUsdc.toLowerCase() === usdcAddress.toLowerCase()) {
      console.log("🎯 RESULT: Contracts are perfectly linked and active on Arc Testnet.");
      console.log("🎯 CONCLUSION: DO NOT REDEPLOY.");
    } else {
      console.log("❌ ERROR: Linked USDC address does not match .env!");
    }
    
  } catch (error) {
    console.error("❌ Verification Failed:", error.message);
  }
}

verify();
