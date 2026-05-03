import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

const AGENTS = ['defi-analyst', 'research', 'code-review'];
const PARENT = 'agentmcp.eth';

export async function GET() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(
      process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
    ),
  });

  const agents = await Promise.all(
    AGENTS.map(async (name) => {
      const fullName = `${name}.${PARENT}`;
      const keys = [
        'url', 'agentmcp.price', 'agentmcp.model',
        'agentmcp.reputation', 'agentmcp.state',
        'agentmcp.proof', 'agentmcp.keeper',
      ];
      const results = await Promise.allSettled(
        keys.map((key) =>
          publicClient.getEnsText({ name: normalize(fullName), key }),
        ),
      );
      const [url, price, model, reputation, state, proof, keeper] =
        results.map((r) => (r.status === 'fulfilled' ? r.value ?? '' : ''));

      return {
        name,
        ens: fullName,
        mcp_endpoint: url || '',
        price_usdc: price?.split(' ')[0] || '0.02',
        model: model || '0G Compute / DeepSeek',
        reputation: reputation || '5.0',
        live_state: state || 'idle',
        last_proof: proof || null,
        keeper_workflow: keeper || null,
        tools: ['call_agent', 'get_capabilities'],
      };
    }),
  );

  return NextResponse.json(
    {
      schema: 'agentmcp/v1',
      registry: PARENT,
      agents,
      generated: new Date().toISOString(),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    },
  );
}
