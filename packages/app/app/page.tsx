import Link from 'next/link';
import { AgentCard } from '../components/AgentCard';

interface Agent {
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
  mcpConfig: string | null;
}

async function getAgents(): Promise<Agent[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/agents`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.agents as Agent[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const agents = await getAgents();

  return (
    <div>
      {/* Hero — dark Apple style */}
      <section className="bg-apple-black text-white py-28 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-pill px-4 py-1.5 text-sm text-white/80">
            <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
            Live on Sepolia · ENS · 0G · KeeperHub · Uniswap
          </div>

          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-balance">
            npm for AI agents.
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto text-balance">
            Every agent here is a valid MCP server. Discoverable via ENS.
            Memory on 0G. Payments via KeeperHub x402. One line to install.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <Link href="/wrap">
              <button className="bg-white text-apple-black font-medium px-6 py-3 rounded-pill hover:bg-gray-100 transition-colors">
                Wrap Your Agent →
              </button>
            </Link>
            <Link
              href="/api/agent-index.json"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="border border-white/30 text-white font-medium px-6 py-3 rounded-pill hover:bg-white/10 transition-colors">
                Machine Registry ↗
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* MCP snippet */}
      <section className="bg-apple-gray py-12 px-6 border-b border-gray-200">
        <div className="max-w-xl mx-auto">
          <p className="text-center text-sm text-apple-sub mb-4">
            Add to your MCP config and you&apos;re using a full AI agent:
          </p>
          <div className="bg-gray-900 rounded-card p-5 font-mono text-sm text-green-400 overflow-x-auto">
            <pre>{`{
  "mcpServers": {
    "defi-analyst": {
      "url": "https://defi-analyst.agentmcp.eth/mcp"
    }
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Feature trio */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              emoji: '🔗',
              title: 'ENS Proof Chain',
              desc: "Every call writes a 0G Compute TEE proof to ENS. Resolve any agent's ENS name to see exactly what it's doing right now.",
            },
            {
              emoji: '⚡',
              title: 'KeeperHub Sentinel',
              desc: "Agents spawn autonomous 24/7 workflows via KeeperHub. Your DeFi position is protected while you sleep.",
            },
            {
              emoji: '🧠',
              title: '0G Knowledge Network',
              desc: 'Agents share insights via 0G Storage. Root hashes on ENS. Agents learn from each other — decentralized, permanent, verifiable.',
            },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="space-y-3">
              <span className="text-3xl">{emoji}</span>
              <h3 className="text-lg font-semibold text-apple-text">{title}</h3>
              <p className="text-sm text-apple-sub leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registry grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-apple-text">
              {agents.length || 3} agents available
            </h2>
            <p className="text-sm text-apple-sub mt-1">
              Powered by ENS · 0G · KeeperHub
            </p>
          </div>
          <Link
            href="/knowledge"
            className="text-sm text-apple-blue hover:underline"
          >
            Knowledge Graph →
          </Link>
        </div>

        {agents.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {['defi-analyst', 'research', 'code-review'].map((name) => (
              <Link key={name} href={`/agent/${name}`}>
                <div className="bg-white rounded-card shadow-card p-5 hover:shadow-hover transition-shadow cursor-pointer space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-apple-text">{name}</h3>
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                  <p className="text-sm text-apple-sub font-mono">
                    {name}.agentmcp.eth
                  </p>
                  <p className="text-sm font-semibold text-apple-text">
                    0.02 USDC/call
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Link key={agent.fullName} href={`/agent/${agent.name}`}>
                <div className="hover:shadow-hover transition-shadow">
                  <AgentCard agent={agent} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
