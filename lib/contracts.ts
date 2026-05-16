import { ethers } from 'ethers'

// ArcEscrow Marketplace Contract ABI (Human-Readable)
export const ARC_ESCROW_ABI = [
  "function createTask(address _worker, uint256 _rewardAmount, uint256 _deadline) external returns (uint256)",
  "function submitProof(uint256 _taskId, string calldata _proofLink) external",
  "function acceptTask(uint256 _taskId) external",
  "function assignWorker(uint256 _taskId, address _worker) external",
  "function approveTask(uint256 _taskId) external",
  "function refundTask(uint256 _taskId) external",
  "function cancelTask(uint256 _taskId) external",
  
  // Read Functions
  "function getTask(uint256 _taskId) external view returns (tuple(address creator, address worker, uint256 rewardAmount, string proofLink, uint8 status, uint256 deadline, uint256 createdAt))",
  "function getTaskStatus(uint256 _taskId) external view returns (uint8)",
  "function getEscrowBalance(uint256 _taskId) external view returns (uint256)",
  "function getTotalTasks() external view returns (uint256)",
  "event TaskCreated(uint256 indexed taskId, address indexed creator, address indexed worker, uint256 rewardAmount, uint256 deadline)"
]

// ERC20 Token ABI (Human-Readable) for USDC
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
]

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS!

export async function getContractInstances() {
  if (typeof window === 'undefined') throw new Error("Server-side call")
  const eth = (window as any).ethereum
  if (!eth) throw new Error("No wallet found")

  const provider = new ethers.BrowserProvider(eth)
  const signer = await provider.getSigner()

  const arcEscrow = new ethers.Contract(CONTRACT_ADDRESS, ARC_ESCROW_ABI, signer)
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer)

  return { arcEscrow, usdc, signer, provider }
}
