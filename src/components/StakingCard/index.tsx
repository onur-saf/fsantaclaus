import {
  fsantaTokenAddress,
  useApproveFsanta,
  useStake,
} from '@/hooks/useFSantaClausStaking';
import { Button, Flex, NumberInput, Slider, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useAccount, useBalance, useBlockNumber } from 'wagmi';

function StakingCard() {
  const queryClient = useQueryClient();

  // const { data } = useTotalStaked();
  const { hovered, ref } = useHover();
  const [stakeAmount, setStakeAmount] = useState<number | string>(0);
  const [stakePercentage, setStakePercentage] = useState<number>(0);
  // const totalStaked = formatUnits(data ?? BigInt(0), 18);
  const { handleApprove } = useApproveFsanta();
  const { stake, isPending } = useStake();
  const { isConnected, address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: fsantaTokenAmount, queryKey } = useBalance({
    address,
    chainId: baseSepolia.id,
    token: fsantaTokenAddress,
    unit: 'ether',
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber]);

  return (
    <Flex
      direction='column'
      mt={24}
      gap='xl'
    >
      <Slider
        color='#fba0a0'
        defaultValue={0}
        size='lg'
        onChange={(value) => {
          setStakePercentage(value);
          setStakeAmount(
            ((Number(fsantaTokenAmount?.formatted ?? 0) * value) / 100).toFixed(
              2
            )
          );
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
          setStakePercentage(
            (Number(value) / Number(fsantaTokenAmount?.formatted ?? 0)) * 100
          );
        }}
        decimalScale={2}
        allowDecimal
        fixedDecimalScale
        suffix=' $FSC'
        value={stakeAmount}
        defaultValue={0}
        thousandSeparator=','
        min={0}
        max={Number(fsantaTokenAmount?.formatted ?? 0)}
        step={1}
      />

      <Button
        loading={isPending}
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
            modals.openContextModal({
              modal: 'connectWallet',
              title: 'Connect Wallet',
              padding: '16px 24px 36px 24px',
              centered: true,
              innerProps: {},
            });
          } else if (Number(fsantaTokenAmount?.formatted ?? 0) === 0) {
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
              await handleApprove(parseEther(stakeAmount.toString()));
              stake(parseEther(stakeAmount.toString()));
            } catch (error) {
              console.log('error', error);
            }
          }
        }}
      >
        Stake FSanta Claus Tokens
      </Button>
    </Flex>
  );
}

export default StakingCard;
