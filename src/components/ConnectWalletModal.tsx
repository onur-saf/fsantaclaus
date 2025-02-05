'use client';
import { Box, Button, Flex, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import Image from 'next/image';
import React from 'react';
import { useConnect } from 'wagmi';

const ConnectWalletModal = ({ context, id }: ContextModalProps) => {
  const { connectAsync, connectors } = useConnect();

  return (
    <Box>
      <Text
        size='sm'
        mb={24}
      >
        Connect your wallet to access the FSanta Claus Staking platform.
      </Text>
      <Flex
        gap='lg'
        direction='column'
      >
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={async () => {
              await connectAsync({ connector });
              context.closeModal(id);
            }}
          >
            {connector.name === 'MetaMask' ? (
              <Image
                src={'/metamask.svg'}
                alt={connector.name}
                width={128}
                height={128}
              />
            ) : connector.name === 'Coinbase Wallet' ? (
              <Image
                src={'/coinbase.svg'}
                alt={connector.name}
                width={128}
                height={128}
              />
            ) : (
              connector.name
            )}
          </Button>
        ))}
      </Flex>
    </Box>
  );
};

export default ConnectWalletModal;
