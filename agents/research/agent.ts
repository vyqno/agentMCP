// agents/research/agent.ts
import type { AgentHandler } from '@agentmcp/sdk';
import type { ZGInference } from '@agentmcp/sdk';

export const researchHandler: AgentHandler = async (input, session) => {
  const { task } = input;
  const compute = (session.memory as any).__compute as ZGInference | undefined;

  const pastResearch = (session.memory.pastResearch as Array<{ query: string; summary: string }>) ?? [];
  const memoryContext = pastResearch.length > 0
    ? `\n\nPrevious research: ${pastResearch.slice(0, 3).map((r) => `[${r.query}] ${r.summary}`).join(' | ')}`
    : '';

  let result: string;

  if (compute) {
    const response = await compute.chat([
      {
        role: 'system',
        content:
          'You are a deep research agent. Synthesize complex topics clearly. ' +
          'Always explain your reasoning. Be thorough but concise.' + memoryContext,
      },
      { role: 'user', content: task },
    ]);
    result = response.content;
  } else {
    result = `Research task: "${task}"\n\n0G Compute not configured. Set COMPUTE_PRIVATE_KEY to enable AI research.${memoryContext}`;
  }

  pastResearch.unshift({ query: task.slice(0, 80), summary: result.slice(0, 200) });
  session.memory.pastResearch = pastResearch.slice(0, 20);

  // Share significant insights with other agents via 0G Storage + ENS
  const storageKey = process.env.STORAGE_PRIVATE_KEY;
  if (storageKey && result.length > 100) {
    const { KnowledgeSharing } = await import('@agentmcp/sdk');
    const ks = new KnowledgeSharing(
      {
        indexerUrl: process.env.STORAGE_INDEXER ?? 'https://indexer-storage-testnet-turbo.0g.ai',
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: storageKey,
      },
      process.env.ENS_PRIVATE_KEY ? {
        parentName: 'agentmcp.eth',
        privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
        rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
      } : undefined,
    );
    ks.shareInsight('research', 'agentmcp.eth', {
      agentName: 'research',
      topic: task.slice(0, 60),
      content: result.slice(0, 500),
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  }

  return result;
};
