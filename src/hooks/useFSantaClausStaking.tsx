'use client';

import { FSantaClausABI } from '@/abis/FSantaClaus';
import { FSantaClausStakingABI } from '@/abis/FSantaClausStakingABI'; // Import your ABI
import { Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { formatUnits } from 'viem';
import {
  BaseError,
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
  UseWriteContractReturnType,
} from 'wagmi';
const FSantaClausStakingAddress = process.env
  .NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`;

export const fsantaTokenAddress = process.env
  .NEXT_PUBLIC_FSANTA_TOKEN_ADDRESS as `0x${string}`;

let baseScan = 'https://sepolia.basescan.org';
if (process.env.NEXT_PUBLIC_NETWORK === 'mainnet') {
  baseScan = 'https://basescan.org';
}

const baseScanUrl = (txHash: string) => `${baseScan}/tx/${txHash}`;

export function useUserTotalStake(address: string) {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'getUserTotalStake',
    args: [address as `0x${string}`],
  });
}

export function useGetPosition(userAddress: string, positionIndex: bigint) {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'getPosition',
    args: [userAddress as `0x${string}`, positionIndex],
  });
}

export function useGetActivePositionsCount(userAddress: string) {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'getActivePositionsCount',
    args: [userAddress as `0x${string}`],
  });
}

export function useGetStakePositionsPaginated(
  userAddress: string,
  page: bigint
) {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'getStakePositionsPaginated',
    args: [userAddress as `0x${string}`, page],
  });
}

export function useTotalStaked() {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'totalStaked',
  });
}

export function useAirdropPool() {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'airdropPool',
  });
}

export function useCooldownPeriod() {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'COOLDOWN_PERIOD',
  });
}

export function useContractVersion() {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'version',
  });
}

export function useAllowance() {
  return useReadContract({
    address: fsantaTokenAddress,
    abi: FSantaClausABI,
    functionName: 'allowance',
    args: [useAccount().address as `0x${string}`, FSantaClausStakingAddress],
  });
}

export function useStakePosition({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const publicClient = usePublicClient();
  const {
    data: approveTxHash,
    writeContractAsync: approveToken,
    isPending: isApprovePending,
  } = useWriteContract();
  const {
    data: stakeTxHash,
    writeContractAsync: stakeTokens,
    isPending: isStakePending,
  } = useWriteContract();

  const { data: allowance } = useAllowance();
  const handleStake = async (amount: bigint) => {
    try {
      // Reset transaction hashes at the start of each stake action
      if (!allowance || allowance < amount) {
        await approveToken({
          address: fsantaTokenAddress,
          abi: FSantaClausABI,
          functionName: 'approve',
          args: [FSantaClausStakingAddress, amount],
        });
      }
      await stakeTokens({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'stake',
        args: [amount],
      });
    } catch (error: unknown) {
      const _error = error as BaseError;
      notifications.show({
        title: (
          <Title
            c='red'
            order={3}
          >
            Error
          </Title>
        ),
        position: 'top-right',
        message: <Text c='red'>{_error?.shortMessage ?? _error.message}</Text>,
        color: 'red',
      });
    }
  };

  const {
    isLoading: isApproveLoading,
    isError: isApproveError,
    error: approveError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const {
    isLoading: isStakeLoading,
    isError: isStakeError,
    error: stakeError,
    isSuccess: isStakeSuccess,
  } = useWaitForTransactionReceipt({
    hash: stakeTxHash,
  });

  const handleApproveNotification = useCallback(async () => {
    if (!approveTxHash || !publicClient) return;
    if (isApproveError && approveError) {
      const approveTxReceipt = await publicClient.getTransactionReceipt({
        hash: approveTxHash,
      });
      notifications.show({
        id: 'approve-error',
        title: (
          <Title
            c='red'
            order={3}
          >
            Approval Failed
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='red'>
            {(approveError as BaseError)?.shortMessage ??
              'Failed to approve tokens'}
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(approveTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
        color: 'red',
      });
    }
  }, [approveTxHash, publicClient, isApproveError, approveError]);

  useEffect(() => {
    handleApproveNotification();
  }, [handleApproveNotification]);

  const handleStakeNotification = useCallback(async () => {
    if (!stakeTxHash || !publicClient) return;

    if (isStakeError && stakeError) {
      const stakeTxReceipt = await publicClient.getTransactionReceipt({
        hash: stakeTxHash,
      });
      notifications.show({
        title: (
          <Title
            c='red'
            order={3}
          >
            Staking Failed
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='red'>
            {(stakeError as BaseError)?.shortMessage ??
              'Failed to stake tokens'}
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(stakeTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
        color: 'red',
      });
    }
    if (isStakeSuccess) {
      const stakeTxReceipt = await publicClient.getTransactionReceipt({
        hash: stakeTxHash,
      });
      notifications.show({
        id: 'stake-success',
        title: (
          <Title
            c='green'
            order={3}
          >
            Staking Successful
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='green'>
            Tokens staked successfully
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(stakeTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
        color: 'green',
      });
      onSuccess?.();
    }
  }, [
    isStakeError,
    stakeError,
    stakeTxHash,
    publicClient,
    isStakeSuccess,
    onSuccess,
  ]);

  useEffect(() => {
    handleStakeNotification();
  }, [handleStakeNotification]);

  return {
    stakePosition: handleStake,
    isStakePending:
      isStakePending || isStakeLoading || isApprovePending || isApproveLoading,
  };
}

export function useUnstakePosition({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const publicClient = usePublicClient();
  const {
    data: unstakeTxHash,
    isPending: isUnstakePending,
    writeContractAsync: unstakePosition,
  } = useWriteContract();

  const handleUnstake = async (positionIndex: bigint) => {
    try {
      await unstakePosition({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'unstakePosition',
        args: [positionIndex],
      });
    } catch (error) {
      const _error = error as BaseError;
      notifications.show({
        title: (
          <Title
            c='red'
            order={3}
          >
            Error
          </Title>
        ),
        position: 'top-right',
        message: <Text c='red'>{_error?.shortMessage ?? _error.message}</Text>,
        color: 'red',
      });
    }
  };

  const {
    isLoading: isUnstakeLoading,
    isError: isUnstakeError,
    error: unstakeError,
    isSuccess: isUnstakeSuccess,
  } = useWaitForTransactionReceipt({
    hash: unstakeTxHash,
    query: {
      enabled: !!unstakeTxHash,
    },
  });

  const handleUnstakeNotification = useCallback(async () => {
    if (!unstakeTxHash || !publicClient) return;
    if (isUnstakeError && unstakeError) {
      const unstakeTxReceipt = await publicClient.getTransactionReceipt({
        hash: unstakeTxHash,
      });
      notifications.show({
        title: (
          <Title
            c='red'
            order={3}
          >
            Unstaking Failed
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='red'>
            {(unstakeError as BaseError)?.shortMessage ??
              'Failed to unstake tokens'}
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(unstakeTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
        color: 'red',
      });
    }
    if (isUnstakeSuccess) {
      const unstakeTxReceipt = await publicClient.getTransactionReceipt({
        hash: unstakeTxHash,
      });
      notifications.show({
        title: (
          <Title
            c='green'
            order={3}
          >
            Unstaking Successful
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='green'>
            Tokens unstaked successfully
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(unstakeTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
      });
      onSuccess?.();
    }
  }, [
    isUnstakeError,
    unstakeError,
    isUnstakeSuccess,
    unstakeTxHash,
    publicClient,
    onSuccess,
  ]);

  useEffect(() => {
    handleUnstakeNotification();
  }, [handleUnstakeNotification]);

  return {
    unstakePosition: handleUnstake,
    isUnstakePending: isUnstakePending || isUnstakeLoading,
  };
}

export function useClaimPosition({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const publicClient = usePublicClient();
  const {
    data: claimTxHash,
    isPending: isClaimPending,
    writeContractAsync: claimPosition,
  } = useWriteContract();

  const handleClaim = async (positionIndex: bigint) => {
    try {
      await claimPosition({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'claimPosition',
        args: [positionIndex],
      });
    } catch (error) {
      const _error = error as BaseError;
      notifications.show({
        title: (
          <Title
            c='red'
            order={3}
          >
            Error
          </Title>
        ),
        position: 'top-right',
        message: <Text c='red'>{_error?.shortMessage ?? _error.message}</Text>,
        color: 'red',
      });
    }
  };

  const {
    isLoading: isClaimLoading,
    isError: isClaimError,
    error: claimError,
    isSuccess: isClaimSuccess,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
    query: {
      enabled: !!claimTxHash,
    },
  });

  const handleClaimNotification = useCallback(async () => {
    if (!claimTxHash || !publicClient) return;
    if (isClaimError && claimError) {
      const claimTxReceipt = await publicClient.getTransactionReceipt({
        hash: claimTxHash,
      });
      notifications.show({
        title: (
          <Title
            c='red'
            order={3}
          >
            Claim Failed
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='red'>
            {(claimError as BaseError)?.shortMessage ??
              'Failed to claim tokens'}
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(claimTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
        color: 'red',
      });
    }
    if (isClaimSuccess) {
      const claimTxReceipt = await publicClient.getTransactionReceipt({
        hash: claimTxHash,
      });
      notifications.show({
        title: (
          <Title
            c='green'
            order={3}
          >
            Claim Successful
          </Title>
        ),
        position: 'top-right',
        message: (
          <Text c='green'>
            Tokens claimed successfully
            <Text
              component={Link}
              ml={8}
              c='gray'
              target='_blank'
              href={baseScanUrl(claimTxReceipt.transactionHash)}
            >
              View on BaseScan
            </Text>
          </Text>
        ),
      });
      onSuccess?.();
    }
  }, [
    isClaimError,
    claimError,
    isClaimSuccess,
    claimTxHash,
    publicClient,
    onSuccess,
  ]);

  useEffect(() => {
    handleClaimNotification();
  }, [handleClaimNotification]);

  return {
    claimPosition: handleClaim,
    isClaimPending: isClaimPending || isClaimLoading,
  };
}

export function useSetAirdropPool(): {
  setAirdropPool: (newPool: `0x${string}`) => void;
} & Omit<UseWriteContractReturnType, 'writeContract'> {
  const { writeContract, ...rest } = useWriteContract();

  return {
    setAirdropPool: (newPool: `0x${string}`) => {
      writeContract({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'setAirdropPool',
        args: [newPool],
      });
    },
    ...rest,
  };
}

export function useEmergencyWithdraw(): {
  emergencyWithdraw: (tokenAddress: `0x${string}`) => void;
} & Omit<UseWriteContractReturnType, 'writeContract'> {
  const { writeContract, ...rest } = useWriteContract();

  return {
    emergencyWithdraw: (tokenAddress: `0x${string}`) => {
      writeContract({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'emergencyWithdraw',
        args: [tokenAddress],
      });
    },
    ...rest,
  };
}

export function useFSCBalance() {
  const { address, isConnected } = useAccount();
  const { data, refetch, isFetching } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: isConnected && address !== undefined,
    },
    contracts: [
      {
        address: fsantaTokenAddress,
        abi: FSantaClausABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        address: fsantaTokenAddress,
        abi: FSantaClausABI,
        functionName: 'decimals',
      },
      {
        address: fsantaTokenAddress,
        abi: FSantaClausABI,
        functionName: 'symbol',
      },
    ],
  });

  return {
    refetch,
    balance: formatUnits(data?.[0] ?? BigInt(0), data?.[1] ?? 18),
    decimals: data?.[1],
    symbol: data?.[2],
    isFetching,
  };
}
