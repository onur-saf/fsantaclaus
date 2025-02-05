import { FSantaClausABI } from '@/abis/FSantaClaus';
import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  let network = null;
  console.log(serverRuntimeConfig);

  if (serverRuntimeConfig.APP_ENV === 'testnet') {
    network = 'base-sepolia';
  } else if (serverRuntimeConfig.APP_ENV === 'mainnet') {
    network = 'base';
  }

  if (!network) {
    return NextResponse.json(
      {
        message: 'Invalid network',
      },
      {
        status: 500,
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const tokenAddress = searchParams.get('tokenAddress');
  if (!tokenAddress) {
    return NextResponse.json(
      {
        message: 'Invalid token address',
      },
      {
        status: 500,
      }
    );
  }

  try {
    const abi = await fetchTokenAbi(tokenAddress, network);
    return NextResponse.json(abi);
  } catch {
    return NextResponse.json(
      {
        message: 'Error fetching token ABI',
      },
      {
        status: 500,
      }
    );
  }
}
