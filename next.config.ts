import type { NextConfig } from 'next';
import fs from 'fs';
import dotenv from 'dotenv';

const appEnv = process.env.APP_ENV || 'testnet';
const env = fs.readFileSync(`.env.${appEnv}`);

const config = dotenv.parse(env);

const nextConfig: NextConfig = {
  /* config options here */
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
    APP_ENV: appEnv,
  },
};

export default nextConfig;
