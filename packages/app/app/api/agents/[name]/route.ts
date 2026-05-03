import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

const PARENT = 'agentmcp.eth';

const ALL_KEYS = [
  'description','url','keywords',
  'agentmcp.price','agentmcp.model','agentmcp.reputation',
  'agentmcp.calls','agentmcp.status','agentmcp.updatedAt',
  'agentmcp.state','agentmcp.proof','agentmcp.keeper',
  'agentmcp.sharedInsight',
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const fullName = `${name}.${PARENT}`;
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia'),
  });

  const results = await Promise.allSettled(
    ALL_KEYS.map((key) =>
      publicClient.getEnsText({ name: normalize(fullName), key }),
    ),
  );

  const values = results.map((r) =>
    r.status === 'fulfilled' ? (r.value ?? '') : '',
  );

  const [desc, url, category, price, model, reputation, calls, status,
         updatedAt, state, proof, keeper, sharedInsight] = values;

  return NextResponse.json({
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
    liveState: state || 'idle',
    lastProof: proof || null,
    keeperWorkflowId: keeper || null,
    sharedInsight: sharedInsight || null,
  });
}
