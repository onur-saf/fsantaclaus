'use client';
import { ActionIcon, BackgroundImage, Box, Group, Text } from '@mantine/core';
import { IconBrandTelegram, IconBrandX } from '@tabler/icons-react';

import { fsantaTokenAddress } from '@/hooks/useFSantaClausStaking';
import Link from 'next/link';
import classes from './Footer.module.css';

function Footer() {
  return (
    <footer className={classes.footer}>
      <Box className={classes.inner}>
        <Box>
          <BackgroundImage
            src='/logo.jpeg'
            component={Link}
            href='/'
            w={48}
            h={48}
            radius='xl'
          />
        </Box>
        <Group>
          <Text ta='center'>
            {`© ${new Date().getFullYear()} FSanta Claus. All rights reserved.`}
          </Text>
        </Group>
        <Group
          gap={0}
          className={classes.links}
          justify='flex-end'
          wrap='nowrap'
        >
          <ActionIcon
            size='lg'
            color='gray'
            variant='subtle'
            component={Link}
            target='_blank'
            href='https://x.com/0xFSantaClaus'
          >
            <IconBrandX
              size={18}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon
            size='lg'
            color='gray'
            variant='subtle'
          >
            <IconBrandTelegram
              size={18}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon
            size='lg'
            color='gray'
            variant='subtle'
            target='_blank'
            component={Link}
            href={`https://flaunch.gg/base/coin/${fsantaTokenAddress}`}
          >
            <BackgroundImage
              w={24}
              h={24}
              src='/flaunch.webp'
            />
          </ActionIcon>
        </Group>
      </Box>
    </footer>
  );
}

export default Footer;
