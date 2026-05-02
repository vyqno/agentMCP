// agents/code-review/serve.ts
import 'dotenv/config';
import { wrapAsAgent } from '@agentmcp/sdk';
import { codeReviewHandler } from './agent.js';

const agent = wrapAsAgent({
  name: 'code-review',
  description: 'AI code reviewer with persistent review history via 0G Storage. Powered by 0G Compute.',
  handler: codeReviewHandler,
  pricing: {
    amount: process.env.AGENT_PRICE ?? '0.03',
    currency: 'USDC',
    recipientAddress: (process.env.RECIPIENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chainId: parseInt(process.env.CHAIN_ID ?? '11155111'),
  },
  ens: process.env.ENS_PRIVATE_KEY ? {
    parentName: 'agentmcp.eth',
    privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
    rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
    category: 'developer-tools',
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

await agent.start(parseInt(process.env.CODE_REVIEW_PORT ?? '3003'));
