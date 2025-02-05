'use client';

import {
  useReadContract,
  useWriteContract,
  UseWriteContractReturnType,
} from 'wagmi';
import { FSantaClausStakingABI } from '@/abis/FSantaClausStakingABI'; // Import your ABI
import { FSantaClausABI } from '@/abis/FSantaClaus';
import { notifications } from '@mantine/notifications';
import { getBaseUrl } from '@/utils/getBaseUrl';

const FSantaClausStakingAddress = process.env
  .NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`;

export const fsantaTokenAddress = process.env
  .NEXT_PUBLIC_FSANTA_TOKEN_ADDRESS as `0x${string}`;

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

export function useCanUnstakePosition(
  userAddress: string,
  positionIndex: bigint
) {
  return useReadContract({
    address: FSantaClausStakingAddress,
    abi: FSantaClausStakingABI,
    functionName: 'canUnstakePosition',
    args: [userAddress as `0x${string}`, positionIndex],
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

export function useStake(): {
  stake: (amount: bigint) => void;
} & Omit<UseWriteContractReturnType, 'writeContract'> {
  const { writeContract, ...rest } = useWriteContract({
    mutation: {
      onError: (error) => {
        let message = 'An error occurred while trying to stake.';
        if (error.name === 'ContractFunctionExecutionError') {
          message = 'User denied transaction signature.';
        }
        notifications.show({
          title: 'Error',
          style: {
            zIndex: 20000000,
          },
          message,
          color: 'red',
        });
      },
    },
  });

  return {
    stake: (amount: bigint) => {
      writeContract({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'stake',
        args: [amount],
      });
    },
    ...rest,
  };
}

export function useUnstakePosition(): {
  unstakePosition: (positionIndex: bigint) => void;
} & Omit<UseWriteContractReturnType, 'writeContract'> {
  const { writeContract, ...rest } = useWriteContract();

  return {
    unstakePosition: (positionIndex: bigint) => {
      writeContract({
        address: FSantaClausStakingAddress,
        abi: FSantaClausStakingABI,
        functionName: 'unstakePosition',
        args: [positionIndex],
      });
    },
    ...rest,
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

async function fetchTokenAbi(tokenAddress: string) {
  const response = await fetch(
    `${getBaseUrl()}/api/get-abi?tokenAddress=${tokenAddress}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();

  if (data.status !== '1') {
    return FSantaClausABI;
  }

  return JSON.parse(data.result);
}
export function useApproveFsanta() {
  const { writeContractAsync } = useWriteContract();
  const handleApprove = async (amount: bigint) => {
    try {
      const abi = await fetchTokenAbi(fsantaTokenAddress);

      const approveAbi = abi.find(
        (fn: { name: string }) => fn.name === 'approve'
      );

      if (!approveAbi) throw new Error('approve function not found in ABI');

      return await writeContractAsync({
        address: fsantaTokenAddress,
        abi: abi,
        functionName: 'approve',
        args: [FSantaClausStakingAddress, amount],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  return { handleApprove };
}
