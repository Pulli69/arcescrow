// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArcEscrow
 * @dev Polished marketplace escrow contract for Arc Testnet
 * Allows users to post tasks and pay workers only after proof is approved.
 * Supports open marketplace claiming and secure early cancellation.
 */
contract ArcEscrow is ReentrancyGuard, Ownable {
    
    // ==================== State Variables ====================
    
    IERC20 public usdcToken;
    
    // Task Status Enum
    enum TaskStatus { Open, Accepted, ProofSubmitted, Paid, Refunded, Cancelled }
    
    // Task Structure
    struct Task {
        address creator;          // Who posted the task
        address worker;           // Who will do the task
        uint256 rewardAmount;     // Amount in USDC (with decimals)
        string proofLink;         // IPFS or URL link to proof
        TaskStatus status;        // Current task status
        uint256 deadline;         // Task deadline (unix timestamp)
        uint256 createdAt;        // When task was created
    }
    
    // Task ID counter
    uint256 public taskCounter = 0;
    
    // Mapping of task ID to task details
    mapping(uint256 => Task) public tasks;
    
    // Mapping to track USDC held in escrow
    mapping(uint256 => uint256) public escrowBalance;
    
    // ==================== Events ====================
    
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        address indexed worker,
        uint256 rewardAmount,
        uint256 deadline
    );
    
    event ProofSubmitted(
        uint256 indexed taskId,
        address indexed worker,
        string proofLink
    );
    
    event TaskAccepted(
        uint256 indexed taskId,
        address indexed worker
    );
    
    event TaskApproved(
        uint256 indexed taskId,
        address indexed creator,
        uint256 rewardAmount
    );
    
    event TaskRefunded(
        uint256 indexed taskId,
        address indexed creator,
        uint256 rewardAmount
    );
    
    event EscrowDeposited(
        uint256 indexed taskId,
        uint256 amount
    );
    
    event TaskCancelled(
        uint256 indexed taskId,
        address indexed creator,
        uint256 rewardAmount
    );
    
    // ==================== Constructor ====================
    
    /**
     * @dev Initialize with USDC token address
     * @param _usdcToken Address of USDC token on Arc Testnet
     */
    constructor(address _usdcToken) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid token address");
        usdcToken = IERC20(_usdcToken);
    }
    
    // ==================== Main Functions ====================
    
    /**
     * @dev Create a new task
     * @param _worker Address of the worker who will complete the task
     * @param _rewardAmount Amount to pay the worker (in USDC)
     * @param _deadline Unix timestamp when task expires
     * @return taskId The ID of the newly created task
     */
    function createTask(
        address _worker,
        uint256 _rewardAmount,
        uint256 _deadline
    ) external nonReentrant returns (uint256) {
        if (_worker != address(0)) {
            require(_worker != msg.sender, "Worker cannot be the creator");
        }
        require(_rewardAmount > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        // Transfer USDC from creator to contract (escrow)
        require(
            usdcToken.transferFrom(msg.sender, address(this), _rewardAmount),
            "USDC transfer failed"
        );
        
        uint256 taskId = taskCounter;
        taskCounter++;
        
        // Create new task
        tasks[taskId] = Task({
            creator: msg.sender,
            worker: _worker,
            rewardAmount: _rewardAmount,
            proofLink: "",
            status: TaskStatus.Open,
            deadline: _deadline,
            createdAt: block.timestamp
        });
        
        escrowBalance[taskId] = _rewardAmount;
        
        emit TaskCreated(taskId, msg.sender, _worker, _rewardAmount, _deadline);
        emit EscrowDeposited(taskId, _rewardAmount);
        
        return taskId;
    }
    
    /**
     * @dev Assign a worker to an open task (only by creator)
     * @param _taskId ID of the task to assign
     * @param _worker Address of the worker to hire
     */
    function assignWorker(uint256 _taskId, address _worker) external nonReentrant {
        Task storage task = tasks[_taskId];
        
        require(msg.sender == task.creator, "Only creator can assign");
        require(task.status == TaskStatus.Open, "Task is not open");
        require(_worker != address(0), "Invalid worker address");
        require(_worker != task.creator, "Cannot hire yourself");
        
        task.worker = _worker;
        task.status = TaskStatus.Accepted;
        
        emit TaskAccepted(_taskId, _worker);
    }

    /**
     * @dev Accept an open task (legacy/alternative flow for truly public tasks)
     * @param _taskId ID of the task to accept
     */
    function acceptTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        
        require(task.status == TaskStatus.Open, "Task is not open");
        require(msg.sender != task.creator, "Creator cannot accept own task");
        require(task.worker == address(0) || task.worker == msg.sender, "Worker already assigned");
        require(block.timestamp <= task.deadline, "Task deadline passed");
        
        task.worker = msg.sender;
        task.status = TaskStatus.Accepted;
        
        emit TaskAccepted(_taskId, msg.sender);
    }
    
    /**
     * @dev Submit proof of work completion
     * @param _taskId ID of the task
     * @param _proofLink Link to proof (IPFS, URL, etc.)
     */
    function submitProof(
        uint256 _taskId,
        string calldata _proofLink
    ) external nonReentrant {
        Task storage task = tasks[_taskId];
        
        require(msg.sender == task.worker, "Only worker can submit proof");
        require(task.status == TaskStatus.Accepted, "Task is not accepted");
        require(bytes(_proofLink).length > 0, "Proof link cannot be empty");
        require(block.timestamp <= task.deadline, "Task deadline passed");
        
        // Update task with proof
        task.proofLink = _proofLink;
        task.status = TaskStatus.ProofSubmitted;
        
        emit ProofSubmitted(_taskId, msg.sender, _proofLink);
    }
    
    /**
     * @dev Approve the submitted proof and pay the worker
     * @param _taskId ID of the task to approve
     */
    function approveTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        
        require(msg.sender == task.creator, "Only creator can approve");
        require(task.status == TaskStatus.ProofSubmitted, "No proof submitted");
        require(escrowBalance[_taskId] > 0, "No escrow balance");
        
        uint256 rewardAmount = task.rewardAmount;
        
        // Update status before transfer (checks-effects-interactions pattern)
        task.status = TaskStatus.Paid;
        escrowBalance[_taskId] = 0;
        
        // Transfer USDC to worker
        require(
            usdcToken.transfer(task.worker, rewardAmount),
            "USDC transfer to worker failed"
        );
        
        emit TaskApproved(_taskId, msg.sender, rewardAmount);
    }
    
    /**
     * @dev Refund the escrow amount to creator (if worker doesn't submit proof)
     * @param _taskId ID of the task to refund
     */
    function refundTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        
        require(msg.sender == task.creator, "Only creator can refund");
        require(
            task.status == TaskStatus.Open || task.status == TaskStatus.Accepted || task.status == TaskStatus.ProofSubmitted,
            "Task cannot be refunded"
        );
        require(block.timestamp > task.deadline, "Can only refund after deadline");
        require(escrowBalance[_taskId] > 0, "No escrow balance");
        
        uint256 rewardAmount = task.rewardAmount;
        
        // Update status before transfer
        task.status = TaskStatus.Refunded;
        escrowBalance[_taskId] = 0;
        
        // Transfer USDC back to creator
        require(
            usdcToken.transfer(task.creator, rewardAmount),
            "USDC refund failed"
        );
        
        emit TaskRefunded(_taskId, msg.sender, rewardAmount);
    }
    
    /**
     * @dev Cancel the task within 30 minutes of creation
     * @param _taskId ID of the task to cancel
     */
    function cancelTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        
        require(msg.sender == task.creator, "Only creator can cancel");
        require(task.status == TaskStatus.Open, "Task is not open (already accepted or finished)");
        require(block.timestamp <= task.createdAt + 30 minutes, "30 min passed");
        require(escrowBalance[_taskId] > 0, "No escrow balance");
        
        uint256 rewardAmount = task.rewardAmount;
        
        // Update status before transfer
        task.status = TaskStatus.Cancelled;
        escrowBalance[_taskId] = 0;
        
        // Transfer USDC back to creator
        require(
            usdcToken.transfer(task.creator, rewardAmount),
            "USDC refund failed"
        );
        
        emit TaskCancelled(_taskId, msg.sender, rewardAmount);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @dev Get complete task details
     * @param _taskId ID of the task
     * @return Task struct with all details
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        return tasks[_taskId];
    }
    
    /**
     * @dev Get current status of a task
     * @param _taskId ID of the task
     * @return TaskStatus current status
     */
    function getTaskStatus(uint256 _taskId) external view returns (TaskStatus) {
        return tasks[_taskId].status;
    }
    
    /**
     * @dev Get escrow balance for a task
     * @param _taskId ID of the task
     * @return Remaining escrow amount
     */
    function getEscrowBalance(uint256 _taskId) external view returns (uint256) {
        return escrowBalance[_taskId];
    }
    
    /**
     * @dev Get total number of tasks created
     * @return Total task count
     */
    function getTotalTasks() external view returns (uint256) {
        return taskCounter;
    }
    
    // ==================== Admin Functions ====================
    
    /**
     * @dev Update USDC token address (only owner)
     * @param _newToken New USDC token address
     */
    function setUSDCToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid token address");
        usdcToken = IERC20(_newToken);
    }
}
