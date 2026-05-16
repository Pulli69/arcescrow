// Hardhat configuration for PayAfterProof on Arc Testnet
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Local development (for testing)
    hardhat: {
      chainId: 31337,
    },

    // Local node (run with: npx hardhat node)
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    // ✅ ARC TESTNET — PRIMARY DEPLOYMENT TARGET
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.trim().replace(/^0x/, "")}`] : [],
      chainId: 5042002,
    },
  },

  // Etherscan-like verification (Arc Testnet block explorer)
  etherscan: {
    apiKey: {
      arcTestnet: process.env.ETHERSCAN_API_KEY || "no-api-key",
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: 5042002,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app",
        },
      },
    ],
  },

  // Default network
  defaultNetwork: "hardhat",

  // Paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
