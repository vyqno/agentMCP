// agents/research/serve.ts
import 'dotenv/config';
import { wrapAsAgent } from '@agentmcp/sdk';
import { researchHandler } from './agent.js';

const agent = wrapAsAgent({
  name: 'research',
  description: 'Deep research agent with persistent memory via 0G Storage. Powered by 0G Compute (DeepSeek).',
  handler: researchHandler,
  pricing: {
    amount: process.env.AGENT_PRICE ?? '0.01',
    currency: 'USDC',
    recipientAddress: (process.env.RECIPIENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chainId: parseInt(process.env.CHAIN_ID ?? '11155111'),
  },
  ens: process.env.ENS_PRIVATE_KEY ? {
    parentName: 'agentmcp.eth',
    privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
    rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
    category: 'research',
  } : undefined,
  storage: process.env.STORAGE_PRIVATE_KEY ? {
    indexerUrl: process.env.STORAGE_INDEXER ?? 'https://indexer-storage-testnet-turbo.0g.ai',
    rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
    privateKey: process.env.STORAGE_PRIVATE_KEY,
  } : undefined,
  compute: process.env.COMPUTE_PRIVATE_KEY ? {
    rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
    privateKey: process.env.COMPUTE_PRIVATE_KEY,
  } : undefined,
});

await agent.start(parseInt(process.env.RESEARCH_PORT ?? '3002'));
