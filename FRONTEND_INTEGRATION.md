# 🎨 Frontend Integration Guide

This guide shows you how to connect your React components to the ArcEscrow smart contract.

## Table of Contents
1. [Setup Overview](#setup-overview)
2. [Available Hooks](#available-hooks)
3. [Contract Service](#contract-service)
4. [Component Examples](#component-examples)
5. [Error Handling](#error-handling)
6. [Loading States](#loading-states)
7. [Common Patterns](#common-patterns)
8. [Testing Integration](#testing-integration)

---

## Setup Overview

### File Structure

Your contract integration files are in `lib/`:

```
lib/
├── contractConfig.ts        # Contract addresses, ABIs, enums
├── contractService.ts       # Low-level contract interactions
└── useContract.ts          # React hooks for easy component use
```

### How It Works

```
React Component
    ↓
useContract hook (e.g., useCreateTask)
    ↓
ArcEscrowService
    ↓
ethers.js
    ↓
Smart Contract on Arc Testnet
```

---

## Available Hooks

All hooks are in `lib/useContract.ts`. Import them in your components:

### 1. useCreateTask()

Create a new escrow task.

```typescript
import { useCreateTask } from "@/lib/useContract";
import { ethers } from "ethers";

export function CreateTaskButton() {
  const { createTask, loading, error, txHash } = useCreateTask();

  const handleCreate = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const hash = await createTask(
        signer,
        "0xWorkerAddress",    // Worker wallet
        "100",                // 100 USDC reward
        7                     // 7 day deadline
      );

      console.log("Task created! TX:", hash);
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? "Creating..." : "Create Task"}
      {txHash && <p>✅ {txHash.slice(0, 10)}...</p>}
      {error && <p>❌ {error.message}</p>}
    </button>
  );
}
```

### 2. useSubmitProof()

Worker submits proof of work.

```typescript
const { submitProof, loading, error } = useSubmitProof();

const hash = await submitProof(
  signer,
  0,                    // Task ID
  "ipfs://QmXxxx..."    // Proof link
);
```

### 3. useApproveTask()

Creator approves proof and releases payment.

```typescript
const { approveTask, loading, error } = useApproveTask();

const hash = await approveTask(signer, 0); // Task ID
```

### 4. useRefundTask()

Creator refunds task after deadline.

```typescript
const { refundTask, loading, error } = useRefundTask();

const hash = await refundTask(signer, 0); // Task ID
```

### 5. useTask()

Fetch complete task details.

```typescript
const { data: task, loading, error } = useTask(signer, taskId);

if (task) {
  console.log(task.creator);      // Creator address
  console.log(task.worker);       // Worker address
  console.log(task.rewardAmount); // "100" (in USDC)
  console.log(task.status);       // 0-3 (Open, ProofSubmitted, etc)
}
```

### 6. useTotalTasks()

Get total number of tasks.

```typescript
const { data: totalTasks, loading, error } = useTotalTasks(signer);

console.log(totalTasks); // 5
```

### 7. useUSDCBalance()

Get USDC balance for an address.

```typescript
const { data: balance, loading, error } = useUSDCBalance(
  signer,
  "0x1234567890..."  // Address to check
);

console.log(balance); // "1000.50" (in USDC)
```

### 8. useTaskStatus()

Get just the status of a task.

```typescript
const { data: status, loading, error } = useTaskStatus(signer, taskId);

// status: 0 = Open, 1 = ProofSubmitted, 2 = Paid, 3 = Refunded
```

### 9. useTaskWithRefresh()

Auto-refresh task data every 5 seconds.

```typescript
const {
  data: task,
  loading,
  error,
  refetch,
  refetching,
} = useTaskWithRefresh(signer, taskId, 5000); // 5 seconds

// Manually refresh when needed
const handleRefresh = () => refetch();
```

### 10. useTaskStatusName()

Convert status enum to display text.

```typescript
const statusName = useTaskStatusName(task?.status);

console.log(statusName); // "Open" or "Proof Submitted", etc.
```

---

## Contract Service

For advanced use cases, use the `ArcEscrowService` directly:

```typescript
import { createArcEscrowService } from "@/lib/contractService";

async function myFunction(signer) {
  // Initialize service
  const service = await createArcEscrowService(signer);

  // Use service methods
  const task = await service.getTask(0);
  const balance = await service.getUSDCBalance(address);
  const total = await service.getTotalTasks();

  // Helper methods
  const formatted = service.formatUSDC(balance); // "1000.50 USDC"
  const date = service.formatDate(task.deadline);
  const isPassed = service.isDeadlinePassed(task.deadline);
}
```

---

## Component Examples

### Example 1: Create Task Form

```typescript
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useCreateTask } from "@/lib/useContract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CreateTaskForm() {
  const [worker, setWorker] = useState("");
  const [reward, setReward] = useState("");
  const [days, setDays] = useState("7");
  const { createTask, loading, error } = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate inputs
      if (!ethers.isAddress(worker)) {
        toast.error("Invalid worker address");
        return;
      }

      if (!reward || parseFloat(reward) <= 0) {
        toast.error("Reward must be greater than 0");
        return;
      }

      // Get signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create task
      const hash = await createTask(signer, worker, reward, parseInt(days));

      toast.success(`Task created! TX: ${hash}`);

      // Reset form
      setWorker("");
      setReward("");
      setDays("7");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Worker Address</label>
        <Input
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          placeholder="0x1234..."
          disabled={loading}
        />
      </div>

      <div>
        <label>Reward (USDC)</label>
        <Input
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          placeholder="100"
          type="number"
          disabled={loading}
        />
      </div>

      <div>
        <label>Deadline (Days)</label>
        <Input
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="7"
          type="number"
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-500">❌ {error.message}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
```

### Example 2: Task Details Card

```typescript
"use client";

import { useTask, useTaskStatusName } from "@/lib/useContract";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TaskCard({
  signer,
  taskId,
}: {
  signer: ethers.Signer | null;
  taskId: number;
}) {
  const { data: task, loading, error } = useTask(signer, taskId);
  const statusName = useTaskStatusName(task?.status || null);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3>Task #{taskId}</h3>
          <Badge>{statusName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Creator</p>
          <p className="font-mono text-sm">{task.creator.slice(0, 10)}...</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Worker</p>
          <p className="font-mono text-sm">{task.worker.slice(0, 10)}...</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Reward</p>
          <p className="text-lg font-bold">{task.rewardAmount} USDC</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Proof</p>
          <p className="text-sm">
            {task.proofLink ? (
              <a
                href={task.proofLink}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                View Proof
              </a>
            ) : (
              <span className="text-gray-400">Not submitted</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Deadline</p>
          <p className="text-sm">
            {new Date(Number(task.deadline) * 1000).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Example 3: Approve Task Button

```typescript
"use client";

import { useApproveTask } from "@/lib/useContract";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApproveTaskButton({
  signer,
  taskId,
  onSuccess,
}: {
  signer: ethers.Signer | null;
  taskId: number;
  onSuccess?: () => void;
}) {
  const { approveTask, loading, error } = useApproveTask();

  const handleApprove = async () => {
    if (!signer) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const hash = await approveTask(signer, taskId);
      toast.success(`Approved! TX: ${hash}`);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message);
    }
  };

  return (
    <>
      <Button onClick={handleApprove} disabled={loading}>
        {loading ? "Approving..." : "Approve & Pay"}
      </Button>
      {error && <p className="text-red-500 text-sm">❌ {error.message}</p>}
    </>
  );
}
```

---

## Error Handling

### Common Errors

```typescript
// Insufficient USDC
"Error: Not enough USDC balance"

// Invalid address
"Error: Invalid worker address"

// Task deadline passed
"Error: Task deadline has passed"

// User rejected transaction
"Error: Transaction rejected by user"
```

### Error Handling Pattern

```typescript
const handleAction = async () => {
  try {
    const result = await contractFunction();
    console.log("Success:", result);
  } catch (error) {
    if (error.message.includes("insufficient funds")) {
      // Show: "You don't have enough USDC"
    } else if (error.message.includes("rejected")) {
      // Show: "You cancelled the transaction"
    } else {
      // Show generic error
      console.error(error.message);
    }
  }
};
```

---

## Loading States

### Show Loading Spinner

```typescript
import { Spinner } from "@/components/ui/spinner";

const { loading } = useCreateTask();

return (
  <div>
    {loading && <Spinner />}
    <button disabled={loading}>
      {loading ? "Processing..." : "Submit"}
    </button>
  </div>
);
```

### Disable Inputs While Loading

```typescript
<Input disabled={loading} placeholder="Enter value" />
<Button disabled={loading}>Submit</Button>
```

---

## Common Patterns

### Pattern 1: Auto-Refresh Task Status

```typescript
const { data: task, refetch } = useTaskWithRefresh(signer, taskId, 3000);

// Task data updates every 3 seconds automatically
// Manually refresh with: refetch()
```

### Pattern 2: Check Before Action

```typescript
const { data: task } = useTask(signer, taskId);

if (task?.status !== TaskStatus.ProofSubmitted) {
  return <p>Cannot approve - waiting for proof</p>;
}
```

### Pattern 3: Conditional Rendering

```typescript
const { data: task } = useTask(signer, taskId);

return (
  <div>
    {task?.status === TaskStatus.Open && (
      <SubmitProofButton taskId={taskId} />
    )}

    {task?.status === TaskStatus.ProofSubmitted && (
      <ApproveButton taskId={taskId} />
    )}

    {task?.status === TaskStatus.Paid && (
      <p>✅ Task completed!</p>
    )}
  </div>
);
```

---

## Testing Integration

### Manual Testing Checklist

- [ ] Wallet connects to Arc Testnet
- [ ] Create task form works
- [ ] Task appears in task list
- [ ] Worker can submit proof
- [ ] Creator can approve
- [ ] USDC transfers to worker
- [ ] Refund works after deadline

### Test Commands

```bash
# Check contract is deployed
npx hardhat run scripts/check-contract.js --network arcTestnet

# Check USDC balance
npx hardhat run scripts/check-usdc-balance.js --network arcTestnet

# View transaction on block explorer
https://explorer.testnet.arc.network/tx/{TRANSACTION_HASH}
```

---

## Troubleshooting

### Contract Address Not Set

**Error:** "Contract addresses not configured"

**Fix:** Update `.env` with deployed addresses

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xdef0...
NEXT_PUBLIC_USDC_ADDRESS=0xabcd...
```

### MetaMask Not Connected

**Error:** "User rejected the request"

**Fix:** Check MetaMask is:
- ✅ Installed
- ✅ Connected to Arc Testnet
- ✅ Has a signer

### Transactions Failing

Check:
1. Enough ETH for gas
2. Enough USDC for reward
3. Correct task ID
4. Task is in valid state

---

## Next Steps

1. ✅ Create tasks from your component
2. ✅ Display task list with status
3. ✅ Build proof submission form
4. ✅ Add approval workflow
5. ✅ Show transaction history

---

## Support

- 📚 [ArcEscrow Contract Docs](./contracts/README.md)
- 📖 [Ethers.js Documentation](https://docs.ethers.org)
- 🔗 [Arc Testnet Docs](https://docs.arc.network)

Happy building! 🚀
