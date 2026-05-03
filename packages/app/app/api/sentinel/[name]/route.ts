import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const body = await req.json() as {
    walletAddress: string;
    entryPriceUsd: number;
    triggerDropPct: number;
    safeAddress: string;
    maxRiskScore: number;
  };

  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'KeeperHub not configured — set KEEPERHUB_API_KEY' },
      { status: 503 },
    );
  }

  const apiBase = process.env.KEEPERHUB_API_URL ?? 'https://app.keeperhub.dev';
  const templateId = process.env.KEEPERHUB_SENTINEL_TEMPLATE_ID;
  const triggerPrice = body.entryPriceUsd * (1 - body.triggerDropPct / 100);

  let workflowId: string;

  if (templateId) {
    const res = await fetch(`${apiBase}/api/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: `Sentinel: ${name} / ${body.walletAddress.slice(0, 8)}`,
        cloneFrom: templateId,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: 502 });
    }
    const data = await res.json() as { id: string };
    workflowId = data.id;
  } else {
    const prompt =
      `Watch WETH/USDC Uniswap V3 price on Base every 5 minutes. ` +
      `If price drops below $${triggerPrice.toFixed(2)}: ` +
      `assess risk, if risk < ${body.maxRiskScore} transfer USDC to ${body.safeAddress}.`;

    const genRes = await fetch(`${apiBase}/api/workflows/ai-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ prompt }),
    });
    if (!genRes.ok) {
      return NextResponse.json({ error: await genRes.text() }, { status: 502 });
    }
    const genData = await genRes.json() as {
      id?: string;
      workflow?: { id: string };
    };
    workflowId =
      genData.id ?? genData.workflow?.id ?? `mock-${Date.now()}`;
  }

  return NextResponse.json({ workflowId, triggerPrice, status: 'active' });
}
