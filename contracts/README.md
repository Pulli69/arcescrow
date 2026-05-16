# ArcEscrow - Marketplace Contract

A polished marketplace-style escrow contract for Arc Testnet that allows creators to post tasks and pay workers only after proof is approved. Supports unassigned tasks and worker claiming.

## Contract Overview

**ArcEscrow** manages task-based escrow payments with USDC. The contract holds funds in escrow until a task creator approves the submitted proof. Workers can claim "Open" tasks or be assigned directly.

### Key Features
- ✅ **Open Marketplace**: Creators can publish tasks without knowing a worker address.
- ✅ **Worker Acceptance**: Any worker can claim an open task, locking it into the "Accepted" state.
- ✅ **Grace Period Cancellation**: Creators can cancel an open task within the first 30 minutes.
- ✅ **USDC Integration**: Securely holds USDC funds in escrow.
- ✅ **Proof Workflow**: Multi-stage state machine for transparent work tracking.
- ✅ **Safety Guards**: Uses OpenZeppelin for reentrancy protection and access control.

## Task Lifecycle

```
1. Creator posts task (assigned or open marketplace)
   ↓
2. Worker claims task (acceptTask) → Status: Accepted
   ↓
3. Worker submits proof link → Status: ProofSubmitted
   ↓
4a. Creator approves → Worker receives USDC payment (Status: Paid)
   OR
4b. Deadline passes → Creator can refund (Status: Refunded)
   OR
4c. Grace period (30m) active → Creator can cancel open task (Status: Cancelled)
```

## Contract Functions

### createTask
**Creates a new task and locks USDC in escrow**
```solidity
function createTask(
    address _worker,      // Worker's address (0x0 for open marketplace)
    uint256 _rewardAmount,// Amount in USDC (include decimals)
    uint256 _deadline     // Unix timestamp deadline
) external returns (uint256)
```

### acceptTask
**Worker claims an open marketplace task**
```solidity
function acceptTask(uint256 _taskId) external
```

### submitProof
**Worker submits proof of completed work**
```solidity
function submitProof(
    uint256 _taskId,
    string calldata _proofLink
) external
```

### approveTask
**Creator approves proof and releases payment to worker**
```solidity
function approveTask(uint256 _taskId) external
```

### refundTask
**Creator refunds after deadline passes without approval**
```solidity
function refundTask(uint256 _taskId) external
```

### cancelTask
**Creator cancels an open task within the 30-minute grace period**
```solidity
function cancelTask(uint256 _taskId) external
```

## Task Status Enum

```solidity
enum TaskStatus { 
    Open,           // 0 - Task created, waiting for worker or assigned worker
    Accepted,       // 1 - Worker assigned and working
    ProofSubmitted, // 2 - Proof submitted, awaiting approval
    Paid,           // 3 - Payment released to worker
    Refunded,       // 4 - Refunded to creator after deadline
    Cancelled       // 5 - Cancelled by creator (grace period)
}
```

## Deployment on Arc Testnet

### 1. Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

### 2. Approve USDC Spending
Before creating tasks, users must approve the ArcEscrow contract to spend their USDC:
```javascript
await usdc.approve(arcEscrowAddress, amount);
```

## Security Considerations

- ✅ **ReentrancyGuard**: Protects against reentrancy attacks.
- ✅ **Checks-Effects-Interactions**: Follows secure transfer patterns.
- ✅ **Access Control**: Only assigned workers or creators can perform specific actions.
- ✅ **Time Guards**: Enforces deadlines and cancellation windows.

## Next Steps

1. Update your `.env` with the new contract address.
2. Use the `acceptTask` function for worker claiming flows.
3. Track task states using the updated 6-state status enum.
