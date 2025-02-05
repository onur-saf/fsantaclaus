'use client';
import { Container, Flex, Skeleton, Title } from '@mantine/core';
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
    >
      <Container
        bg='#202124'
        pos='relative'
        px={{ base: 0, sm: 24, md: 48 }}
        py={{ base: 24 }}
        fluid
        style={{
          borderRadius: 14,
          alignSelf: 'center',
          justifySelf: 'center',
        }}
      >
        <Title
          ta='center'
          size='h4'
        >
          $FSanta Claus Staking
        </Title>
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
      </Container>
    </Flex>
  );
};

export default StakingInfo;
