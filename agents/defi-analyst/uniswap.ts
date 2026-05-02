// agents/defi-analyst/uniswap.ts
import { GraphQLClient, gql } from 'graphql-request';
import { ethers } from 'ethers';

// Uniswap V3 Subgraph on The Graph (Base mainnet)
// Note: In production, use an API key. For hackathon demo, public endpoint.
const UNISWAP_SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-base';

const TOP_POOLS_QUERY = gql`
  query TopPools {
    pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      token0 { symbol decimals }
      token1 { symbol decimals }
      feeTier
      totalValueLockedUSD
      volumeUSD
      token0Price
      token1Price
    }
  }
`;

const POOL_BY_ID_QUERY = gql`
  query GetPool($id: String!) {
    pool(id: $id) {
      id
      token0 { symbol decimals }
      token1 { symbol decimals }
      feeTier
      liquidity
      sqrtPrice
      tick
      token0Price
      token1Price
      volumeUSD
      totalValueLockedUSD
    }
  }
`;

export interface PoolData {
  id: string;
  pair: string;
  feeTier: string;
  liquidity: string;
  tvlUSD: string;
  volumeUSD: string;
  token0Price: string;
  token1Price: string;
}

export async function getTopPools(): Promise<PoolData[]> {
  const client = new GraphQLClient(UNISWAP_SUBGRAPH_URL);
  const data = await client.request<{ pools: any[] }>(TOP_POOLS_QUERY);
  return data.pools.map((p): PoolData => ({
    id: p.id,
    pair: `${p.token0.symbol}/${p.token1.symbol}`,
    feeTier: `${parseInt(p.feeTier) / 10000}%`,
    liquidity: '0',
    tvlUSD: Number(p.totalValueLockedUSD).toFixed(0),
    volumeUSD: Number(p.volumeUSD).toFixed(0),
    token0Price: p.token0Price,
    token1Price: p.token1Price,
  }));
}

export async function getPool(poolId: string): Promise<PoolData | null> {
  const client = new GraphQLClient(UNISWAP_SUBGRAPH_URL);
  const data = await client.request<{ pool: any }>(POOL_BY_ID_QUERY, {
    id: poolId.toLowerCase(),
  });
  const p = data.pool;
  if (!p) return null;
  return {
    id: p.id,
    pair: `${p.token0.symbol}/${p.token1.symbol}`,
    feeTier: `${parseInt(p.feeTier) / 10000}%`,
    liquidity: p.liquidity,
    tvlUSD: Number(p.totalValueLockedUSD).toFixed(0),
    volumeUSD: Number(p.volumeUSD).toFixed(0),
    token0Price: p.token0Price,
    token1Price: p.token1Price,
  };
}

// Uniswap V3 QuoterV2 on Base mainnet
const QUOTER_V2_ADDRESS = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a';

export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountInWei: string,
  fee: number,
  rpcUrl: string,
): Promise<{ amountOut: string; gasEstimate: string }> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Use staticCall to simulate the swap without spending gas
  const quoter = new ethers.Contract(
    QUOTER_V2_ADDRESS,
    [
      'function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
    ],
    provider,
  );

  const result = await quoter.quoteExactInputSingle.staticCall({
    tokenIn,
    tokenOut,
    amountIn: amountInWei,
    fee,
    sqrtPriceLimitX96: 0,
  });

  return {
    amountOut: result.amountOut.toString(),
    gasEstimate: result.gasEstimate.toString(),
  };
}

// Well-known token addresses on Base mainnet
export const BASE_TOKENS = {
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  cbETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
} as const;
