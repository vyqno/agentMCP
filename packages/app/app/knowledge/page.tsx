import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';
import { Badge } from '../../components/ui/Badge';

const AGENTS = ['defi-analyst', 'research', 'code-review'];
const PARENT = 'agentmcp.eth';

interface KnowledgeNode {
  name: string;
  fullName: string;
  topic: string | null;
  timestamp: string | null;
  rootHash: string | null;
}

async function getKnowledgeGraph(): Promise<KnowledgeNode[]> {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(
      process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
    ),
  });

  return Promise.all(
    AGENTS.map(async (name) => {
      const fullName = `${name}.${PARENT}`;
      const raw = await publicClient
        .getEnsText({
          name: normalize(fullName),
          key: 'agentmcp.sharedInsight',
        })
        .catch(() => null);

      if (!raw) {
        return { name, fullName, topic: null, timestamp: null, rootHash: null };
      }

      try {
        const parsed = JSON.parse(raw) as {
          rootHash: string;
          topic: string;
          ts: string;
        };
        return {
          name,
          fullName,
          topic: parsed.topic,
          timestamp: parsed.ts,
          rootHash: parsed.rootHash,
        };
      } catch {
        return { name, fullName, topic: null, timestamp: null, rootHash: null };
      }
    }),
  );
}

export default async function KnowledgePage() {
  const nodes = await getKnowledgeGraph();
  const withInsights = nodes.filter((n) => n.topic);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-apple-text">
          Knowledge Graph
        </h1>
        <p className="text-apple-sub mt-2">
          Agents share insights via 0G Storage. Root hashes are published to ENS
          text records. Any agent can consume another agent&apos;s knowledge —
          decentralized, permanent, verifiable.
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <strong>How it works:</strong>{' '}
        <code className="font-mono text-xs">research.agentmcp.eth</code> uploads
        an insight to 0G Storage → writes root hash to{' '}
        <code className="font-mono text-xs">agentmcp.sharedInsight</code> ENS
        text record →{' '}
        <code className="font-mono text-xs">defi-analyst.agentmcp.eth</code>{' '}
        reads the ENS record → downloads from 0G → enriches its analysis.
      </div>

      {withInsights.length === 0 ? (
        <div className="text-center py-12 text-apple-sub space-y-2">
          <p className="text-lg">No shared insights yet</p>
          <p className="text-sm">
            Call the research agent to generate the first shared insight.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {withInsights.map((node) => (
            <div
              key={node.name}
              className="bg-white rounded-card shadow-card p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Badge variant="verified">0G Storage</Badge>
                <span className="text-sm font-medium text-apple-text">
                  {node.name}.agentmcp.eth
                </span>
              </div>
              <p className="text-sm text-apple-text">{node.topic}</p>
              <div className="text-xs text-apple-sub font-mono flex gap-4">
                {node.rootHash && (
                  <span>Root: {node.rootHash.slice(0, 20)}…</span>
                )}
                {node.timestamp && (
                  <span>{new Date(node.timestamp).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual graph hint */}
      <div className="rounded-card bg-apple-gray p-6">
        <p className="text-sm font-medium text-apple-text mb-4">
          Agent Knowledge Flow
        </p>
        <div className="flex items-center justify-center gap-8 py-4 text-sm text-apple-sub">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-apple-blue flex items-center justify-center mx-auto text-xs font-mono font-bold">
              R
            </div>
            <p className="mt-1 text-xs">research</p>
            <p className="text-xs text-apple-sub">publishes</p>
          </div>
          <div className="flex-1 h-px bg-apple-blue relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-apple-gray px-1 text-apple-blue">
              0G insight
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto text-xs font-mono font-bold">
              D
            </div>
            <p className="mt-1 text-xs">defi-analyst</p>
            <p className="text-xs text-apple-sub">consumes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
