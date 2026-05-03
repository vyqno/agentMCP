// packages/sdk/src/sentinel/keeper.ts

export interface SentinelConfig {
  walletAddress: string;
  entryPriceUsd: number;
  triggerDropPct: number;   // e.g. 5 = trigger at 5% drop
  safeAddress: string;
  maxRiskScore: number;     // 0–100
  agentName: string;
  ensParentName: string;
}

export interface SentinelResult {
  workflowId: string;
  watchAddress: string;
  triggerPrice: number;
  status: 'active';
}

/**
 * Creates a KeeperHub workflow that autonomously watches a Uniswap position 24/7.
 * Requires KEEPERHUB_API_KEY env var.
 * If KEEPERHUB_SENTINEL_TEMPLATE_ID is set, clones that template.
 * Otherwise generates a new workflow via AI generate endpoint.
 */
export async function createSentinelWorkflow(config: SentinelConfig): Promise<SentinelResult> {
  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) throw new Error('KEEPERHUB_API_KEY not set');

  const apiBase = process.env.KEEPERHUB_API_URL ?? 'https://app.keeperhub.dev';
  const templateId = process.env.KEEPERHUB_SENTINEL_TEMPLATE_ID;
  const triggerPrice = config.entryPriceUsd * (1 - config.triggerDropPct / 100);

  let workflowId: string;

  if (templateId) {
    const res = await fetch(`${apiBase}/api/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        name: `Sentinel: ${config.walletAddress.slice(0, 8)} @ $${triggerPrice.toFixed(0)}`,
        cloneFrom: templateId,
      }),
    });
    if (!res.ok) throw new Error(`KeeperHub clone failed: ${await res.text()}`);
    const data = await res.json() as { id: string };
    workflowId = data.id;
  } else {
    const prompt = [
      `Create a workflow named "DeFi Sentinel for ${config.walletAddress.slice(0, 8)}"`,
      `that runs every 5 minutes on Base (chainId 8453).`,
      `Step 1: read WETH/USDC price from Uniswap V3 QuoterV2 contract`,
      `(0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a) quoteExactInputSingle`,
      `for 1e18 WETH (tokenIn 0x4200000000000000000000000000000000000006,`,
      `tokenOut 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, fee 500).`,
      `Step 2: if price < ${triggerPrice.toFixed(2)}: assess risk of a USDC transfer.`,
      `Step 3: if risk_score < ${config.maxRiskScore}: transfer USDC to ${config.safeAddress}.`,
      `Step 4: log result.`,
    ].join(' ');

    const genRes = await fetch(`${apiBase}/api/workflows/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ prompt }),
    });
    if (!genRes.ok) throw new Error(`KeeperHub generate failed: ${await genRes.text()}`);
    const genData = await genRes.json() as { workflow?: { id: string }; id?: string };
    workflowId = genData.workflow?.id ?? genData.id ?? '';
    if (!workflowId) throw new Error('KeeperHub did not return a workflow ID');
  }

  return { workflowId, watchAddress: config.walletAddress, triggerPrice, status: 'active' };
}
