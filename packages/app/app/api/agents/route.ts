// packages/app/app/api/agents/route.ts
import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

const KNOWN_AGENTS = ['defi-analyst', 'research', 'code-review'];
const PARENT = 'agentmcp.eth';

const TEXT_KEYS = [
  'description', 'url', 'keywords',
  'agentmcp.price', 'agentmcp.model', 'agentmcp.reputation',
  'agentmcp.calls', 'agentmcp.status', 'agentmcp.updatedAt',
];

export async function GET() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia'),
  });

  const agents = await Promise.all(
    KNOWN_AGENTS.map(async (name) => {
      const fullName = `${name}.${PARENT}`;
      const normalizedName = normalize(fullName);

      const textResults = await Promise.allSettled(
        TEXT_KEYS.map((key) =>
          publicClient.getEnsText({ name: normalizedName, key }),
        ),
      );

      const [desc, url, category, price, model, reputation, calls, status, updatedAt] =
        textResults.map((r) => (r.status === 'fulfilled' ? r.value ?? '' : ''));

      return {
        name,
        fullName,
        description: desc || `The ${name} agent`,
        endpoint: url || '',
        category: category || 'general',
        price: price || '0.02 USDC',
        model: model || '0G Compute / DeepSeek',
        reputation: reputation || '5.0',
        callCount: calls || '0',
        availability: (status || 'offline') as 'online' | 'offline',
        lastUpdated: updatedAt || new Date().toISOString(),
        mcpConfig: url
          ? JSON.stringify({ mcpServers: { [name]: { url } } }, null, 2)
          : null,
      };
    }),
  );

  return NextResponse.json({ agents });
}
