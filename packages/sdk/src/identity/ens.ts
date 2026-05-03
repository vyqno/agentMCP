// packages/sdk/src/identity/ens.ts
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  type Hash,
  type Address,
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { normalize, namehash } from 'viem/ens';
import type { AgentMetadata, ENSConfig } from '../types.js';

// Minimal ENS Public Resolver ABI — only the functions we call
const RESOLVER_ABI = parseAbi([
  'function setText(bytes32 node, string calldata key, string calldata value) external',
  'function text(bytes32 node, string calldata key) view returns (string memory)',
]);

/**
 * ENS text record keys used by AgentMCP.
 * Standard keys: "description", "url", "keywords"
 * AgentMCP-namespaced keys: "agentmcp.*"
 *
 * This is the "Most Creative Use" of ENS:
 * Every key is queryable by anyone — the ENS record IS the agent's public API spec.
 */
export const AGENT_TEXT_KEYS = {
  description: 'description',
  url: 'url',               // MCP endpoint URL
  category: 'keywords',
  price: 'agentmcp.price',           // e.g., "0.05 USDC"
  model: 'agentmcp.model',           // e.g., "deepseek-r1 (0G Compute)"
  reputation: 'agentmcp.reputation', // e.g., "4.9"
  callCount: 'agentmcp.calls',       // e.g., "1234"
  availability: 'agentmcp.status',   // "online" | "offline"
  lastUpdated: 'agentmcp.updatedAt', // ISO timestamp
  chainId: 'agentmcp.chainId',       // payment chain
  payTo: 'agentmcp.payTo',           // payment address
  // Proof chain — updated on every call
  state:   'agentmcp.state',    // "idle" | "processing:task description"
  proof:   'agentmcp.proof',    // 0G Compute TEE proof hash from last call
  keeper:  'agentmcp.keeper',   // KeeperHub workflow ID watching this agent
} as const;

export class ENSIdentity {
  private publicClient: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient>;
  private account: ReturnType<typeof privateKeyToAccount>;
  private resolverCache = new Map<string, Address>();

  constructor(private config: ENSConfig) {
    const transport = http(config.rpcUrl);
    this.publicClient = createPublicClient({ chain: sepolia, transport });
    this.account = privateKeyToAccount(config.privateKey);
    this.walletClient = createWalletClient({ account: this.account, chain: sepolia, transport });
  }

  private async getResolver(ensName: string): Promise<Address> {
    const cached = this.resolverCache.get(ensName);
    if (cached) return cached;

    const resolver = await this.publicClient.getEnsResolver({
      name: normalize(ensName),
    });
    if (!resolver) throw new Error(`No ENS resolver found for ${ensName}`);
    this.resolverCache.set(ensName, resolver);
    return resolver;
  }

  async getText(ensName: string, key: string): Promise<string | null> {
    try {
      const result = await this.publicClient.getEnsText({
        name: normalize(ensName),
        key,
      });
      return result ?? null;
    } catch {
      return null;
    }
  }

  async setText(ensName: string, key: string, value: string): Promise<Hash> {
    const resolverAddress = await this.getResolver(ensName);
    const node = namehash(normalize(ensName));

    const hash = await this.walletClient.writeContract({
      account: this.account,
      address: resolverAddress,
      abi: RESOLVER_ABI,
      functionName: 'setText',
      args: [node, key, value],
      chain: sepolia,
    });

    return hash;
  }

  /**
   * Publish the full agent spec to ENS text records.
   * Called once during agent.start() and after every 10 calls to keep records fresh.
   */
  async publishAgentRecord(
    ensName: string,
    metadata: Omit<AgentMetadata, 'name' | 'fullName'>,
  ): Promise<void> {
    const updates: Array<[string, string]> = [
      [AGENT_TEXT_KEYS.description, metadata.description],
      [AGENT_TEXT_KEYS.url, metadata.endpoint],
      [AGENT_TEXT_KEYS.category, metadata.category],
      [AGENT_TEXT_KEYS.price, metadata.price],
      [AGENT_TEXT_KEYS.model, metadata.model],
      [AGENT_TEXT_KEYS.reputation, metadata.reputation],
      [AGENT_TEXT_KEYS.callCount, metadata.callCount],
      [AGENT_TEXT_KEYS.availability, metadata.availability],
      [AGENT_TEXT_KEYS.lastUpdated, metadata.lastUpdated],
    ];

    for (const [key, value] of updates) {
      await this.setText(ensName, key, value);
    }

    console.log(`✓ ENS record published: ${ensName}`);
  }

  /**
   * Read agent spec from ENS text records.
   * Used by the registry API to list agents without a central database.
   */
  async readAgentRecord(ensName: string): Promise<Partial<AgentMetadata>> {
    const [description, url, category, price, model, reputation, callCount, availability, lastUpdated] =
      await Promise.all([
        this.getText(ensName, AGENT_TEXT_KEYS.description),
        this.getText(ensName, AGENT_TEXT_KEYS.url),
        this.getText(ensName, AGENT_TEXT_KEYS.category),
        this.getText(ensName, AGENT_TEXT_KEYS.price),
        this.getText(ensName, AGENT_TEXT_KEYS.model),
        this.getText(ensName, AGENT_TEXT_KEYS.reputation),
        this.getText(ensName, AGENT_TEXT_KEYS.callCount),
        this.getText(ensName, AGENT_TEXT_KEYS.availability),
        this.getText(ensName, AGENT_TEXT_KEYS.lastUpdated),
      ]);

    return {
      fullName: ensName,
      name: ensName.split('.')[0],
      description: description ?? undefined,
      endpoint: url ?? undefined,
      category: category ?? undefined,
      price: price ?? undefined,
      model: model ?? undefined,
      reputation: reputation ?? '5.0',
      callCount: callCount ?? '0',
      availability: (availability as 'online' | 'offline') ?? 'offline',
      lastUpdated: lastUpdated ?? new Date().toISOString(),
    };
  }

  /**
   * Update reputation and call count in ENS text records.
   * Called after every successful agent call — this is the "live API spec" that
   * wins ENS Most Creative Use.
   */
  async updateStats(
    ensName: string,
    callCount: number,
    reputationScore: number,
  ): Promise<void> {
    await Promise.all([
      this.setText(ensName, AGENT_TEXT_KEYS.callCount, String(callCount)),
      this.setText(ensName, AGENT_TEXT_KEYS.reputation, reputationScore.toFixed(1)),
      this.setText(ensName, AGENT_TEXT_KEYS.lastUpdated, new Date().toISOString()),
    ]);
  }

  /** Set live state — called BEFORE handler runs. Non-blocking (fire and forget). */
  async setLiveState(ensName: string, state: string): Promise<void> {
    await this.setText(ensName, AGENT_TEXT_KEYS.state, state).catch(() => {});
  }

  /** Clear live state + write proof hash — called AFTER handler completes. Non-blocking. */
  async setProofAndClearState(ensName: string, proofHash: string): Promise<void> {
    await Promise.all([
      this.setText(ensName, AGENT_TEXT_KEYS.proof, proofHash),
      this.setText(ensName, AGENT_TEXT_KEYS.state, 'idle'),
    ]).catch(() => {});
  }

  /** Record the KeeperHub workflow ID watching this agent. Non-blocking. */
  async setKeeperWorkflow(ensName: string, workflowId: string): Promise<void> {
    await this.setText(ensName, AGENT_TEXT_KEYS.keeper, workflowId).catch(() => {});
  }
}
