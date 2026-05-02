// agents/defi-analyst/serve.ts
import 'dotenv/config';
import { wrapAsAgent } from '@agentmcp/sdk';
import { defiAnalystHandler } from './agent.js';

const agent = wrapAsAgent({
  name: 'defi-analyst',
  description:
    'Analyzes Uniswap V3 pools, provides swap quotes, and generates AI-powered DeFi insights ' +
    'using 0G Compute (DeepSeek). Remembers your query history across sessions via 0G Storage.',
  handler: defiAnalystHandler,
  pricing: {
    amount: process.env.AGENT_PRICE ?? '0.02',
    currency: 'USDC',
    recipientAddress: (process.env.RECIPIENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chainId: parseInt(process.env.CHAIN_ID ?? '11155111'),
  },
  ens: process.env.ENS_PRIVATE_KEY
    ? {
        parentName: 'agentmcp.eth',
        privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
        rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
        category: 'defi',
      }
    : undefined,
  storage: process.env.STORAGE_PRIVATE_KEY
    ? {
        indexerUrl: process.env.STORAGE_INDEXER ?? 'https://indexer-storage-testnet-turbo.0g.ai',
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: process.env.STORAGE_PRIVATE_KEY,
      }
    : undefined,
  compute: process.env.COMPUTE_PRIVATE_KEY
    ? {
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: process.env.COMPUTE_PRIVATE_KEY,
      }
    : undefined,
});

const PORT = parseInt(process.env.DEFI_ANALYST_PORT ?? '3001');
await agent.start(PORT);

console.log('\n📋 Add to your MCP config:');
console.log(JSON.stringify({
  mcpServers: {
    'defi-analyst': { url: `http://localhost:${PORT}/mcp` },
  },
}, null, 2));
