'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface SentinelModalProps {
  agentName: string;
  onClose: () => void;
}

export function SentinelModal({ agentName, onClose }: SentinelModalProps) {
  const [form, setForm] = useState({
    walletAddress: '',
    entryPriceUsd: 3000,
    triggerDropPct: 5,
    safeAddress: '',
    maxRiskScore: 40,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    workflowId: string;
    triggerPrice: number;
  } | null>(null);
  const [error, setError] = useState('');

  const triggerPrice = form.entryPriceUsd * (1 - form.triggerDropPct / 100);

  async function activate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/sentinel/${agentName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as {
        workflowId?: string;
        triggerPrice?: number;
        error?: string;
      };
      if (data.error || !data.workflowId) {
        throw new Error(data.error ?? 'No workflow ID returned');
      }
      setResult({
        workflowId: data.workflowId,
        triggerPrice: data.triggerPrice ?? triggerPrice,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-modal shadow-modal w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[19px] font-semibold text-apple-text">
              Activate DeFi Sentinel
            </h2>
            <p className="text-sm text-apple-sub mt-0.5">
              24/7 autonomous protection via KeeperHub
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-apple-sub hover:text-apple-text text-xl"
          >
            ✕
          </button>
        </div>

        {result ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 space-y-1">
              <p className="font-semibold">✓ Sentinel Activated</p>
              <p>
                Workflow:{' '}
                <code className="font-mono text-xs">{result.workflowId}</code>
              </p>
              <p>
                Trigger: <strong>${result.triggerPrice.toFixed(2)} USDC/ETH</strong>
              </p>
            </div>
            <a
              href={`https://app.keeperhub.dev/workflows/${result.workflowId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="w-full">
                View in KeeperHub →
              </Button>
            </a>
            <Button onClick={onClose} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Watch address', key: 'walletAddress', type: 'text', placeholder: '0x...' },
              { label: 'Entry price (USDC/ETH)', key: 'entryPriceUsd', type: 'number', placeholder: '3000' },
              { label: 'Trigger at drop (%)', key: 'triggerDropPct', type: 'number', placeholder: '5' },
              { label: 'Safe address', key: 'safeAddress', type: 'text', placeholder: '0x...' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-apple-sub mb-1 block">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={String(form[key as keyof typeof form])}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]:
                        type === 'number'
                          ? Number(e.target.value)
                          : e.target.value,
                    }))
                  }
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                />
              </div>
            ))}

            <div className="rounded-xl bg-apple-gray p-3 text-xs text-apple-sub">
              Triggers when ETH drops to{' '}
              <strong>${triggerPrice.toFixed(2)}</strong> USDC
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={activate}
                disabled={
                  loading || !form.walletAddress || !form.safeAddress
                }
                className="flex-1"
              >
                {loading ? 'Activating…' : 'Activate →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
