'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { SentinelModal } from './SentinelModal';

interface SentinelSectionProps {
  agentName: string;
}

export function SentinelSection({ agentName }: SentinelSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-card border border-gray-100 bg-white p-5 space-y-3">
      <h3 className="text-sm font-semibold text-apple-text">DeFi Sentinel</h3>
      <p className="text-sm text-apple-sub">
        Autonomous 24/7 protection. KeeperHub watches your WETH position and
        executes a protective hedge if ETH drops your threshold — even while
        you sleep.
      </p>
      <div className="flex items-center gap-2 text-xs text-apple-sub">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        <span>
          KeeperHub · Every action on-chain · Risk-scored before execution
        </span>
      </div>
      <Button size="sm" onClick={() => setOpen(true)}>
        Activate Sentinel →
      </Button>
      {open && (
        <SentinelModal agentName={agentName} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
