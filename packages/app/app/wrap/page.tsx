'use client';
import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { WizardShell } from '../../components/wrap/WizardShell';
import { Button } from '../../components/ui/Button';

interface WrapForm {
  name: string;
  description: string;
  category: string;
  price: string;
  currency: 'USDC' | 'ETH';
  chainId: number;
  useENS: boolean;
  use0GStorage: boolean;
  use0GCompute: boolean;
}

const STEPS = [
  {
    title: 'Name your agent',
    subtitle: "This becomes your agent's permanent ENS identity.",
  },
  {
    title: 'Set your price',
    subtitle: 'Charged on every call via KeeperHub x402.',
  },
  {
    title: 'Choose your stack',
    subtitle: 'Optional integrations for memory and AI.',
  },
  {
    title: 'Deploy',
    subtitle: 'Sign with your wallet to go live on ENS.',
  },
];

const CHAINS = [
  { id: 11155111, label: 'Sepolia (testnet)' },
  { id: 8453, label: 'Base' },
  { id: 84532, label: 'Base Sepolia (testnet)' },
  { id: 1, label: 'Ethereum Mainnet' },
];

export default function WrapPage() {
  const account = useActiveAccount();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WrapForm>({
    name: '',
    description: '',
    category: 'general',
    price: '0.02',
    currency: 'USDC',
    chainId: 11155111,
    useENS: true,
    use0GStorage: false,
    use0GCompute: false,
  });
  const [deploying, setDeploying] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  function up(patch: Partial<WrapForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function deploy() {
    setDeploying(true);
    // In production: call thirdweb writeContract to batch ENS setText calls
    await new Promise((r) => setTimeout(r, 1500));
    setDone(
      JSON.stringify(
        {
          mcpServers: {
            [form.name]: {
              url: `https://${form.name}.agentmcp.eth/mcp`,
            },
          },
        },
        null,
        2,
      ),
    );
    setDeploying(false);
  }

  const dailyRevenue = (
    parseFloat(form.price || '0') *
    100 *
    0.98
  ).toFixed(2);

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="text-3xl font-semibold text-apple-text">
          {form.name}.agentmcp.eth is live
        </h1>
        <p className="text-apple-sub">
          Your agent is discoverable via ENS. Add this to your MCP config:
        </p>
        <pre className="bg-gray-900 text-green-400 rounded-card p-5 text-sm font-mono overflow-x-auto text-left">
          {done}
        </pre>
        <Button
          onClick={() => {
            setDone(null);
            setStep(1);
            setForm({
              name: '',
              description: '',
              category: 'general',
              price: '0.02',
              currency: 'USDC',
              chainId: 11155111,
              useENS: true,
              use0GStorage: false,
              use0GCompute: false,
            });
          }}
          variant="secondary"
          className="w-full"
        >
          Wrap Another Agent
        </Button>
      </div>
    );
  }

  return (
    <WizardShell
      currentStep={step}
      totalSteps={4}
      title={STEPS[step - 1].title}
      subtitle={STEPS[step - 1].subtitle}
    >
      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-apple-sub block mb-1">
              Agent name{' '}
              <span className="text-apple-sub/60">
                (becomes name.agentmcp.eth)
              </span>
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                up({
                  name: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, ''),
                })
              }
              placeholder="my-agent"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
            />
            {form.name && (
              <p className="text-xs text-apple-sub mt-1 font-mono">
                {form.name}.agentmcp.eth
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-apple-sub block mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => up({ description: e.target.value })}
              placeholder="What does your agent do?"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-apple-sub block mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => up({ category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              {['defi', 'research', 'developer-tools', 'general', 'data', 'creative'].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </div>
          <Button
            onClick={() => setStep(2)}
            disabled={!form.name || !form.description}
            className="w-full"
          >
            Continue →
          </Button>
        </div>
      )}

      {/* Step 2: Pricing */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-apple-sub block mb-1">
                Price per call
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => up({ price: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-apple-sub block mb-1">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) =>
                  up({ currency: e.target.value as 'USDC' | 'ETH' })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
              >
                <option>USDC</option>
                <option>ETH</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-apple-sub block mb-1">
              Chain
            </label>
            <select
              value={form.chainId}
              onChange={(e) => up({ chainId: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              {CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl bg-apple-gray p-4 text-sm text-apple-sub">
            Payments via KeeperHub x402. 2% protocol fee.
            <br />
            At 100 calls/day ={' '}
            <strong className="text-apple-text">
              ${dailyRevenue}/day
            </strong>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              ← Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!form.price}
              className="flex-1"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Stack */}
      {step === 3 && (
        <div className="space-y-4">
          {[
            {
              key: 'useENS',
              label: 'ENS Identity',
              desc: `Register as ${form.name || 'name'}.agentmcp.eth`,
              locked: true,
            },
            {
              key: 'use0GStorage',
              label: '0G Storage Memory',
              desc: 'Agent remembers users across sessions via decentralized storage',
              locked: false,
            },
            {
              key: 'use0GCompute',
              label: '0G Compute AI',
              desc: 'Run verified AI inference with TEE proofs on every call',
              locked: false,
            },
          ].map(({ key, label, desc, locked }) => (
            <label
              key={key}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-apple-blue/30 transition-colors"
            >
              <input
                type="checkbox"
                checked={Boolean(form[key as keyof WrapForm])}
                onChange={(e) =>
                  !locked && up({ [key]: e.target.checked })
                }
                disabled={locked}
                className="mt-0.5 accent-apple-blue"
              />
              <div>
                <p className="text-sm font-medium text-apple-text">
                  {label}{' '}
                  {locked && (
                    <span className="text-xs text-apple-sub">(required)</span>
                  )}
                </p>
                <p className="text-xs text-apple-sub mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              ← Back
            </Button>
            <Button onClick={() => setStep(4)} className="flex-1">
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Deploy */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-2 text-sm">
            <p className="font-medium text-apple-text">Summary</p>
            <p className="text-apple-sub font-mono">
              {form.name}.agentmcp.eth
            </p>
            <p className="text-apple-sub">
              {form.price} {form.currency}/call ·{' '}
              {CHAINS.find((c) => c.id === form.chainId)?.label} ·{' '}
              {form.category}
            </p>
            <p className="text-apple-sub">
              {[
                form.useENS && 'ENS',
                form.use0GStorage && '0G Storage',
                form.use0GCompute && '0G Compute',
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          {!account && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
              Connect your wallet to sign the ENS registration.
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep(3)}
              className="flex-1"
            >
              ← Back
            </Button>
            <Button
              onClick={deploy}
              disabled={deploying || !account}
              className="flex-1"
            >
              {deploying ? 'Deploying…' : 'Deploy →'}
            </Button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
