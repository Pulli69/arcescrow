/**
 * React Hooks for ArcEscrow Contract Interactions
 * 
 * These hooks handle loading states, errors, and provide easy-to-use
 * interfaces for React components to interact with the smart contract
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import {
  ArcEscrowService,
  createArcEscrowService,
  Task,
} from "./contractService";
import { TaskStatus, TASK_STATUS_NAMES } from "./contractConfig";

/**
 * Hook state interface
 */
interface UseContractState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for creating a new task
 */
export function useCreateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const createTask = useCallback(
    async (
      signer: ethers.Signer,
      workerAddress: string,
      rewardAmount: string,
      deadlineDays: number
    ) => {
      try {
        setLoading(true);
        setError(null);
        setTxHash(null);

        const service = await createArcEscrowService(signer);
        const hash = await service.createTask(
          workerAddress,
          rewardAmount,
          deadlineDays
        );

        setTxHash(hash);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createTask, loading, error, txHash };
}

/**
 * Hook for submitting proof
 */
export function useSubmitProof() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const submitProof = useCallback(
    async (
      signer: ethers.Signer,
      taskId: number,
      proofLink: string
    ) => {
      try {
        setLoading(true);
        setError(null);
        setTxHash(null);

        const service = await createArcEscrowService(signer);
        const hash = await service.submitProof(taskId, proofLink);

        setTxHash(hash);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submitProof, loading, error, txHash };
}

/**
 * Hook for approving a task
 */
export function useApproveTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const approveTask = useCallback(
    async (signer: ethers.Signer, taskId: number) => {
      try {
        setLoading(true);
        setError(null);
        setTxHash(null);

        const service = await createArcEscrowService(signer);
        const hash = await service.approveTask(taskId);

        setTxHash(hash);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { approveTask, loading, error, txHash };
}

/**
 * Hook for refunding a task
 */
export function useRefundTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const refundTask = useCallback(
    async (signer: ethers.Signer, taskId: number) => {
      try {
        setLoading(true);
        setError(null);
        setTxHash(null);

        const service = await createArcEscrowService(signer);
        const hash = await service.refundTask(taskId);

        setTxHash(hash);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { refundTask, loading, error, txHash };
}

/**
 * Hook for fetching a single task
 */
export function useTask(signer: ethers.Signer | null, taskId: number | null) {
  const [state, setState] = useState<UseContractState<Task>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!signer || taskId === null) return;

    const fetchTask = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const service = await createArcEscrowService(signer);
        const task = await service.getTask(taskId);

        setState({ data: task, loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
      }
    };

    fetchTask();
  }, [signer, taskId]);

  return state;
}

/**
 * Hook for fetching total tasks count
 */
export function useTotalTasks(signer: ethers.Signer | null) {
  const [state, setState] = useState<UseContractState<number>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!signer) return;

    const fetchTotal = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const service = await createArcEscrowService(signer);
        const total = await service.getTotalTasks();

        setState({ data: total, loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
      }
    };

    fetchTotal();
  }, [signer]);

  return state;
}

/**
 * Hook for fetching USDC balance
 */
export function useUSDCBalance(
  signer: ethers.Signer | null,
  address: string | null
) {
  const [state, setState] = useState<UseContractState<string>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!signer || !address) return;

    const fetchBalance = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const service = await createArcEscrowService(signer);
        const balance = await service.getUSDCBalance(address);

        setState({ data: balance, loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
      }
    };

    fetchBalance();
  }, [signer, address]);

  return state;
}

/**
 * Hook for fetching task status
 */
export function useTaskStatus(
  signer: ethers.Signer | null,
  taskId: number | null
) {
  const [state, setState] = useState<UseContractState<TaskStatus>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!signer || taskId === null) return;

    const fetchStatus = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const service = await createArcEscrowService(signer);
        const status = await service.getTaskStatus(taskId);

        setState({ data: status, loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
      }
    };

    fetchStatus();
  }, [signer, taskId]);

  return state;
}

/**
 * Hook for polling task data (auto-refresh)
 * Useful for watching task status changes
 */
export function useTaskWithRefresh(
  signer: ethers.Signer | null,
  taskId: number | null,
  refetchInterval: number = 5000 // 5 seconds
) {
  const [state, setState] = useState<UseContractState<Task>>({
    data: null,
    loading: false,
    error: null,
  });
  const [refetching, setRefetching] = useState(false);

  const refetch = useCallback(async () => {
    if (!signer || taskId === null) return;

    try {
      setRefetching(true);
      const service = await createArcEscrowService(signer);
      const task = await service.getTask(taskId);
      setState({ data: task, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState((prev) => ({ ...prev, error }));
    } finally {
      setRefetching(false);
    }
  }, [signer, taskId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetch, refetchInterval]);

  return { ...state, refetch, refetching };
}

/**
 * Hook for getting task status display text
 */
export function useTaskStatusName(status: TaskStatus | null): string {
  if (status === null) return "Unknown";
  return TASK_STATUS_NAMES[status] || "Unknown";
}

/**
 * Hook for handling contract initialization with error boundary
 */
export function useContractInitialization(signer: ethers.Signer | null) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [service, setService] = useState<ArcEscrowService | null>(null);

  useEffect(() => {
    if (!signer) {
      setInitialized(false);
      return;
    }

    const init = async () => {
      try {
        const newService = await createArcEscrowService(signer);
        setService(newService);
        setInitialized(true);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setInitialized(false);
      }
    };

    init();
  }, [signer]);

  return { initialized, service, error };
}
