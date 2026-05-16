/**
 * Contract Service
 * 
 * High-level service for interacting with ArcEscrow contract
 * Handles all blockchain interactions in one place
 */

import { ethers } from "ethers";
import {
  PAY_AFTER_PROOF_ABI,
  USDC_ABI,
  getContractAddresses,
  USDC_CONFIG,
  TaskStatus,
} from "./contractConfig";

/**
 * Contract error type for error handling
 */
export interface ContractError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Task data type (matches smart contract)
 */
export interface Task {
  creator: string;
  worker: string;
  rewardAmount: string;
  proofLink: string;
  status: TaskStatus;
  deadline: bigint;
  createdAt: bigint;
}

/**
 * Contract Service Class
 * All methods for interacting with ArcEscrow
 */
export class ArcEscrowService {
  private signer: ethers.Signer | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private usdcContract: ethers.Contract | null = null;

  /**
   * Initialize service with signer
   * Must be called before any contract interactions
   */
  async initialize(signer: ethers.Signer): Promise<void> {
    this.signer = signer;

    // Get provider from signer
    if (!signer.provider) {
      throw new Error("Signer must have a provider");
    }
    this.provider = signer.provider as ethers.BrowserProvider;

    // Get contract addresses
    const addresses = getContractAddresses();

    if (!addresses.ArcEscrow || !addresses.usdc) {
      throw new Error(
        "Contract addresses not configured. Please deploy contracts and update .env"
      );
    }

    // Initialize contract instances
    this.contract = new ethers.Contract(
      addresses.ArcEscrow,
      PAY_AFTER_PROOF_ABI,
      signer
    );

    this.usdcContract = new ethers.Contract(
      addresses.usdc,
      USDC_ABI,
      signer
    );
  }

  /**
   * Verify initialization
   */
  private checkInitialized(): void {
    if (!this.contract || !this.usdcContract || !this.signer) {
      throw new Error("Service not initialized. Call initialize() first.");
    }
  }

  // ========== WRITE FUNCTIONS ==========

  /**
   * Create a new escrow task
   *
   * @param workerAddress - Wallet address of the worker
   * @param rewardAmountUSDC - Reward amount in USDC (e.g., "100" for 100 USDC)
   * @param deadlineInDays - Task deadline in days from now
   * @returns Transaction hash
   */
  async createTask(
    workerAddress: string,
    rewardAmountUSDC: string,
    deadlineInDays: number
  ): Promise<string> {
    this.checkInitialized();

    try {
      // Validate inputs
      if (!ethers.isAddress(workerAddress)) {
        throw new Error("Invalid worker address");
      }
      if (isNaN(Number(rewardAmountUSDC)) || Number(rewardAmountUSDC) <= 0) {
        throw new Error("Reward amount must be greater than 0");
      }
      if (deadlineInDays <= 0) {
        throw new Error("Deadline must be in the future");
      }

      // Convert USDC amount to wei (USDC has 6 decimals)
      const rewardInWei = ethers.parseUnits(
        rewardAmountUSDC,
        USDC_CONFIG.decimals
      );

      // Check USDC balance
      const userAddress = await this.signer!.getAddress();
      const balance = await this.usdcContract!.balanceOf(userAddress);

      if (balance < rewardInWei) {
        throw new Error(
          `Insufficient USDC balance. Have ${ethers.formatUnits(balance, USDC_CONFIG.decimals)}, need ${rewardAmountUSDC}`
        );
      }

      // Approve contract to spend USDC
      const allowance = await this.usdcContract!.allowance(
        userAddress,
        getContractAddresses().ArcEscrow
      );

      if (allowance < rewardInWei) {
        console.log("Approving USDC...");
        const approveTx = await this.usdcContract!.approve(
          getContractAddresses().ArcEscrow,
          rewardInWei
        );
        await approveTx.wait();
      }

      // Create task
      const deadline =
        Math.floor(Date.now() / 1000) + deadlineInDays * 24 * 60 * 60;

      console.log("Creating task...", {
        worker: workerAddress,
        reward: rewardAmountUSDC,
        deadline,
      });

      const tx = await this.contract!.createTask(
        workerAddress,
        rewardInWei,
        deadline
      );

      const receipt = await tx.wait();

      console.log("Task created successfully");
      return receipt!.hash;
    } catch (error) {
      throw this.handleError(error, "Failed to create task");
    }
  }

  /**
   * Submit proof of work completion
   *
   * @param taskId - ID of the task
   * @param proofLink - Link to proof (IPFS, URL, etc.)
   * @returns Transaction hash
   */
  async submitProof(taskId: number, proofLink: string): Promise<string> {
    this.checkInitialized();

    try {
      if (!proofLink || proofLink.trim().length === 0) {
        throw new Error("Proof link cannot be empty");
      }

      console.log("Submitting proof...", { taskId, proofLink });

      const tx = await this.contract!.submitProof(taskId, proofLink);
      const receipt = await tx.wait();

      console.log("Proof submitted successfully");
      return receipt!.hash;
    } catch (error) {
      throw this.handleError(error, "Failed to submit proof");
    }
  }

  /**
   * Approve task and release payment to worker
   *
   * @param taskId - ID of the task to approve
   * @returns Transaction hash
   */
  async approveTask(taskId: number): Promise<string> {
    this.checkInitialized();

    try {
      console.log("Approving task...", { taskId });

      const tx = await this.contract!.approveTask(taskId);
      const receipt = await tx.wait();

      console.log("Task approved successfully");
      return receipt!.hash;
    } catch (error) {
      throw this.handleError(error, "Failed to approve task");
    }
  }

  /**
   * Refund task (after deadline passes)
   *
   * @param taskId - ID of the task to refund
   * @returns Transaction hash
   */
  async refundTask(taskId: number): Promise<string> {
    this.checkInitialized();

    try {
      console.log("Refunding task...", { taskId });

      const tx = await this.contract!.refundTask(taskId);
      const receipt = await tx.wait();

      console.log("Task refunded successfully");
      return receipt!.hash;
    } catch (error) {
      throw this.handleError(error, "Failed to refund task");
    }
  }

  // ========== READ FUNCTIONS ==========

  /**
   * Get complete task details
   *
   * @param taskId - ID of the task
   * @returns Task data
   */
  async getTask(taskId: number): Promise<Task> {
    this.checkInitialized();

    try {
      const taskData = await this.contract!.getTask(taskId);

      return {
        creator: taskData.creator,
        worker: taskData.worker,
        rewardAmount: ethers.formatUnits(
          taskData.rewardAmount,
          USDC_CONFIG.decimals
        ),
        proofLink: taskData.proofLink,
        status: taskData.status,
        deadline: taskData.deadline,
        createdAt: taskData.createdAt,
      };
    } catch (error) {
      throw this.handleError(error, `Failed to fetch task ${taskId}`);
    }
  }

  /**
   * Get task status
   *
   * @param taskId - ID of the task
   * @returns Task status (0-3)
   */
  async getTaskStatus(taskId: number): Promise<TaskStatus> {
    this.checkInitialized();

    try {
      return await this.contract!.getTaskStatus(taskId);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch task status ${taskId}`);
    }
  }

  /**
   * Get escrow balance for a task
   *
   * @param taskId - ID of the task
   * @returns Balance in USDC
   */
  async getEscrowBalance(taskId: number): Promise<string> {
    this.checkInitialized();

    try {
      const balance = await this.contract!.getEscrowBalance(taskId);
      return ethers.formatUnits(balance, USDC_CONFIG.decimals);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch escrow balance`);
    }
  }

  /**
   * Get total number of tasks
   *
   * @returns Total task count
   */
  async getTotalTasks(): Promise<number> {
    this.checkInitialized();

    try {
      const total = await this.contract!.getTotalTasks();
      return Number(total);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch total tasks");
    }
  }

  /**
   * Get USDC balance for address
   *
   * @param address - Wallet address
   * @returns Balance in USDC
   */
  async getUSDCBalance(address: string): Promise<string> {
    this.checkInitialized();

    try {
      const balance = await this.usdcContract!.balanceOf(address);
      return ethers.formatUnits(balance, USDC_CONFIG.decimals);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch USDC balance");
    }
  }

  // ========== HELPER FUNCTIONS ==========

  /**
   * Format USDC amount for display
   *
   * @param amount - Amount in USDC
   * @returns Formatted string
   */
  formatUSDC(amount: string | number): string {
    return `${parseFloat(amount.toString()).toFixed(2)} USDC`;
  }

  /**
   * Parse USDC string to wei
   *
   * @param amount - Amount as string
   * @returns Amount in wei
   */
  parseUSDC(amount: string): bigint {
    return ethers.parseUnits(amount, USDC_CONFIG.decimals);
  }

  /**
   * Format date from unix timestamp
   *
   * @param timestamp - Unix timestamp
   * @returns Formatted date string
   */
  formatDate(timestamp: bigint | number): string {
    const ms = Number(timestamp) * 1000;
    return new Date(ms).toLocaleString();
  }

  /**
   * Check if deadline has passed
   *
   * @param deadline - Unix timestamp
   * @returns True if deadline has passed
   */
  isDeadlinePassed(deadline: bigint | number): boolean {
    return Math.floor(Date.now() / 1000) > Number(deadline);
  }

  /**
   * Error handler
   * Converts contract errors to user-friendly messages
   */
  private handleError(error: any, context: string): Error {
    let message = context;
    let details = "";

    if (error.reason) {
      details = error.reason;
    } else if (error.message) {
      details = error.message;
    }

    // Parse common error messages
    if (details.includes("insufficient funds")) {
      message = "Insufficient funds for transaction";
    } else if (details.includes("user rejected")) {
      message = "Transaction rejected by user";
    } else if (details.includes("deadline")) {
      message = "Task deadline has passed";
    } else if (details.includes("Invalid worker")) {
      message = "Invalid worker address";
    } else if (details.includes("Insufficient USDC")) {
      message = "Not enough USDC balance";
    } else if (details) {
      message = `${context}: ${details}`;
    }

    console.error(context, error);
    return new Error(message);
  }
}

/**
 * Create and initialize service
 * Usage: const service = await createArcEscrowService(signer);
 */
export async function createArcEscrowService(
  signer: ethers.Signer
): Promise<ArcEscrowService> {
  const service = new ArcEscrowService();
  await service.initialize(signer);
  return service;
}

/**
 * Global service instance (for use across components)
 */
let serviceInstance: ArcEscrowService | null = null;

export function getArcEscrowService(): ArcEscrowService {
  if (!serviceInstance) {
    throw new Error("Service not initialized. Call initializeService() first.");
  }
  return serviceInstance;
}

export async function initializeService(
  signer: ethers.Signer
): Promise<void> {
  serviceInstance = await createArcEscrowService(signer);
}
