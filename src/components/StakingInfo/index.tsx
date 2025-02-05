'use client';
import { Flex, Skeleton } from '@mantine/core';
import { useAccount } from 'wagmi';
import StakingCard from '../StakingCard';
import StakingList from '../StakingList';

const StakingInfo = () => {
  const { isConnected, isConnecting } = useAccount();

  return (
    <Flex
      justify='center'
      align='center'
      mx={{ base: 12 }}
      h='100%'
      direction='column'
    >
      {isConnecting ? (
        <Skeleton
          width={120}
          height={24}
          radius='xl'
        />
      ) : isConnected ? (
        <StakingList />
      ) : (
        <StakingCard />
      )}
    </Flex>
  );
};

export default StakingInfo;
