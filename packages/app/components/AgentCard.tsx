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

export function AgentCard({ agent }: { agent: Agent }) {
  const [copied, setCopied] = useState(false);

  async function installAgent() {
    const config = {
      mcpServers: { [agent.name]: { url: agent.endpoint } },
    };
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
          <p className="text-xs text-gray-400 font-mono">{agent.fullName}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          agent.availability === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {agent.availability}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>⭐ {agent.reputation}</span>
        <span>📞 {agent.callCount} calls</span>
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{agent.category}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-sm">{agent.price}/call</span>
        <button
          onClick={installAgent}
          disabled={!agent.endpoint}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? '✓ Copied!' : 'Install →'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 font-mono truncate">Model: {agent.model}</p>
    </div>
  );
}
