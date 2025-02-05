'use client';

import {
  BackgroundImage,
  Box,
  Burger,
  Divider,
  Drawer,
  Group,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { ConnectButton } from '../ConnectButton';
import classes from './Header.module.css';

function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  return (
    <>
      <header className={classes.header}>
        <Group
          justify='space-between'
          h='100%'
        >
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
          <Group
            h='100%'
            gap={24}
            styles={(theme) => {
              return {
                root: {
                  marginLeft: theme.spacing.lg,
                },
              };
            }}
            align='center'
            justify='center'
            visibleFrom='sm'
          >
            <Link
              href='/'
              className={classes.link}
            >
              Home
            </Link>

            <Link
              href='https://fsantaclaus.gitbook.io/fcs'
              target='_blank'
              className={classes.link}
            >
              Whitepaper
            </Link>
          </Group>

          <Group visibleFrom='sm'>
            <ConnectButton />
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom='sm'
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size='100%'
        padding='md'
        title='FSanta Claus'
        hiddenFrom='sm'
        zIndex={1000000}
      >
        <ScrollArea
          h='calc(100vh - 80px'
          mx='-md'
        >
          <Divider my='sm' />

          <Link
            href='/'
            className={classes.link}
          >
            Home
          </Link>
          <Link
            href='/whitepaper'
            className={classes.link}
          >
            Whitepaper
          </Link>

          <Divider my='sm' />

          <Group
            justify='center'
            grow
            pb='xl'
            px='md'
          >
            <ConnectButton
              onClick={() => {
                closeDrawer();
              }}
            />
          </Group>
        </ScrollArea>
      </Drawer>
    </>
  );
}

export default Header;
