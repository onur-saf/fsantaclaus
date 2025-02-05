'use server';

import { FSantaClausABI } from '@/abis/FSantaClaus';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

async function fetchTokenAbi(tokenAddress: string, network: string) {
  const BASESCAN_API_KEY = serverRuntimeConfig.BASESCAN_API_KEY;
  if (!BASESCAN_API_KEY) {
    return FSantaClausABI;
  }
  const baseScanUrls = {
    base: `https://api.basescan.org/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${BASESCAN_API_KEY}`,
    'base-sepolia': `https://api-sepolia.basescan.org/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${BASESCAN_API_KEY}`,
  };

  const url = baseScanUrls[network as keyof typeof baseScanUrls];
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== '1') {
    return FSantaClausABI;
  }

  return JSON.parse(data.result);
}

export async function getAbi(tokenAddress: string) {
  let network = null;
  if (!tokenAddress) {
    return FSantaClausABI;
  }

  if (serverRuntimeConfig.APP_ENV === 'testnet') {
    network = 'base-sepolia';
  } else if (serverRuntimeConfig.APP_ENV === 'mainnet') {
    network = 'base';
  }

  if (!network) {
    return FSantaClausABI;
  }

  try {
    const abi = await fetchTokenAbi(tokenAddress, network);
    return abi;
  } catch {
    return FSantaClausABI;
  }
}
