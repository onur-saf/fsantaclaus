'use client';
import { Flex, Skeleton } from '@mantine/core';
import { useAccount } from 'wagmi';
import StakingCard from '../StakingCard';
import StakingList from '../StakingList';

const StakingInfo = () => {
  const { isConnected, isConnecting } = useAccount();

  return (
    <Flex
      direction='column'
      justify='center'
      align='center'
      h={{ base: '70vh', md: '90vh' }}
      mx={{ base: 12 }}
    >
      {isConnecting ? (
        <Skeleton
          width={400}
          height={400}
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
