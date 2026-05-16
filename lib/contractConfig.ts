/**
 * Contract Configuration
 * 
 * This file provides contract addresses and configuration
 * for interacting with ArcEscrow on Arc Testnet
 */

// Contract ABIs (Application Binary Interface)
// These define how to interact with the smart contracts

export const PAY_AFTER_PROOF_ABI = [
  // Write Functions (change state)
  {
    name: "createTask",
    type: "function",
    inputs: [
      { name: "_worker", type: "address" },
      { name: "_rewardAmount", type: "uint256" },
      { name: "_deadline", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "submitProof",
    type: "function",
    inputs: [
      { name: "_taskId", type: "uint256" },
      { name: "_proofLink", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    name: "approveTask",
    type: "function",
    inputs: [{ name: "_taskId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "refundTask",
    type: "function",
    inputs: [{ name: "_taskId", type: "uint256" }],
    stateMutability: "nonpayable",
  },

  // Read Functions (don't change state)
  {
    name: "getTask",
    type: "function",
    inputs: [{ name: "_taskId", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "worker", type: "address" },
          { name: "rewardAmount", type: "uint256" },
          { name: "proofLink", type: "string" },
          { name: "status", type: "uint8" },
          { name: "deadline", type: "uint256" },
          { name: "createdAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "getTaskStatus",
    type: "function",
    inputs: [{ name: "_taskId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "getEscrowBalance",
    type: "function",
    inputs: [{ name: "_taskId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getTotalTasks",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // Events
  {
    name: "TaskCreated",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "worker", type: "address", indexed: true },
      { name: "rewardAmount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
    ],
  },
  {
    name: "ProofSubmitted",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "worker", type: "address", indexed: true },
      { name: "proofLink", type: "string", indexed: false },
    ],
  },
  {
    name: "TaskApproved",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "rewardAmount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TaskRefunded",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "rewardAmount", type: "uint256", indexed: false },
    ],
  },
];

export const USDC_ABI = [
  // ERC20 Standard Functions
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "transferFrom",
    type: "function",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
];

/**
 * Get contract addresses from environment variables
 * These must be set in .env after deployment
 */
export function getContractAddresses() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

  if (!contractAddress || !usdcAddress) {
    console.warn(
      "⚠️ Contract addresses not configured. Update .env with deployed addresses."
    );
  }

  return {
    ArcEscrow: contractAddress || "",
    usdc: usdcAddress || "",
    chainId: chainId ? parseInt(chainId) : 5042002,
  };
}

/**
 * Arc Testnet Configuration
 */
export const ARC_TESTNET_CONFIG = {
  chainId: 5042002,
  rpcUrl: "https://rpc.testnet.arc.network",
  chainName: "Arc Testnet",
  nativeCurrency: {
    name: "Arc",
    symbol: "USDC",
    decimals: 18,
  },
  blockExplorer: "https://explorer.testnet.arc.network",
};

/**
 * Task Status Enum
 * Must match the enum in ArcEscrow.sol
 */
export enum TaskStatus {
  Open = 0,
  ProofSubmitted = 1,
  Paid = 2,
  Refunded = 3,
}

/**
 * Task Status Names (for display)
 */
export const TASK_STATUS_NAMES: Record<TaskStatus, string> = {
  [TaskStatus.Open]: "Open",
  [TaskStatus.ProofSubmitted]: "Proof Submitted",
  [TaskStatus.Paid]: "Paid",
  [TaskStatus.Refunded]: "Refunded",
};

/**
 * Task Status Colors (for UI display)
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Open]: "bg-blue-100 text-blue-800",
  [TaskStatus.ProofSubmitted]: "bg-yellow-100 text-yellow-800",
  [TaskStatus.Paid]: "bg-green-100 text-green-800",
  [TaskStatus.Refunded]: "bg-red-100 text-red-800",
};

/**
 * USDC Configuration
 */
export const USDC_CONFIG = {
  decimals: 6, // USDC uses 6 decimals
  symbol: "USDC",
};
