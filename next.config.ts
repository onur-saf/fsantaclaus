import type { NextConfig } from 'next';
import fs from 'fs';
import dotenv from 'dotenv';

const network = process.env.NETWORK || 'testnet';
const env = fs.readFileSync(`.env.${network}`);

const config = dotenv.parse(env);

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
    ],
  },
  env: {
    NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS:
      config.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
    NEXT_PUBLIC_FSANTA_TOKEN_ADDRESS: config.NEXT_PUBLIC_FSANTA_TOKEN_ADDRESS,
    NEXT_PUBLIC_NETWORK: config.NEXT_PUBLIC_NETWORK,
  },
};

export default nextConfig;
