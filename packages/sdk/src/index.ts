// packages/sdk/src/index.ts
export { AgentMCPServer } from './core/mcp-server.js';
export { SessionStorage } from './session/storage.js';
export { ENSIdentity, AGENT_TEXT_KEYS } from './identity/ens.js';
export { ZGInference } from './compute/inference.js';
export { x402Middleware, build402Response, verifyPayment, parsePaymentHeader } from './payment/x402.js';
export type {
  AgentConfig,
  AgentSession,
  AgentHandler,
  AgentInput,
  AgentMetadata,
  WrappedAgent,
  ENSConfig,
  StorageConfig,
  ComputeConfig,
} from './types.js';
export type { ChatMessage, InferenceResult } from './compute/inference.js';
export type { PaymentProof, PaymentResult } from './payment/x402.js';

import type { AgentConfig } from './types.js';
import { AgentMCPServer } from './core/mcp-server.js';

/**
 * Main entry point. Wraps any async handler as a full MCP server.
 * @example
 * const agent = wrapAsAgent({
 *   name: 'trading-genius',
 *   description: 'Analyzes DeFi positions',
 *   handler: async (input, session) => 'analysis result',
 *   pricing: { amount: '0.05', currency: 'USDC', recipientAddress: '0x...', chainId: 8453 },
 * });
 * await agent.start(3001);
 */
export function wrapAsAgent(config: AgentConfig): AgentMCPServer {
  return new AgentMCPServer(config);
}
