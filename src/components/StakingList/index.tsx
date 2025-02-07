import {
  useClaimPosition,
  useGetStakePositionsPaginated,
  useUnstakePosition,
} from '@/hooks/useFSantaClausStaking';
import {
  ActionIcon,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  Pagination,
  RingProgress,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconBriefcase, IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import { useCallback, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import StakingCard from '../StakingCard';
import classes from './StakingList.module.css';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

interface GridSpans {
  gridSm: number;
  gridLg: number;
  gridXl: number;
}

interface StakePosition {
  amount: bigint;
  timestamp: bigint;
  unstakeTimestamp: bigint;
  claimTimestamp: bigint;
  status: number;
  isActive: boolean;
}

const StakingStatus = {
  0: 'Staked',
  1: 'Unstaked',
  2: 'Claimed',
};

const PAGE_SIZE = 10;

const StakingList = () => {
  const { address, isConnected } = useAccount();
  const [activePage, setActivePage] = useState(0);
  const { data, isFetching, refetch } = useGetStakePositionsPaginated(
    address as `0x${string}`,
    BigInt(activePage)
  );

  const onSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { unstakePosition, isUnstakePending } = useUnstakePosition({
    onSuccess,
  });
  const { claimPosition, isClaimPending } = useClaimPosition({
    onSuccess,
  });

  const getGridSpans = useCallback((totalPositions: number) => {
    const gridSm = totalPositions >= 1 ? 6 : 12;
    const gridLg = totalPositions >= 2 ? 4 : gridSm;
    const gridXl = totalPositions >= 3 ? 3 : gridLg;
    return { gridSm, gridLg, gridXl };
  }, []);

  const renderStakeCard = useCallback(
    (gridSpans: GridSpans) => (
      <Grid.Col
        span={{
          sm: gridSpans.gridSm,
          lg: gridSpans.gridLg,
          xl: gridSpans.gridXl,
        }}
      >
        <Card
          p='xl'
          className={classes.card}
          h='100%'
          w='100%'
          withBorder
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
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
                  title: 'Add New Stake $SFC',
                  children: <StakingCard />,
                });
              }}
            >
              <IconPlus size={64} />
            </ActionIcon>
          </Tooltip>
        </Card>
      </Grid.Col>
    ),
    []
  );

  const calculateProgress = useCallback((stakedAt: number) => {
    const period = 7 * 24 * 60 * 60; // 1 week in seconds
    const endDate = stakedAt + period;
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.min(
      Math.max(((currentTime - stakedAt) / (endDate - stakedAt)) * 100, 0),
      100
    );
  }, []);

  const renderStakePosition = useCallback(
    (position: StakePosition, index: number, gridSpans: GridSpans) => {
      const stakedAt = Number(position.timestamp);
      const unstakeTimestamp = Number(position.unstakeTimestamp);
      const claimTimestamp = Number(position.claimTimestamp);
      const progressPercentage = calculateProgress(unstakeTimestamp);
      const status =
        StakingStatus[position.status as keyof typeof StakingStatus];

      return (
        <Grid.Col
          key={index}
          span={{
            base: 12,
            sm: gridSpans.gridSm,
            lg: gridSpans.gridLg,
            xl: gridSpans.gridXl,
          }}
        >
          <Card
            p='xl'
            withBorder
            radius='md'
            className={classes.card}
            h='100%'
            w='100%'
          >
            <Flex direction={{ base: 'column', xs: 'row' }}>
              <Box>
                <Text
                  fz='xl'
                  className={classes.label}
                >
                  {`Stake #${activePage * PAGE_SIZE + index + 1}`}
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
                    {`${position.isActive ? 'Staked' : 'Unstaked'} $FSC`}
                  </Text>
                </Box>
                <Group mt='lg'>
                  <div>
                    <Text className={classes.label}>
                      {dayjs.utc(stakedAt * 1000).format('LLL')}
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
                  sections={[{ value: progressPercentage, color: 'green' }]}
                  label={
                    <Flex
                      direction='column'
                      gap={4}
                      justify='center'
                      align='center'
                    >
                      {status === 'Staked' && (
                        <Tooltip
                          label='Unstake $FSC'
                          color='green'
                          fz='xl'
                        >
                          <ActionIcon
                            size={32}
                            loading={isUnstakePending}
                            disabled={isUnstakePending}
                            onClick={async () => {
                              await unstakePosition(
                                BigInt(activePage * PAGE_SIZE + index)
                              );
                            }}
                            variant='outline'
                            color='green'
                          >
                            <IconBriefcase size={32} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {status === 'Unstaked' &&
                        (progressPercentage >= 100 ? (
                          <Tooltip
                            label='Claim $FSC'
                            color='#fba0a0'
                            fz='xl'
                          >
                            <ActionIcon
                              size={32}
                              variant='outline'
                              color='green'
                              onClick={async () => {
                                await claimPosition(
                                  BigInt(activePage * PAGE_SIZE + index)
                                );
                              }}
                              loading={isClaimPending}
                              disabled={isClaimPending}
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
                        ))}
                      <Text
                        ta='center'
                        fz='xs'
                        c={
                          status === 'Staked'
                            ? 'orange'
                            : status === 'Unstaked'
                            ? progressPercentage >= 100
                              ? 'green'
                              : 'orange'
                            : 'green'
                        }
                      >
                        {status === 'Staked'
                          ? 'Staking'
                          : status === 'Unstaked'
                          ? progressPercentage >= 100
                            ? 'Claimable'
                            : 'Claim In Progress'
                          : 'Claimed'}

                        {status === 'Claimed' && (
                          <Text
                            fz='xs'
                            c='dimmed'
                          >
                            At {dayjs.utc(claimTimestamp * 1000).format('LLL')}
                          </Text>
                        )}
                      </Text>
                    </Flex>
                  }
                />
              </Flex>
            </Flex>
          </Card>
        </Grid.Col>
      );
    },
    [
      calculateProgress,
      unstakePosition,
      claimPosition,
      isUnstakePending,
      isClaimPending,
      activePage,
    ]
  );

  const totalPositions = data?.positions.length || 0;
  const gridSpans = useMemo(
    () => getGridSpans(totalPositions),
    [getGridSpans, totalPositions]
  );

  const handlePageChange = useCallback((value: number) => {
    setActivePage(value - 1);
  }, []);

  if (isFetching) {
    return (
      <LoadingOverlay
        visible
        loaderProps={{
          children: <Loader color='#fba0a0' />,
        }}
      />
    );
  }

  if (
    Number(data?.totalPositions) === 0 ||
    (isConnected && !isFetching && data === undefined)
  ) {
    return <StakingCard />;
  }

  return (
    <Container
      bg='#202124'
      pos='relative'
      px={{ base: 0, sm: 24, md: 48 }}
      py={{ base: 24 }}
      fluid
      w={{ base: '100%', md: '90%', lg: '80%', xl: '70%' }}
      style={{
        borderRadius: 14,
        alignSelf: 'center',
        justifySelf: 'center',
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
        <Grid>
          {renderStakeCard(gridSpans)}
          {data?.positions.map((position, index) => {
            const metadata = data.positionMetadata[index];
            const _position = {
              ...position,
              ...metadata,
            };

            return renderStakePosition(_position, index, gridSpans);
          })}
        </Grid>

        <Pagination
          total={Number(data?.totalPages)}
          bottom={0}
          pos='sticky'
          color='#fba0a0'
          style={{
            alignSelf: 'center',
          }}
          value={activePage + 1}
          onChange={handlePageChange}
          mt='sm'
        />
      </Flex>
    </Container>
  );
};

export default StakingList;
