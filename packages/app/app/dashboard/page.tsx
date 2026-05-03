'use client';
import { useActiveAccount } from 'thirdweb/react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="text-3xl font-semibold text-apple-text">Dashboard</h1>
        <p className="text-apple-sub">
          Connect your wallet to see your agents&apos; earnings and sentinels.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-apple-text">Dashboard</h1>
        <p className="text-apple-sub text-sm mt-1 font-mono">
          {account.address}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: '—', sub: 'USDC all-time' },
          { label: 'Active Sentinels', value: '—', sub: 'KeeperHub workflows' },
          { label: 'Registered Agents', value: '—', sub: 'on agentmcp.eth' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-card shadow-card p-5">
            <p className="text-2xl font-semibold text-apple-text">{value}</p>
            <p className="text-sm font-medium text-apple-text mt-0.5">
              {label}
            </p>
            <p className="text-xs text-apple-sub">{sub}</p>
          </div>
        ))}
      </div>

      {/* Your agents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-apple-text">
            Your Agents
          </h2>
          <Link href="/wrap">
            <Button size="sm">+ Wrap New Agent</Button>
          </Link>
        </div>
        <div className="bg-white rounded-card shadow-card divide-y divide-gray-100">
          {['defi-analyst', 'research', 'code-review'].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-apple-text">
                  {name}.agentmcp.eth
                </p>
                <p className="text-xs text-apple-sub">
                  View proof chain and live state
                </p>
              </div>
              <Link href={`/agent/${name}`}>
                <Button variant="secondary" size="sm">
                  View →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Active sentinels */}
      <div>
        <h2 className="text-lg font-semibold text-apple-text mb-4">
          Active Sentinels
        </h2>
        <div className="bg-white rounded-card shadow-card p-6 text-center text-sm text-apple-sub">
          No sentinels active yet.{' '}
          <Link
            href="/agent/defi-analyst"
            className="text-apple-blue hover:underline"
          >
            Activate one on defi-analyst →
          </Link>
        </div>
      </div>
    </div>
  );
}
