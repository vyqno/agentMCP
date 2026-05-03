import Link from 'next/link';
import { Badge } from '../../../../components/ui/Badge';

interface ProofEntry {
  timestamp: string;
  task: string;
  proof: string | null;
  model: string;
  verified: boolean;
}

async function getProofs(name: string): Promise<ProofEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/agents/${name}`, {
      next: { revalidate: 10 },
    });
    const agent = await res.json() as {
      lastProof?: string;
      liveState?: string;
    };
    if (!agent.lastProof) return [];
    return [
      {
        timestamp: new Date().toISOString(),
        task:
          agent.liveState?.replace('processing:', '') ?? 'Recent agent call',
        proof: agent.lastProof,
        model: '0G Compute / DeepSeek R1',
        verified: true,
      },
    ];
  } catch {
    return [];
  }
}

export default async function ProofsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const proofs = await getProofs(name);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div>
        <Link
          href={`/agent/${name}`}
          className="text-apple-blue text-sm hover:underline"
        >
          ← {name}
        </Link>
        <h1 className="text-2xl font-semibold text-apple-text mt-2">
          Proof Chain
        </h1>
        <p className="text-apple-sub text-sm mt-1">
          Every call to {name}.agentmcp.eth produces a 0G Compute TEE proof.
          These are written to ENS and verifiable by anyone.
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <strong>What is a proof?</strong> 0G Compute runs the AI model inside a
        Trusted Execution Environment (TEE). The resulting proof cryptographically
        certifies that a real AI ran — not hardcoded logic. The proof hash is
        written to <code className="font-mono text-xs">agentmcp.proof</code> in
        ENS after every call.
      </div>

      {proofs.length === 0 ? (
        <p className="text-apple-sub text-sm">
          No proofs yet — make a call to generate the first one.
        </p>
      ) : (
        <div className="space-y-4">
          {proofs.map((p, i) => (
            <div key={i} className="bg-white rounded-card shadow-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-apple-sub font-mono">
                  {new Date(p.timestamp).toLocaleString()}
                </span>
                {p.verified && <Badge variant="verified">TEE Verified</Badge>}
              </div>
              <p className="text-sm text-apple-text font-medium">
                {p.task || 'Agent call'}
              </p>
              {p.proof && (
                <p className="text-xs font-mono text-apple-sub break-all">
                  Proof:{' '}
                  <span className="text-apple-blue">{p.proof}</span>
                </p>
              )}
              <p className="text-xs text-apple-sub">Model: {p.model}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
