// packages/sdk/src/types.ts

export interface AgentConfig {
  /** Subdomain name, e.g. "trading-genius" (becomes trading-genius.agentmcp.eth) */
  name: string;
  description: string;
  /** The agent's business logic */
  handler: AgentHandler;
  pricing: {
    amount: string;           // e.g., "0.05"
    currency: 'USDC' | 'ETH';
    recipientAddress: `0x${string}`;
    chainId: number;          // 8453 = Base, 11155111 = Sepolia testnet
  };
  ens?: ENSConfig;
  storage?: StorageConfig;
  compute?: ComputeConfig;
}

export interface ENSConfig {
  parentName: string;         // "agentmcp.eth"
  /** Ethereum wallet private key for signing ENS writes */
  privateKey: `0x${string}`;
  rpcUrl: string;
  category?: string;
}

export interface StorageConfig {
  indexerUrl: string;
  rpcUrl: string;
  privateKey: string;
}

export interface ComputeConfig {
  rpcUrl: string;
  privateKey: string;
}

export interface AgentSession {
  agentName: string;
  callerId: string;
  /** Arbitrary KV memory — persisted to 0G Storage between calls */
  memory: Record<string, unknown>;
  callCount: number;
  totalEarned: string;        // cumulative USDC earned
  lastCallAt: string;         // ISO timestamp
  reputationScore: number;    // 0–5.0
}

export type AgentHandler = (
  input: AgentInput,
  session: AgentSession,
) => Promise<string>;

export interface AgentInput {
  task: string;
  [key: string]: unknown;
}

export interface WrappedAgent {
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
  readonly endpoint: string;
}

export interface AgentMetadata {
  name: string;
  fullName: string;           // e.g., "trading-genius.agentmcp.eth"
  description: string;
  category: string;
  price: string;
  model: string;
  endpoint: string;
  reputation: string;
  callCount: string;
  availability: 'online' | 'offline';
  lastUpdated: string;
}
