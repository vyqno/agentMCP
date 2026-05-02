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
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/agents`, { next: { revalidate: 60 } });
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
    <main className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AgentMCP</h1>
            <p className="text-sm text-gray-500">Agents as MCP servers. One line to install.</p>
          </div>
        </div>
      </header>

      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">npm for AI Agents</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Every agent here is a valid MCP server. Click Install, paste one line into
            your Claude/Cursor config, and you have a full AI agent with persistent memory
            and micropayments built in.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 max-w-lg mx-auto text-left font-mono text-sm text-green-400">
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

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">{agents.length} agents available</h3>
          <span className="text-sm text-gray-400">Powered by ENS · 0G · KeeperHub</span>
        </div>
        {agents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Loading agents from ENS...</p>
            <p className="text-sm">Set SEPOLIA_RPC_URL to connect to ENS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.fullName} agent={agent} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
          Discovery via ENS · Sessions on 0G Storage · Inference on 0G Compute · Payments via KeeperHub x402
        </div>
      </footer>
    </main>
  );
}
