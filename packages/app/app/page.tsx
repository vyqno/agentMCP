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
    const res = await fetch(`${baseUrl}/api/agents`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.agents as Agent[];
  } catch {
    return [];
  }
}

const FALLBACK_AGENTS = [
  {
    name: 'defi-analyst',
    price: '0.02 USDC',
    desc: 'Uniswap V3 pool analysis, swap quotes, and autonomous DeFi protection via KeeperHub Sentinel.',
    tags: ['DeFi', 'Uniswap', 'KeeperHub'],
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: 'research',
    price: '0.01 USDC',
    desc: 'Deep research with persistent memory via 0G Storage. Shares insights across the agent network.',
    tags: ['Research', '0G Memory', 'Knowledge'],
    color: 'from-violet-600 to-violet-400',
  },
  {
    name: 'code-review',
    price: '0.03 USDC',
    desc: 'Code review with persistent history. Remembers every review across sessions via 0G Storage.',
    tags: ['Dev Tools', '0G Memory', 'Security'],
    color: 'from-emerald-600 to-emerald-400',
  },
];

export default async function HomePage() {
  const agents = await getAgents();

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-[#000] text-white overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center gap-8">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-pill px-4 py-1.5 text-sm text-white/70 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ETHGlobal Open Agents 2026 &nbsp;·&nbsp; ENS &nbsp;·&nbsp; 0G &nbsp;·&nbsp; KeeperHub &nbsp;·&nbsp; Uniswap
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-1 text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
            <span className="gradient-text">npm</span>
            <span className="text-white"> for AI agents.</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up-2 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
            Wrap any agent as an MCP server in one command.
            Discoverable via ENS. Memory on 0G. Payments via KeeperHub x402.
            <span className="text-white/90 font-medium"> One line to install.</span>
          </p>

          {/* CTA row */}
          <div className="animate-fade-up-3 flex flex-wrap items-center justify-center gap-3">
            <Link href="/wrap">
              <button className="group relative bg-white text-black font-semibold px-7 py-3 rounded-pill hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Wrap Your Agent
                <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </Link>
            <Link href="/agent/defi-analyst">
              <button className="border border-white/20 text-white font-medium px-7 py-3 rounded-pill hover:bg-white/10 transition-all duration-200 hover:border-white/40">
                Live Demo ↗
              </button>
            </Link>
            <Link href="/api/agent-index.json" target="_blank" rel="noopener noreferrer">
              <button className="text-white/50 text-sm px-4 py-3 hover:text-white/80 transition-colors">
                Machine Registry ↗
              </button>
            </Link>
          </div>

          {/* Live terminal */}
          <div className="animate-fade-up-3 w-full max-w-2xl mt-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-auto text-xs text-white/20 font-mono">mcp-config.json</span>
              </div>
              {/* Code */}
              <div className="px-5 py-4 font-mono text-sm text-left">
                <span className="text-white/30">{'{'}</span><br />
                <span className="text-white/30 ml-4">&quot;mcpServers&quot;: {'{'}</span><br />
                <span className="ml-8 text-emerald-400">&quot;defi-analyst&quot;</span>
                <span className="text-white/30">: {'{'}</span><br />
                <span className="ml-12 text-sky-400">&quot;url&quot;</span>
                <span className="text-white/30">: </span>
                <span className="text-amber-300">&quot;https://defi-analyst.agentmcp.eth/mcp&quot;</span><br />
                <span className="ml-8 text-white/30">{'}'}</span><br />
                <span className="ml-4 text-white/30">{'}'}</span><br />
                <span className="text-white/30">{'}'}</span>
                <span className="animate-blink ml-1 text-white">▊</span>
              </div>
              {/* Status bar */}
              <div className="border-t border-white/5 px-5 py-2.5 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3 agents live
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/40 font-mono">agentmcp.state = &quot;idle&quot;</span>
                <span className="text-white/20">·</span>
                <span className="text-sky-400/70">0G Compute · TEE verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Agents Live', value: '3' },
            { label: 'Prize Target', value: '$24,750' },
            { label: 'Sponsor Tracks', value: '5' },
            { label: 'Lines of SDK', value: '800+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-apple-sub uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-center text-3xl font-semibold text-apple-text mb-14">
            One call. Permanent autonomous protection.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '🔗',
                title: 'ENS Proof Chain',
                desc: 'Every call writes a 0G Compute TEE proof to your ENS text records in real-time. The ENS name IS the agent\'s live API spec — state, proof, reputation, all queryable.',
                accent: 'border-blue-200 bg-blue-50/50',
                badge: 'text-blue-600',
              },
              {
                step: '02',
                icon: '⚡',
                title: 'KeeperHub Sentinel',
                desc: 'Activate once. KeeperHub spawns an autonomous workflow that watches your WETH position every 5 minutes and hedges if ETH drops your threshold. 24/7. While you sleep.',
                accent: 'border-orange-200 bg-orange-50/50',
                badge: 'text-orange-600',
              },
              {
                step: '03',
                icon: '🧠',
                title: '0G Knowledge Network',
                desc: 'Agents upload insights to 0G Storage, write root hashes to ENS. Other agents read each other\'s records and download the knowledge. Decentralized agent-to-agent learning.',
                accent: 'border-violet-200 bg-violet-50/50',
                badge: 'text-violet-600',
              },
            ].map(({ step, icon, title, desc, accent, badge }) => (
              <div key={step} className={`rounded-card border p-6 space-y-4 ${accent}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{icon}</span>
                  <span className={`text-xs font-mono font-bold ${badge}`}>{step}</span>
                </div>
                <h3 className="text-base font-semibold text-apple-text">{title}</h3>
                <p className="text-sm text-apple-sub leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENT REGISTRY ── */}
      <section className="bg-apple-gray py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-apple-sub uppercase tracking-widest mb-2">Live Registry</p>
              <h2 className="text-3xl font-semibold text-apple-text">
                {agents.length || 3} agents available
              </h2>
              <p className="text-sm text-apple-sub mt-1">
                Powered by ENS · 0G · KeeperHub
              </p>
            </div>
            <Link href="/knowledge" className="hidden md:block text-sm text-apple-blue hover:underline">
              Knowledge Graph →
            </Link>
          </div>

          {agents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Link key={agent.fullName} href={`/agent/${agent.name}`}>
                  <div className="hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5">
                    <AgentCard agent={agent} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {FALLBACK_AGENTS.map(({ name, price, desc, tags, color }) => (
                <Link key={name} href={`/agent/${name}`}>
                  <div className="group bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5 overflow-hidden cursor-pointer">
                    {/* Gradient top bar */}
                    <div className={`h-1 bg-gradient-to-r ${color}`} />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-apple-text">{name}</h3>
                          <p className="text-xs text-apple-sub font-mono mt-0.5">{name}.agentmcp.eth</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-apple-sub bg-apple-gray px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          offline
                        </span>
                      </div>
                      <p className="text-sm text-apple-sub leading-relaxed line-clamp-2">{desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <span key={t} className="text-xs bg-apple-gray text-apple-sub px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-semibold text-apple-text">{price}/call</span>
                        <span className="text-xs text-apple-blue opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TECH STACK STRIP ── */}
      <section className="bg-white border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-apple-sub uppercase tracking-widest mb-6">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-apple-sub">
            {[
              { label: '0G Labs', sub: 'Storage + Compute + TEE' },
              { label: 'KeeperHub', sub: 'x402 + Sentinel workflows' },
              { label: 'ENS', sub: 'Identity + Proof chain' },
              { label: 'Uniswap V3', sub: 'Pool data + QuoterV2' },
              { label: 'thirdweb', sub: 'Embedded wallets' },
              { label: 'MCP Protocol', sub: 'StreamableHTTP' },
            ].map(({ label, sub }) => (
              <div key={label} className="text-center">
                <p className="font-medium text-apple-text">{label}</p>
                <p className="text-xs text-apple-sub">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
