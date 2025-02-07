'use client';
import {
  fsantaTokenAddress,
  useFSCBalance,
  useStakePosition,
  useTotalStaked,
} from '@/hooks/useFSantaClausStaking';
import {
  Button,
  Container,
  Flex,
  NumberInput,
  Skeleton,
  Slider,
  Text,
  Title,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { formatUnits, parseEther } from 'viem';
import { useAccount } from 'wagmi';

function StakingCard() {
  const { hovered, ref } = useHover();
  const [stakeAmount, setStakeAmount] = useState<number | string>(0);
  const [stakePercentage, setStakePercentage] = useState<number>(0);
  const { balance, refetch: refetchBalance } = useFSCBalance();
  const { data, refetch, isFetching: isFetchingTotalStaked } = useTotalStaked();
  const totalStaked = formatUnits(data ?? BigInt(0), 18);

  const onSuccess = useCallback(() => {
    refetch();
    refetchBalance();
  }, [refetch, refetchBalance]);

  const { stakePosition, isStakePending } = useStakePosition({
    onSuccess,
  });
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <Container
      bg='#202124'
      pos='relative'
      px={{ base: 0, sm: 24, md: 48 }}
      py={{ base: 24 }}
      fluid
      style={{
        borderRadius: 14,
      }}
    >
      <Title
        ta='center'
        size='h4'
        mb={24}
      >
        $FSanta Claus Staking
      </Title>
      <Flex
        direction='column'
        mt={24}
        gap='xl'
      >
        <Slider
          color='#fba0a0'
          defaultValue={0.0}
          size='lg'
          onChange={(value) => {
            setStakePercentage(value);
            setStakeAmount((parseFloat(balance) * value) / 100);
          }}
          value={stakePercentage}
          marks={[
            {
              value: 0,
              label: '0%',
            },
            {
              value: 25,
              label: '25%',
            },
            {
              value: 50,
              label: '50%',
            },
            {
              value: 75,
              label: '75%',
            },
            {
              value: 100,
              label: '100%',
            },
          ]}
        />

        <NumberInput
          onChange={(value) => {
            setStakeAmount(value);
            setStakePercentage((Number(value) / parseFloat(balance)) * 100);
          }}
          allowDecimal
          fixedDecimalScale
          suffix=' $FSC'
          value={stakeAmount}
          defaultValue={0}
          thousandSeparator=','
          min={0}
          max={parseFloat(balance)}
        />

        <Button
          loading={isStakePending}
          gradient={
            hovered
              ? {
                  from: 'red',
                  to: '#fba0a0',
                  deg: 45,
                }
              : undefined
          }
          ref={ref}
          onClick={async () => {
            if (!isConnected) {
              openConnectModal?.();
            } else if (parseFloat(balance) === 0) {
              modals.open({
                title: 'Insufficient Funds ($FSC)',
                centered: true,
                children: (
                  <Text>
                    {`You don't have enough funds to stake. You can buy more $FSC on `}
                    <Text
                      component={Link}
                      target='_blank'
                      href={`https://flaunch.gg/base/coin/${fsantaTokenAddress}`}
                      c='indigo'
                    >
                      Flaunch
                    </Text>
                  </Text>
                ),
              });
            } else {
              try {
                await stakePosition(parseEther(stakeAmount.toString()));
              } catch (error) {
                console.log('error', error);
              }
            }
          }}
        >
          Stake FSanta Claus Tokens
        </Button>
      </Flex>

      {isFetchingTotalStaked ? (
        <Skeleton
          height={40}
          mt={12}
          width='100%'
        />
      ) : (
        <Text
          mt={12}
          ta='center'
        >
          Total Staked: {parseFloat(totalStaked).toFixed(4)} $FSC
        </Text>
      )}
    </Container>
  );
}

export default StakingCard;
