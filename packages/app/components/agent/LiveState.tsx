'use client';
import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

interface LiveStateProps {
  ensName: string;
}

export function LiveState({ ensName }: LiveStateProps) {
  const [state, setState]   = useState<string>('idle');
  const [proof, setProof]   = useState<string | null>(null);
  const [keeper, setKeeper] = useState<string | null>(null);

  useEffect(() => {
    const client = createPublicClient({
      chain: sepolia,
      transport: http('https://rpc.ankr.com/eth_sepolia'),
    });

    async function poll() {
      const [s, p, k] = await Promise.allSettled([
        client.getEnsText({ name: normalize(ensName), key: 'agentmcp.state' }),
        client.getEnsText({ name: normalize(ensName), key: 'agentmcp.proof' }),
        client.getEnsText({ name: normalize(ensName), key: 'agentmcp.keeper' }),
      ]).then((rs) => rs.map((r) => (r.status === 'fulfilled' ? r.value ?? '' : '')));
      setState(s || 'idle');
      setProof(p || null);
      setKeeper(k || null);
    }

    poll();
    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, [ensName]);

  const isProcessing = state.startsWith('processing:');
  const taskLabel = isProcessing ? state.replace('processing:', '').slice(0, 60) : null;

  return (
    <div className="rounded-[14px] border border-gray-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isProcessing ? 'bg-apple-blue animate-pulse' : 'bg-apple-green'
          }`}
        />
        <span className="text-sm font-medium text-apple-text">
          {isProcessing ? 'Processing' : 'Idle'}
        </span>
        {taskLabel && (
          <span className="text-xs text-apple-sub truncate max-w-[200px]">
            {taskLabel}
          </span>
        )}
      </div>

      {proof && (
        <div className="text-xs text-apple-sub font-mono flex items-center gap-2">
          <span className="text-apple-blue">✓ 0G Proof</span>
          <span className="truncate">{proof.slice(0, 20)}…</span>
        </div>
      )}

      {keeper && (
        <div className="text-xs text-apple-sub flex items-center gap-2">
          <span className="text-orange-500">⚡ Sentinel</span>
          <a
            href={`https://app.keeperhub.dev/workflows/${keeper}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-apple-blue hover:underline truncate"
          >
            {keeper.slice(0, 16)}…
          </a>
        </div>
      )}
    </div>
  );
}
