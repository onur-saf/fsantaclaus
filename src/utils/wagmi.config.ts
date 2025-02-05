import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [metaMask(), coinbaseWallet()],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
