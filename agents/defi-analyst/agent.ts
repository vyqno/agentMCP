// agents/defi-analyst/agent.ts
import { ethers } from 'ethers';
import type { AgentHandler } from '@agentmcp/sdk';
import type { ZGInference } from '@agentmcp/sdk';
import { getTopPools, getPool, getSwapQuote, BASE_TOKENS } from './uniswap.js';

export const defiAnalystHandler: AgentHandler = async (input, session) => {
  const { task } = input;
  // Broker is injected as non-enumerable — safe to cast
  const compute = (session.memory as any).__compute as ZGInference | undefined;

  const taskLower = task.toLowerCase();
  let contextData = '';

  try {
    if (taskLower.includes('top pool') || taskLower.includes('best pool') ||
        taskLower.includes('list') || taskLower.includes('what are')) {
      const pools = await getTopPools();
      contextData = `Top Uniswap V3 pools by TVL:\n${JSON.stringify(pools.slice(0, 5), null, 2)}`;
    } else if (taskLower.match(/0x[a-f0-9]{40}/i)) {
      const addressMatch = task.match(/0x[a-fA-F0-9]{40}/);
      const pool = addressMatch ? await getPool(addressMatch[0]) : null;
      contextData = pool
        ? `Pool data:\n${JSON.stringify(pool, null, 2)}`
        : `Pool not found. Try listing top pools first.`;
    } else if (taskLower.includes('quote') || taskLower.includes('swap') ||
               taskLower.includes('price')) {
      const rpcUrl = process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';
      try {
        const amountIn = ethers.parseEther('1').toString();
        const quote = await getSwapQuote(
          BASE_TOKENS.WETH, BASE_TOKENS.USDC, amountIn, 500, rpcUrl,
        );
        const amountOut = parseFloat(quote.amountOut) / 1e6;
        contextData = `Uniswap V3 quote: 1 WETH → ${amountOut.toFixed(2)} USDC` +
          ` (0.05% fee tier, estimated gas: ${quote.gasEstimate} units)`;
      } catch (quoteErr: any) {
        contextData = `Quote unavailable: ${quoteErr.message}. Using pool data instead.`;
        const pools = await getTopPools();
        contextData += `\nTop pools:\n${JSON.stringify(pools.slice(0, 3), null, 2)}`;
      }
    } else {
      const pools = await getTopPools();
      contextData = `Current top 5 Uniswap V3 pools:\n${JSON.stringify(pools.slice(0, 5), null, 2)}`;
    }
  } catch (dataErr: any) {
    contextData = `Data fetch error: ${dataErr.message}`;
  }

  // Maintain query history in session memory
  const history = (session.memory.queryHistory as string[]) ?? [];
  history.unshift(task.slice(0, 100));
  session.memory.queryHistory = history.slice(0, 10);

  // Use 0G Compute for intelligent analysis when available
  if (compute) {
    const historyContext = history.length > 1
      ? `\nRecent queries: ${history.slice(1, 4).join('; ')}`
      : '';

    const result = await compute.chat([
      {
        role: 'system',
        content:
          'You are an expert DeFi analyst with deep Uniswap V3 knowledge. ' +
          'Analyze onchain data and give specific, actionable insights. ' +
          'Highlight risks, opportunities, and impermanent loss considerations. ' +
          'Format numbers clearly (e.g., $1.2M TVL, 0.05% fee).' + historyContext,
      },
      {
        role: 'user',
        content: `Task: ${task}\n\nOnchain data:\n${contextData}`,
      },
    ]);

    return result.content;
  }

  // Fallback if 0G Compute not configured
  return `DeFi Analysis (no AI compute configured):\n\n${contextData}\n\nTask: ${task}`;
};
