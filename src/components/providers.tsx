'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'viem/chains';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const config = getDefaultConfig({
  appName: 'FSanta Claus Staking',
  projectId: '2871ba69c10c6c0612dcc28da2dcceaa',
  chains: [process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale='en'
          theme={darkTheme({
            overlayBlur: 'small',
            accentColor: 'linear-gradient(45deg, #fba0a0, red)',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
