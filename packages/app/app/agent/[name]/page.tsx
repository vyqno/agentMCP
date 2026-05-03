import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LiveState } from '../../../components/agent/LiveState';
import { TryItWidget } from '../../../components/agent/TryItWidget';
import { SentinelSection } from '../../../components/agent/SentinelSection';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

const KNOWN = ['defi-analyst', 'research', 'code-review'];
const PARENT = 'agentmcp.eth';

interface AgentData {
  name: string;
  fullName: string;
  description: string;
  endpoint: string;
  category: string;
  price: string;
  model: string;
  reputation: string;
  callCount: string;
  availability: 'online' | 'offline';
  lastUpdated: string;
  liveState: string;
  lastProof: string | null;
  keeperWorkflowId: string | null;
}

async function getAgent(name: string): Promise<AgentData | null> {
  if (!KNOWN.includes(name)) return null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/agents/${name}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json() as AgentData;
  } catch {
    return null;
  }
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const agent = await getAgent(name);
  if (!agent) notFound();

  const fullName = `${name}.${PARENT}`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-semibold text-apple-text tracking-tight">
              {agent.name}
            </h1>
            <Badge variant={agent.availability}>{agent.availability}</Badge>
            {agent.lastProof && (
              <Badge variant="verified">0G Verified</Badge>
            )}
          </div>
          <p className="text-apple-sub font-mono text-sm">{fullName}</p>
          <p className="text-apple-text mt-3 max-w-xl">{agent.description}</p>
        </div>
        <div className="text-right space-y-2 flex-shrink-0">
          <p className="text-2xl font-semibold text-apple-text">{agent.price}/call</p>
          <Link href={`/agent/${name}/proofs`}>
            <Button variant="secondary" size="sm">Proof Chain →</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reputation', value: `⭐ ${agent.reputation}` },
          { label: 'Total Calls', value: agent.callCount },
          { label: 'Category', value: agent.category },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-card p-4 shadow-card text-center">
            <p className="text-xl font-semibold text-apple-text">{value}</p>
            <p className="text-xs text-apple-sub mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Live state — polls ENS every 10s */}
      <div>
        <h2 className="text-sm font-semibold text-apple-sub uppercase tracking-wide mb-3">
          Live State
        </h2>
        <LiveState ensName={fullName} />
      </div>

      {/* Try It + Sentinel */}
      <div className="grid md:grid-cols-2 gap-6">
        <TryItWidget agentName={name} />
        {name === 'defi-analyst' && (
          <SentinelSection agentName={name} />
        )}
      </div>

      {/* Install snippet */}
      <div className="bg-gray-900 rounded-card p-6">
        <p className="text-white font-semibold mb-3 text-sm">Install this agent</p>
        <pre className="text-green-400 text-sm font-mono overflow-x-auto">
          {JSON.stringify(
            {
              mcpServers: {
                [name]: {
                  url: agent.endpoint || `http://localhost:3001/mcp`,
                },
              },
            },
            null,
            2,
          )}
        </pre>
      </div>

      {/* JSON-LD for AI agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: fullName,
            description: agent.description,
            url: agent.endpoint,
            offers: {
              '@type': 'Offer',
              price: agent.price.split(' ')[0],
              priceCurrency: 'USDC',
            },
          }),
        }}
      />
    </div>
  );
}
