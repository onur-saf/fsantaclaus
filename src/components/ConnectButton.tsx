'use client';

import { Button, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { baseSepolia } from 'viem/chains';
import { useAccount, useDisconnect } from 'wagmi';

export function ConnectButton({ onClick }: { onClick?: () => void }) {
  const { disconnectAsync } = useDisconnect();
  const { isConnected, address, chain } = useAccount();
  const { hovered, ref } = useHover();

  if (chain && chain?.id !== baseSepolia.id) {
    return <Text>Unsupported chain</Text>;
  }

  if (isConnected) {
    return (
      <Button
        ref={ref}
        onClick={async () => await disconnectAsync()}
      >
        <Text
          truncate
          maw={144}
        >
          {address}
        </Text>
      </Button>
    );
  }

  return (
    <>
      <Button
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
        onClick={() => {
          onClick?.();
          modals.openContextModal({
            modal: 'connectWallet',
            title: 'Connect Wallet',
            padding: '16px 24px 36px 24px',
            centered: true,
            innerProps: {},
          });
        }}
      >
        Connect Wallet
      </Button>
    </>
  );
}
