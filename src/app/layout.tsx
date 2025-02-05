import { Providers } from '@/components/providers';
import { ModalsProvider } from '@mantine/modals';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import ConnectWalletModal from '@/components/ConnectWalletModal';
import Header from '@/components/Header';
import { theme } from '@/utils/theme';
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import Footer from '@/components/Footer';
import Image from 'next/image';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FSanta Claus Staking',
  description:
    'Welcome to FSanta Claus ($FSC), the most unhinged, community-driven meme coin on Base! Imagine Santa Claus, but make him autistic, naked, and absolutely obsessed with making degen plays. That’s $FSC. ',
  category: 'Finance',
  keywords: [
    'FSanta Claus',
    'FSC',
    'Staking',
    'Base',
    'Meme Coin',
    'DeFi',
    'Yield Farming',
    'Flaunch',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript forceColorScheme='dark' />
        <link
          rel='shortcut icon'
          href='/favicon.ico'
          type='image/x-icon'
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <MantineProvider
            theme={theme}
            classNamesPrefix='fsanta'
            forceColorScheme='dark'
          >
            <ModalsProvider
              modals={{
                connectWallet: ConnectWalletModal,
              }}
              modalProps={{
                transitionProps: {
                  transition: 'fade',
                  duration: 200,
                },
                overlayProps: {
                  blur: 3,
                  backgroundOpacity: 0.55,
                },
              }}
            >
              <Header />
              <Image
                style={{
                  zIndex: -1,
                  objectFit: 'cover',
                }}
                src='/bg.jpeg'
                alt='bg'
                priority
                fill
              />
              {children}
              <Footer />
            </ModalsProvider>
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
