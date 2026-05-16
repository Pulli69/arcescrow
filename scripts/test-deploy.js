const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  console.log("Signers count:", signers.length);
  if (signers.length > 0) {
    console.log("First signer address:", signers[0].address);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
