'use client';
import { useState } from 'react';

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

const CATEGORY_COLORS: Record<string, string> = {
  defi:              'from-blue-500 to-sky-400',
  research:          'from-violet-500 to-purple-400',
  'developer-tools': 'from-emerald-500 to-green-400',
  general:           'from-gray-500 to-gray-400',
  data:              'from-orange-500 to-amber-400',
  creative:          'from-pink-500 to-rose-400',
};

export function AgentCard({ agent }: { agent: Agent }) {
  const [copied, setCopied] = useState(false);

  async function installAgent(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const config = {
      mcpServers: { [agent.name]: { url: agent.endpoint } },
    };
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const gradient = CATEGORY_COLORS[agent.category] ?? CATEGORY_COLORS.general;
  const isOnline = agent.availability === 'online';

  return (
    <div className="group bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-200 overflow-hidden">
      {/* Gradient top bar */}
      <div className={`h-[3px] bg-gradient-to-r ${gradient}`} />

      <div className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-apple-text text-[15px] truncate">{agent.name}</h3>
            <p className="text-xs text-apple-sub font-mono mt-0.5 truncate">{agent.fullName}</p>
          </div>
          <span className={`shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
            isOnline
              ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {agent.availability}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-apple-sub leading-relaxed line-clamp-2">
          {agent.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-apple-sub">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            {agent.reputation}
          </span>
          <span className="text-gray-300">·</span>
          <span>{agent.callCount} calls</span>
          <span className="text-gray-300">·</span>
          <span className="bg-apple-gray text-apple-sub px-2 py-0.5 rounded-full capitalize">
            {agent.category}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-sm font-semibold text-apple-text">{agent.price}</span>
            <span className="text-xs text-apple-sub">/call</span>
          </div>
          <button
            type="button"
            onClick={installAgent}
            disabled={!agent.endpoint}
            className="text-sm font-medium px-4 py-1.5 rounded-full bg-apple-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
          >
            {copied ? '✓ Copied' : 'Install →'}
          </button>
        </div>

        {/* Model tag */}
        <p className="text-[11px] text-apple-sub/60 font-mono truncate">{agent.model}</p>
      </div>
    </div>
  );
}
