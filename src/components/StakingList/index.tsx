import {
  useGetStakePositionsPaginated,
  useUnstakePosition,
} from '@/hooks/useFSantaClausStaking';
import {
  ActionIcon,
  Box,
  Card,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  Pagination,
  RingProgress,
  Text,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconBriefcase, IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import StakingCard from '../StakingCard';
import classes from './StakingList.module.css';

const StakingList = () => {
  const { address } = useAccount();
  const [activePage, setActivePage] = useState(0);
  const { data, isFetching } = useGetStakePositionsPaginated(
    address as `0x${string}`,
    BigInt(activePage)
  );

  const { unstakePosition } = useUnstakePosition();

  const totalPages = Number(data?.totalPages);

  if (isFetching) {
    return (
      <LoadingOverlay
        visible
        loaderProps={{
          children: <Loader color='#fba0a0s' />,
        }}
      />
    );
  }

  if (Number(data?.totalPositions) === 0) {
    return <StakingCard />;
  }

  const totalPositions = data?.positions.length || 0;

  return (
    <Flex
      mah={{
        base: 400,
        md: 600,
      }}
      gap={12}
      direction='column'
      pos='relative'
      style={{
        alignSelf: 'center',
        overflow: 'hidden',
        overflowY: 'auto',
      }}
    >
      {data !== undefined && (
        <>
          <Grid>
            <Grid.Col
              span={{
                sm: totalPositions >= 1 ? 6 : 12,
                lg: totalPositions >= 2 ? 4 : 6,
                xl: totalPositions >= 3 ? 3 : 4,
              }}
            >
              <Card
                p='xl'
                className={classes.card}
                h='100%'
                w='100%'
                withBorder
              >
                <Tooltip
                  label='Stake $FSC'
                  color='#fba0a0'
                  fz='md'
                >
                  <ActionIcon
                    size={64}
                    variant='outline'
                    color='#fba0a0'
                    onClick={() => {
                      modals.open({
                        centered: true,
                        title: 'Stake $FSanta Claus',
                        children: <StakingCard />,
                      });
                    }}
                  >
                    <IconPlus size={64} />
                  </ActionIcon>
                </Tooltip>
              </Card>
            </Grid.Col>
            {data?.positions.map((position, index) => {
              const stakedAt = Number(position.timestamp);
              const period = 7 * 24 * 60 * 60; // 1 week in seconds
              const endDate = stakedAt + period;
              const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
              const progressPercentage = Math.min(
                Math.max(
                  ((currentTime - stakedAt) / (endDate - stakedAt)) * 100,
                  0
                ),
                100
              );
              return (
                <Grid.Col
                  key={index}
                  span={{
                    base: 12,
                    sm: totalPositions >= 1 ? 6 : 12,
                    lg: totalPositions >= 2 ? 4 : 6,
                    xl: totalPositions >= 3 ? 3 : 4,
                  }}
                >
                  <Card
                    withBorder
                    radius='md'
                    className={classes.card}
                  >
                    <Flex direction={{ base: 'column', xs: 'row' }}>
                      <Box>
                        <Text
                          fz='xl'
                          className={classes.label}
                        >
                          {`Stake #${index + 1}`}
                        </Text>
                        <Box>
                          <Text
                            className={classes.lead}
                            mt={30}
                          >
                            {new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 4,
                            }).format(Number(formatUnits(position.amount, 18)))}
                          </Text>
                          <Text
                            fz='xs'
                            c='green'
                          >
                            {`${
                              position.isActive ? 'Staked' : 'Unstaked'
                            } $FSC`}
                          </Text>
                        </Box>
                        <Group mt='lg'>
                          <div>
                            <Text className={classes.label}>
                              {dayjs(stakedAt * 1000).format(
                                'YYYY-MM-DDTHH:mm:ssZ[Z]'
                              )}
                            </Text>
                            <Text
                              size='xs'
                              c='dimmed'
                            >
                              Staked At
                            </Text>
                          </div>
                        </Group>
                      </Box>

                      <Flex
                        flex={1}
                        justify={{ base: 'center', xs: 'flex-end' }}
                        mt={{ base: 12, xs: 0 }}
                      >
                        <RingProgress
                          roundCaps
                          thickness={6}
                          size={150}
                          sections={[
                            { value: progressPercentage, color: 'green' },
                          ]}
                          label={
                            <Flex
                              direction='column'
                              gap={4}
                              justify='center'
                              align='center'
                            >
                              {progressPercentage >= 100 ? (
                                <Tooltip
                                  label='Unstake $FSC'
                                  color='#fba0a0'
                                  fz='xl'
                                >
                                  <ActionIcon
                                    size={32}
                                    variant='outline'
                                    color='green'
                                    onClick={() => {
                                      unstakePosition(BigInt(index));
                                    }}
                                  >
                                    <IconBriefcase size={32} />
                                  </ActionIcon>
                                </Tooltip>
                              ) : (
                                <Text
                                  ta='center'
                                  fz='lg'
                                  className={classes.label}
                                >
                                  {progressPercentage.toFixed(0)}%
                                </Text>
                              )}
                              <Text
                                ta='center'
                                fz='xs'
                                c={
                                  progressPercentage === 100
                                    ? 'green'
                                    : 'orange'
                                }
                              >
                                {progressPercentage === 100
                                  ? 'Completed'
                                  : 'Staking'}
                              </Text>
                            </Flex>
                          }
                        />
                      </Flex>
                    </Flex>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>

          <Pagination
            total={totalPages}
            bottom={0}
            pos='sticky'
            color='#fba0a0'
            style={{
              alignSelf: 'center',
            }}
            value={activePage + 1}
            onChange={(value) => {
              setActivePage(value - 1);
            }}
            mt='sm'
          />
        </>
      )}
    </Flex>
  );
};

export default StakingList;
