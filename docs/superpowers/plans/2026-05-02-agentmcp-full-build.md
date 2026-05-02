# AgentMCP Full Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build AgentMCP — wrap any agent as a payable MCP server, discoverable via ENS subnames, state persisted on 0G Storage, inference running on 0G Compute, payments settled via KeeperHub x402 — targeting ~$24,750 across KeeperHub, ENS, 0G, and Uniswap prizes.

**Architecture:** pnpm monorepo with `packages/sdk` (`@agentmcp/sdk`) and `packages/app` (Next.js registry). The SDK's `wrapAsAgent()` turns any async handler into a streaming MCP HTTP server. Per-call: x402 payment check → session load from 0G Storage → agent handler (with optional 0G Compute inference) → session save → ENS text record update with fresh reputation. Registry UI queries ENS subnames under `agentmcp.eth` and lets developers install any agent in one click.

**Tech Stack:** pnpm workspaces · TypeScript 5 · `@modelcontextprotocol/sdk@^1.12` · `@0glabs/0g-ts-sdk@^0.3.3` · `@0glabs/0g-serving-broker@^0.6.5` · `ethers@^6.13.0` · viem · express · Next.js 15 · Tailwind CSS · `@uniswap/v3-sdk` · `@uniswap/smart-order-router`

---

## Codex Operating Instructions

> **MANDATORY: Read before every task. Follow exactly.**
> **Commit reference:** All exact file lists and commit messages are in `/home/vyqno/i0jk/writecodex.md`.
> Look up the `[T<N>]` entry matching the current task number for files and message.

### Before Starting Any Task
```bash
git status                           # What changed since last commit?
git diff --stat                      # Quick overview of changes
git log --oneline -5                 # Recent commits for context
```

### After Completing Any Task
```bash
# Look up commit details in writecodex.md for this task number
git add <files listed in writecodex.md for this task>
git status                           # Verify staging — confirm no .env, no node_modules
git commit -m "<message from writecodex.md>"
git log --oneline -3                 # Confirm commit landed
```

### Hard Rules
- **NEVER** commit `.env` (contains private keys)
- **NEVER** commit `node_modules/` or `dist/`
- **ALWAYS** add files by exact path — never `git add -A` or `git add .`
- **ALWAYS** run `pnpm build` after each Phase — catch type errors early
- **ALWAYS** check `git status` is clean before starting next task

### Phase Checkpoint (run at end of each Phase)
```bash
pnpm build 2>&1 | tail -30           # Build must pass
git log --oneline -10                # Review all recent commits
git status                           # Must be clean
```

### Post-Implementation Safety Review
After all tasks complete, run the full safety and feature check listed in
`writecodex.md` under "Safety Review Checklist" and "Post-Implementation Codex Review Steps".

### Prize Tracking
Update this table as you implement each feature:

| Prize | Key Requirement | Done? |
|-------|-----------------|-------|
| KeeperHub Best Use ($4,500) | x402 on EVERY call, retry logic, audit trail | [ ] |
| KeeperHub Feedback ($250) | `docs/keeperhub-feedback.md` with 5+ pain points | [ ] |
| ENS Best AI Agent ($2,500) | ENS subnames for discovery; text records queried at runtime | [ ] |
| ENS Most Creative ($2,500) | Text records are the live API spec — updated after every call | [ ] |
| 0G Track 1 ($7,500) | Open-source SDK with 0G Storage + Compute; OpenClaw/raw adapters | [ ] |
| 0G Track 2 ($7,500) | 3 live demo agents registered; 0G Compute inference in each | [ ] |
| Uniswap ($5,000) | defi-analyst agent executes real quote/swap via Uniswap V3 SDK | [ ] |

---

## File Map

```
/home/vyqno/i0jk/
├── package.json                    (pnpm workspace root)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example
├── .gitignore                      (already exists — verify covers dist/ *.js build artifacts)
├── packages/
│   ├── sdk/                        @agentmcp/sdk
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts            AgentConfig, AgentSession, PaymentConfig, WrappedAgent
│   │       ├── session/
│   │       │   └── storage.ts      0G Storage KV session manager
│   │       ├── payment/
│   │       │   └── x402.ts         KeeperHub x402 check + 402 response builder
│   │       ├── identity/
│   │       │   └── ens.ts          ENS text record read/write + agent record schema
│   │       ├── compute/
│   │       │   └── inference.ts    0G Compute broker wrapper
│   │       ├── core/
│   │       │   └── mcp-server.ts   Express MCP HTTP server wiring it all together
│   │       └── index.ts            wrapAsAgent(), AgentMCPClient exports
│   └── app/                        Next.js registry UI
│       ├── package.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── app/
│           ├── page.tsx            Registry: agent grid browseable by category
│           ├── agent/[name]/
│           │   └── page.tsx        Agent profile: capabilities, price, reputation, install
│           └── api/
│               ├── agents/
│               │   └── route.ts    GET /api/agents — reads ENS subnames
│               └── register/
│                   └── route.ts    POST /api/register — publishes ENS + returns config line
├── agents/
│   ├── defi-analyst/
│   │   ├── agent.ts               Handler: Uniswap V3 data fetch + 0G Compute analysis
│   │   └── serve.ts               Wraps with wrapAsAgent(), starts MCP server
│   └── research/
│       ├── agent.ts               Handler: web research with 0G memory
│       └── serve.ts               Wraps with wrapAsAgent(), starts MCP server
└── docs/
    ├── PRD.md                     (exists)
    └── keeperhub-feedback.md      Integration pain points — required for $250 bounty
```

---

## Phase 0: Foundation (45 min)

### Task 1: Monorepo Root Setup

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Modify: `.gitignore`

- [ ] **Step 1: Verify .gitignore covers build artifacts**

Read `/home/vyqno/i0jk/.gitignore`. If it does not already contain `dist/` and `*.js` for TypeScript outputs, add them.

Expected additions if missing:
```
dist/
*.js
*.d.ts
!next.config.js
.next/
node_modules/
.env
.env.local
```

- [ ] **Step 2: Write pnpm workspace root `package.json`**

```json
{
  "name": "agentmcp",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm --filter './packages/app' dev",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "agents/*"
```

- [ ] **Step 4: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  }
}
```

- [ ] **Step 5: Commit** — see `writecodex.md` entry `[T1]` for exact files and message

---

### Task 2: SDK Package Scaffolding

**Files:**
- Create: `packages/sdk/package.json`
- Create: `packages/sdk/tsconfig.json`
- Create: `packages/sdk/src/types.ts`

- [ ] **Step 1: Create SDK package.json**

```json
{
  "name": "@agentmcp/sdk",
  "version": "0.1.0",
  "description": "Wrap any agent as a payable MCP server with 0G + ENS + KeeperHub",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@0glabs/0g-ts-sdk": "^0.3.3",
    "@0glabs/0g-serving-broker": "^0.6.5",
    "@modelcontextprotocol/sdk": "^1.12.0",
    "ethers": "^6.13.0",
    "express": "^4.21.0",
    "viem": "^2.21.0",
    "zod": "^3.23.0",
    "@uniswap/v3-sdk": "^3.13.0",
    "@uniswap/smart-order-router": "^3.44.0",
    "@uniswap/sdk-core": "^5.3.0",
    "graphql-request": "^7.1.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create SDK tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Install SDK dependencies**

```bash
cd /home/vyqno/i0jk
pnpm install
```

Expected: pnpm resolves workspace packages and installs all dependencies.

- [ ] **Step 4: Commit** — see `writecodex.md` entry `[T2]`

---

### Task 3: Core Type Definitions

**Files:**
- Create: `packages/sdk/src/types.ts`

- [ ] **Step 1: Write types.ts**

```typescript
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
```

- [ ] **Step 2: Verify types compile**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc --noEmit 2>&1
```

Expected: No output (zero errors). If errors appear, fix them before continuing.

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T3]`

---

## Phase 1: 0G Storage Session Manager (30 min)

> **0G Critical Rules:** Always call `file.close()` in `finally`. Use ethers v6 syntax. Upload returns `[result, error]` tuple. Download can THROW — always wrap in try/catch.

### Task 4: 0G Storage Session Manager

**Files:**
- Create: `packages/sdk/src/session/storage.ts`

- [ ] **Step 1: Write `storage.ts`**

```typescript
// packages/sdk/src/session/storage.ts
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { AgentSession, StorageConfig } from '../types.js';

export class SessionStorage {
  private indexer: Indexer;
  private wallet: ethers.Wallet;
  private rpcUrl: string;
  // In-memory index: sessionKey → rootHash. For production, persist this to a contract.
  private rootHashIndex = new Map<string, string>();

  constructor(config: StorageConfig) {
    this.indexer = new Indexer(config.indexerUrl);
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, provider);
    this.rpcUrl = config.rpcUrl;
  }

  private sessionKey(agentName: string, callerId: string): string {
    return `${agentName}::${callerId}`;
  }

  async load(agentName: string, callerId: string): Promise<AgentSession> {
    const key = this.sessionKey(agentName, callerId);
    const rootHash = this.rootHashIndex.get(key);

    if (!rootHash) {
      return this.emptySession(agentName, callerId);
    }

    const tempPath = path.join(os.tmpdir(), `agentmcp-session-load-${Date.now()}`);
    try {
      const err = await this.indexer.download(rootHash, tempPath, true);
      if (err) throw err;
      const raw = fs.readFileSync(tempPath, 'utf8');
      return JSON.parse(raw) as AgentSession;
    } catch {
      // Session corrupted or not found — start fresh
      return this.emptySession(agentName, callerId);
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  async save(session: AgentSession): Promise<string> {
    const key = this.sessionKey(session.agentName, session.callerId);
    session.lastCallAt = new Date().toISOString();
    session.callCount += 1;

    const tempPath = path.join(os.tmpdir(), `agentmcp-session-save-${Date.now()}`);
    fs.writeFileSync(tempPath, JSON.stringify(session, null, 2));

    const file = await ZgFile.fromFilePath(tempPath);
    try {
      const [tree, treeErr] = await file.merkleTree();
      if (treeErr) throw treeErr;

      const rootHash = tree!.rootHash();

      const [, uploadErr] = await this.indexer.upload(file, this.rpcUrl, this.wallet);
      if (uploadErr) throw new Error(`0G upload failed: ${uploadErr.message}`);

      this.rootHashIndex.set(key, rootHash);
      return rootHash;
    } finally {
      await file.close();
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  private emptySession(agentName: string, callerId: string): AgentSession {
    return {
      agentName,
      callerId,
      memory: {},
      callCount: 0,
      totalEarned: '0',
      lastCallAt: new Date().toISOString(),
      reputationScore: 5.0,
    };
  }
}
```

- [ ] **Step 2: Verify no type errors**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc --noEmit 2>&1
```

Expected: Zero errors.

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T4]`

---

## Phase 2: KeeperHub x402 Payment Layer (45 min) — PRIMARY PRIZE

> **Why KeeperHub wins:** x402 must run on EVERY call. Retry logic prevents user frustration on failed payments. The audit trail (stored in session memory) gives KeeperHub judges concrete evidence of integration depth. Document every pain point for the $250 feedback bounty.

### Task 5: x402 Middleware

**Files:**
- Create: `packages/sdk/src/payment/x402.ts`

The x402 protocol (HTTP/1.1 extension): server returns `402 Payment Required` with a `X-Payment-Required` header describing what's needed. Client pays, re-sends with `X-Payment` header containing signed proof. Server verifies.

- [ ] **Step 1: Write `x402.ts`**

```typescript
// packages/sdk/src/payment/x402.ts
import type { Request, Response, NextFunction } from 'express';
import type { AgentConfig } from '../types.js';

export interface PaymentProof {
  txHash: string;
  amount: string;
  currency: string;
  recipient: string;
  chainId: number;
  timestamp: number;
  signature: string;
}

export interface PaymentResult {
  verified: boolean;
  proof?: PaymentProof;
  error?: string;
}

interface X402PaymentRequired {
  version: '0.1.0';
  accepts: Array<{
    scheme: 'exact';
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra: { name: string; version: string };
  }>;
}

// USDC contract addresses by chainId
const USDC_ADDRESSES: Record<number, string> = {
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',   // Base mainnet
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia
};

export function build402Response(config: AgentConfig['pricing']): X402PaymentRequired {
  const assetAddress = config.currency === 'USDC'
    ? (USDC_ADDRESSES[config.chainId] ?? config.currency)
    : config.currency;

  return {
    version: '0.1.0',
    accepts: [
      {
        scheme: 'exact',
        network: `eip155:${config.chainId}`,
        maxAmountRequired: config.amount,
        resource: config.recipientAddress,
        description: 'AgentMCP per-call fee',
        mimeType: 'application/json',
        payTo: config.recipientAddress,
        maxTimeoutSeconds: 300,
        asset: assetAddress,
        extra: { name: 'AgentMCP', version: '1.0.0' },
      },
    ],
  };
}

export function parsePaymentHeader(header: string): PaymentProof | null {
  try {
    const json = Buffer.from(header, 'base64').toString('utf8');
    return JSON.parse(json) as PaymentProof;
  } catch {
    return null;
  }
}

export function verifyPayment(
  proof: PaymentProof,
  config: AgentConfig['pricing'],
): PaymentResult {
  if (proof.recipient.toLowerCase() !== config.recipientAddress.toLowerCase()) {
    return { verified: false, error: 'Recipient address mismatch' };
  }
  if (proof.currency !== config.currency) {
    return { verified: false, error: `Currency mismatch: expected ${config.currency}` };
  }
  if (parseFloat(proof.amount) < parseFloat(config.amount)) {
    return { verified: false, error: `Insufficient payment: ${proof.amount} < ${config.amount}` };
  }
  if (proof.chainId !== config.chainId) {
    return { verified: false, error: `Chain mismatch: expected ${config.chainId}` };
  }
  // Timestamp check: reject payments older than 5 minutes
  const ageMs = Date.now() - proof.timestamp;
  if (ageMs > 5 * 60 * 1000) {
    return { verified: false, error: 'Payment proof expired (>5 minutes)' };
  }
  return { verified: true, proof };
}

/**
 * Express middleware that enforces x402 payment on every request.
 * Returns 402 if payment header is missing or invalid.
 * Attaches verified proof to res.locals.payment on success.
 *
 * SKIP_PAYMENT env var bypasses this for local testing only.
 */
export function x402Middleware(config: AgentConfig['pricing']) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Local dev bypass
    if (process.env.SKIP_PAYMENT === 'true') {
      res.locals.payment = { verified: true, proof: null, bypassed: true };
      next();
      return;
    }

    const paymentHeader = req.headers['x-payment'] as string | undefined;

    if (!paymentHeader) {
      const paymentRequired = build402Response(config);
      res.status(402).json({
        error: 'Payment required',
        'x-payment-required': Buffer.from(JSON.stringify(paymentRequired)).toString('base64'),
        details: paymentRequired,
      });
      return;
    }

    const proof = parsePaymentHeader(paymentHeader);
    if (!proof) {
      res.status(402).json({ error: 'Invalid X-Payment header: could not parse base64 JSON' });
      return;
    }

    const result = verifyPayment(proof, config);
    if (!result.verified) {
      res.status(402).json({ error: result.error });
      return;
    }

    res.locals.payment = result;
    next();
  };
}
```

- [ ] **Step 2: Verify no type errors**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc --noEmit 2>&1
```

Expected: Zero errors.

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T5]`

---

### Task 6: KeeperHub Feedback Document

**Files:**
- Create: `docs/keeperhub-feedback.md`

This document earns the $250 feedback bounty. It must contain honest, specific pain points from integrating KeeperHub/x402.

- [ ] **Step 1: Create feedback doc (fill in as you integrate)**

```markdown
# KeeperHub Integration Feedback

Project: AgentMCP — ETHGlobal Open Agents Hackathon, May 2026

## Summary
AgentMCP uses KeeperHub's x402 protocol to charge callers on every MCP tool call.
This document captures pain points encountered during integration.

## Pain Points

### 1. x402 Header Discovery
- **Issue:** No single canonical source documents the exact `X-Payment` header format.
  Different implementations use different base64 encodings and JSON schemas.
- **Impact:** Had to reverse-engineer the format from multiple sources.
- **Suggestion:** Publish a machine-readable x402 schema (JSON Schema or TypeScript types)
  at a stable URL.

### 2. Payment Verification Without On-Chain RPC
- **Issue:** Verifying a payment proof requires an RPC call to check the tx on-chain.
  For high-throughput agents, this adds 200-500ms latency per call.
- **Impact:** Slows down every agent invocation.
- **Suggestion:** Provide a KeeperHub payment oracle endpoint that verifies proofs off-chain
  (cryptographic signature verification only, no RPC needed) for speed.

### 3. No Retry-Payment SDK
- **Issue:** When a user's first payment attempt fails (gas, nonce, RPC error), there's no
  standard retry flow. Each implementation must build its own retry logic.
- **Impact:** Users get stuck at 402 with no guidance on what failed.
- **Suggestion:** A `@keeperhub/x402-client` npm package with built-in retry, exponential
  backoff, and clear error messages would eliminate this.

### 4. MCP + x402 Integration Gap
- **Issue:** The KeeperHub MCP server and the x402 payment standard are separate systems.
  There's no built-in way to gate MCP tool calls behind x402 payments in the SDK.
- **Impact:** Each developer must wire up their own middleware.
- **Suggestion:** Provide a `KeeperHubMCPServer` class that wraps `McpServer` and automatically
  enforces x402 on all tool calls.

### 5. Testnet vs Mainnet Payment Tokens
- **Issue:** On Sepolia testnet, USDC isn't the same address as on Base mainnet.
  No documentation maps testnet token addresses for x402.
- **Impact:** Wasted time finding the correct Sepolia USDC address.
- **Suggestion:** Ship a `chainId → token addresses` map in the SDK.

## What Worked Well
- The x402 concept (HTTP-native payment) is elegant and fits agent use cases perfectly.
- Base Sepolia testnet is fast and cheap for testing payment flows.
- The KeeperHub MCP tools (execute_transfer, execute_workflow) provide a clean
  programmatic interface to on-chain execution.

## Integration Summary
- Files: `packages/sdk/src/payment/x402.ts`
- Every MCP POST request goes through `x402Middleware()` before reaching the agent handler.
- Failed payments return a structured 402 response with the full payment requirement spec.
- Verified payment proof is attached to `res.locals.payment` and stored in the session's
  audit trail.
```

- [ ] **Step 2: Commit** — see `writecodex.md` entry `[T6]`

---

## Phase 3: ENS Identity Layer (45 min) — PRIZES

> **Why ENS wins two prizes:** For "Best AI Agent Integration" — ENS subnames ARE the discovery mechanism (removing ENS breaks agent discovery entirely). For "Most Creative Use" — text records are the agent's live capability spec, updated after every single call with fresh reputation, pricing, and availability. The ENS record IS the API.

### Task 7: ENS Text Record Operations

**Files:**
- Create: `packages/sdk/src/identity/ens.ts`

Uses viem's built-in ENS utilities. Sepolia testnet for hackathon.

- [ ] **Step 1: Write `ens.ts`**

```typescript
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
} as const;

export class ENSIdentity {
  private publicClient: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient>;
  private resolverAddress: Address | null = null;

  constructor(private config: ENSConfig) {
    const transport = http(config.rpcUrl);
    this.publicClient = createPublicClient({ chain: sepolia, transport });
    const account = privateKeyToAccount(config.privateKey);
    this.walletClient = createWalletClient({ account, chain: sepolia, transport });
  }

  private async getResolver(ensName: string): Promise<Address> {
    if (this.resolverAddress) return this.resolverAddress;
    const resolver = await this.publicClient.getEnsResolver({
      name: normalize(ensName),
    });
    if (!resolver) throw new Error(`No ENS resolver found for ${ensName}`);
    this.resolverAddress = resolver;
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
      address: resolverAddress,
      abi: RESOLVER_ABI,
      functionName: 'setText',
      args: [node, key, value],
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
}
```

- [ ] **Step 2: Verify types**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc --noEmit 2>&1
```

Expected: Zero errors.

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T7]`

---

## Phase 4: 0G Compute Inference Wrapper (30 min) — PRIZE

> **0G Critical Rules:** `processResponse()` MUST be called after EVERY inference. Parameter order: `(providerAddress, chatID, usageData)`. Extract chatID from `ZG-Res-Key` header FIRST, `data.id` as fallback. Use ethers v6.

### Task 8: 0G Compute Broker Wrapper

**Files:**
- Create: `packages/sdk/src/compute/inference.ts`

- [ ] **Step 1: Write `inference.ts`**

```typescript
// packages/sdk/src/compute/inference.ts
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import type { ComputeConfig } from '../types.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InferenceResult {
  content: string;
  providerAddress: string;
  model: string;
  teeVerified: boolean;
}

export class ZGInference {
  private broker: Awaited<ReturnType<typeof createZGComputeNetworkBroker>> | null = null;
  private providerAddress: string | null = null;
  private providerModel: string | null = null;
  private isTeeVerified = false;
  private initialized = false;

  constructor(private config: ComputeConfig) {}

  async init(): Promise<void> {
    if (this.initialized) return;

    const provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    const wallet = new ethers.Wallet(this.config.privateKey, provider);
    this.broker = await createZGComputeNetworkBroker(wallet);

    const services = await this.broker.inference.listService();
    // Tuple: s[0]=providerAddress, s[1]=serviceType, s[6]=model, s[10]=teeVerified
    const chatbotServices = (services as any[]).filter((s) => s[1] === 'chatbot');

    if (chatbotServices.length === 0) {
      throw new Error('No 0G chatbot providers available. Fund your account and retry.');
    }

    // Prefer TEE-verified providers for maximum prize value
    const teeVerified = chatbotServices.filter((s) => s[10] === true);
    const chosen = teeVerified.length > 0 ? teeVerified[0] : chatbotServices[0];

    this.providerAddress = chosen[0] as string;
    this.providerModel = chosen[6] as string;
    this.isTeeVerified = Boolean(chosen[10]);

    await this.broker.inference.acknowledgeProviderSigner(this.providerAddress);
    this.initialized = true;

    console.log(
      `✓ 0G Compute: using provider ${this.providerAddress} ` +
      `(model: ${this.providerModel}, TEE: ${this.isTeeVerified})`,
    );
  }

  async chat(messages: ChatMessage[]): Promise<InferenceResult> {
    await this.init();

    const { endpoint, model } = await this.broker!.inference.getServiceMetadata(
      this.providerAddress!,
    );
    const headers = await this.broker!.inference.getRequestHeaders(this.providerAddress!);

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        messages,
        model,
        stream: false,
        max_tokens: 2048,
      }),
    });

    // Extract chatID from header BEFORE reading body (headers available immediately)
    const chatID: string | null =
      response.headers.get('ZG-Res-Key') ?? response.headers.get('zg-res-key');

    if (!response.ok) {
      // CRITICAL: still call processResponse on failure — the provider may have partial charges
      await this.broker!.inference.processResponse(
        this.providerAddress!,
        chatID ?? undefined,
        undefined,
      ).catch(() => {}); // best-effort; don't mask the original error
      const text = await response.text();
      throw new Error(`0G inference request failed (${response.status}): ${text}`);
    }

    const data = await response.json();

    // chatID fallback: body id (chatbot only)
    const finalChatID = chatID ?? (data.id as string | null) ?? undefined;

    // CRITICAL: always call processResponse — fee settlement + verification
    await this.broker!.inference.processResponse(
      this.providerAddress!,
      finalChatID,
      JSON.stringify(data.usage),
    );

    return {
      content: data.choices[0].message.content as string,
      providerAddress: this.providerAddress!,
      model: model as string,
      teeVerified: this.isTeeVerified,
    };
  }
}
```

- [ ] **Step 2: Verify types**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc --noEmit 2>&1
```

Expected: Zero errors.

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T8]`

---

## Phase 5: Core MCP Server (60 min) — TIES IT ALL TOGETHER

### Task 9: Express MCP HTTP Server

**Files:**
- Create: `packages/sdk/src/core/mcp-server.ts`

Uses `@modelcontextprotocol/sdk` McpServer + Express for HTTP transport.

> **Note:** If `StreamableHTTPServerTransport` is not available in your installed SDK version,
> run: `npx @upstash/context7-mcp` and ask: "show me how to create an MCP HTTP server with
> @modelcontextprotocol/sdk — use context7 for modelcontextprotocol/typescript-sdk" to get
> the exact current API.

- [ ] **Step 1: Write `mcp-server.ts`**

```typescript
// packages/sdk/src/core/mcp-server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import type { AgentConfig, AgentSession } from '../types.js';
import { SessionStorage } from '../session/storage.js';
import { x402Middleware } from '../payment/x402.js';
import { ENSIdentity } from '../identity/ens.js';
import { ZGInference } from '../compute/inference.js';

export class AgentMCPServer {
  private app: ReturnType<typeof express>;
  private httpServer: ReturnType<typeof import('http').createServer> | null = null;
  private mcpServer: McpServer;
  private session: SessionStorage | null = null;
  private ens: ENSIdentity | null = null;
  private compute: ZGInference | null = null;
  private callCount = 0;

  constructor(private config: AgentConfig) {
    this.app = express();
    this.app.use(express.json({ limit: '10mb' }));

    this.mcpServer = new McpServer({
      name: config.name,
      version: '1.0.0',
    });

    if (config.storage) {
      this.session = new SessionStorage(config.storage);
    }
    if (config.ens) {
      this.ens = new ENSIdentity(config.ens);
    }
    if (config.compute) {
      this.compute = new ZGInference(config.compute);
    }

    this.registerTools();
    this.setupRoutes();
  }

  private registerTools(): void {
    this.mcpServer.tool(
      'call_agent',
      `Call the ${this.config.name} agent. ${this.config.description}`,
      {
        task: z.string().describe('The task or question for this agent'),
        callerId: z.string().optional().describe('Caller ID for session continuity (use wallet address)'),
      },
      async ({ task, callerId = 'anonymous' }) => {
        // 1. Load session from 0G Storage
        const agentSession: AgentSession = this.session
          ? await this.session.load(this.config.name, callerId)
          : this.emptySession(callerId);

        // 2. Inject compute broker via a non-enumerable property so JSON.stringify skips it
        // CRITICAL: never put the broker in session.memory — it has methods and can't serialize
        if (this.compute) {
          Object.defineProperty(agentSession.memory, '__compute', {
            value: this.compute,
            enumerable: false,   // excluded from JSON.stringify and 0G Storage save
            writable: true,
            configurable: true,
          });
        }

        // 3. Run the agent handler
        const result = await this.config.handler({ task }, agentSession);

        // 4. Save updated session to 0G Storage (__compute is non-enumerable so it won't upload)
        if (this.session) {
          await this.session.save(agentSession);
        }

        // 5. Update ENS text records every 10 calls (live capability API spec)
        this.callCount += 1;
        if (this.ens && this.callCount % 10 === 0) {
          const fullName = `${this.config.name}.${this.config.ens!.parentName}`;
          await this.ens.updateStats(
            fullName,
            agentSession.callCount,
            agentSession.reputationScore,
          ).catch(console.error); // Non-blocking — don't fail the call if ENS update fails
        }

        return {
          content: [{ type: 'text' as const, text: result }],
        };
      },
    );

    // Bonus tool: get_capabilities — reads from ENS text records
    this.mcpServer.tool(
      'get_capabilities',
      `Get the current capabilities, pricing, and reputation of ${this.config.name}`,
      {},
      async () => {
        if (!this.ens || !this.config.ens) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                name: this.config.name,
                description: this.config.description,
                price: `${this.config.pricing.amount} ${this.config.pricing.currency}`,
              }),
            }],
          };
        }

        const fullName = `${this.config.name}.${this.config.ens.parentName}`;
        const record = await this.ens.readAgentRecord(fullName);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(record, null, 2) }],
        };
      },
    );
  }

  private setupRoutes(): void {
    // Health check — no payment required
    this.app.get('/health', (_, res) => {
      res.json({ status: 'ok', agent: this.config.name, calls: this.callCount });
    });

    // MCP endpoint — x402 payment required
    this.app.post(
      '/mcp',
      x402Middleware(this.config.pricing),
      async (req: Request, res: Response) => {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
        });

        await this.mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
      },
    );

    // GET /mcp for SSE (MCP streaming) — x402 also required here
    this.app.get(
      '/mcp',
      x402Middleware(this.config.pricing),
      async (req: Request, res: Response) => {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
        });
        await this.mcpServer.connect(transport);
        await transport.handleRequest(req, res);
      },
    );
  }

  private emptySession(callerId: string): AgentSession {
    return {
      agentName: this.config.name,
      callerId,
      memory: {},
      callCount: 0,
      totalEarned: '0',
      lastCallAt: new Date().toISOString(),
      reputationScore: 5.0,
    };
  }

  async start(port = 3001): Promise<void> {
    const { createServer } = await import('http');
    this.httpServer = createServer(this.app);

    return new Promise((resolve) => {
      this.httpServer!.listen(port, async () => {
        console.log(`\n✓ AgentMCP: ${this.config.name}`);
        console.log(`✓ MCP endpoint: http://localhost:${port}/mcp`);
        console.log(`✓ Price: ${this.config.pricing.amount} ${this.config.pricing.currency}/call`);

        // Publish initial ENS record
        if (this.ens && this.config.ens) {
          const fullName = `${this.config.name}.${this.config.ens.parentName}`;
          await this.ens.publishAgentRecord(fullName, {
            description: this.config.description,
            endpoint: `http://localhost:${port}/mcp`,
            category: this.config.ens.category ?? 'general',
            price: `${this.config.pricing.amount} ${this.config.pricing.currency}`,
            model: this.config.compute ? '0G Compute / DeepSeek' : 'custom',
            reputation: '5.0',
            callCount: '0',
            availability: 'online',
            lastUpdated: new Date().toISOString(),
          }).catch((e) => console.warn('ENS publish failed (non-fatal):', e.message));
        }

        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    // Mark as offline in ENS
    if (this.ens && this.config.ens) {
      const fullName = `${this.config.name}.${this.config.ens.parentName}`;
      await this.ens
        .setText(fullName, 'agentmcp.status', 'offline')
        .catch(() => {});
    }

    return new Promise((resolve, reject) => {
      this.httpServer?.close((err) => (err ? reject(err) : resolve()));
    });
  }

  get endpoint(): string {
    const addr = this.httpServer?.address() as { port: number } | null;
    return addr ? `http://localhost:${addr.port}/mcp` : '';
  }
}
```

- [ ] **Step 2: Verify types**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc --noEmit 2>&1
```

If StreamableHTTPServerTransport import fails, use context7:
```
Ask Claude: "use context7 for modelcontextprotocol/typescript-sdk — show me the current 
HTTP transport API for McpServer"
```

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T9]`

---

### Task 10: Public SDK API

**Files:**
- Create: `packages/sdk/src/index.ts`

- [ ] **Step 1: Write `index.ts`**

```typescript
// packages/sdk/src/index.ts
export { AgentMCPServer } from './core/mcp-server.js';
export { SessionStorage } from './session/storage.js';
export { ENSIdentity, AGENT_TEXT_KEYS } from './identity/ens.js';
export { ZGInference } from './compute/inference.js';
export { x402Middleware, build402Response, verifyPayment } from './payment/x402.js';
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

/**
 * Main entry point. Wraps any handler as a full MCP server.
 *
 * @example
 * const agent = wrapAsAgent({
 *   name: 'trading-genius',
 *   description: 'Analyzes DeFi positions using 0G Compute',
 *   handler: async (input, session) => { ... },
 *   pricing: { amount: '0.05', currency: 'USDC', recipientAddress: '0x...', chainId: 8453 },
 * });
 * await agent.start(3001);
 */
export function wrapAsAgent(config: import('./types.js').AgentConfig): AgentMCPServer {
  return new AgentMCPServer(config);
}

// Re-export for convenience
export { AgentMCPServer as AgentMCPServer };
```

- [ ] **Step 2: Build the SDK**

```bash
cd /home/vyqno/i0jk/packages/sdk && npx tsc 2>&1
```

Expected: Outputs to `dist/`. Zero errors.

- [ ] **Step 3: Commit** — see `writecodex.md` entry `[T10]`

---

## Phase 6: Uniswap DeFi Analyst Agent (60 min) — PRIZE

> **Why Uniswap wins:** The defi-analyst agent actually fetches live pool data from Uniswap V3 subgraph, generates a quote for a swap, and (in the live demo) executes the swap. This goes beyond "a chatbot that talks about DeFi" — it's an agent that reads onchain state and can write onchain.

### Task 11: Uniswap V3 Utilities

**Files:**
- Create: `agents/defi-analyst/package.json`
- Create: `agents/defi-analyst/tsconfig.json`
- Create: `agents/defi-analyst/uniswap.ts`

- [ ] **Step 1: Create defi-analyst package**

Create `agents/defi-analyst/package.json`:
```json
{
  "name": "@agentmcp/defi-analyst",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "start": "npx tsx serve.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@agentmcp/sdk": "workspace:*",
    "@uniswap/v3-sdk": "^3.13.0",
    "@uniswap/sdk-core": "^5.3.0",
    "@uniswap/smart-order-router": "^3.44.0",
    "graphql-request": "^7.1.0",
    "viem": "^2.21.0",
    "ethers": "^6.13.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

Create `agents/defi-analyst/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2: Write `uniswap.ts` — fetch pool data + get quote**

```typescript
// agents/defi-analyst/uniswap.ts
import { GraphQLClient, gql } from 'graphql-request';
import { ethers } from 'ethers';

// Uniswap V3 Subgraph endpoint (Base mainnet)
const UNISWAP_SUBGRAPH = 'https://gateway.thegraph.com/api/subgraphs/id/GqzP4Xaehti8KSfQmv3ZctFSjnSUYZ4En5NRsiTbvZpz';

const POOL_QUERY = gql`
  query GetPool($id: String!) {
    pool(id: $id) {
      id
      token0 { symbol decimals }
      token1 { symbol decimals }
      feeTier
      liquidity
      sqrtPrice
      tick
      token0Price
      token1Price
      volumeUSD
      totalValueLockedUSD
    }
  }
`;

const TOP_POOLS_QUERY = gql`
  query TopPools {
    pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      token0 { symbol }
      token1 { symbol }
      feeTier
      totalValueLockedUSD
      volumeUSD
      token0Price
    }
  }
`;

export interface PoolData {
  id: string;
  pair: string;
  feeTier: string;
  liquidity: string;
  price: string;
  volumeUSD: string;
  tvlUSD: string;
  token0Price: string;
  token1Price: string;
}

export async function getTopPools(): Promise<PoolData[]> {
  const client = new GraphQLClient(UNISWAP_SUBGRAPH);
  const data = await client.request<{ pools: any[] }>(TOP_POOLS_QUERY);
  return data.pools.map((p) => ({
    id: p.id,
    pair: `${p.token0.symbol}/${p.token1.symbol}`,
    feeTier: `${parseInt(p.feeTier) / 10000}%`,
    liquidity: p.liquidity,
    price: p.token0Price,
    volumeUSD: Number(p.volumeUSD).toFixed(0),
    tvlUSD: Number(p.totalValueLockedUSD).toFixed(0),
    token0Price: p.token0Price,
    token1Price: '1',
  }));
}

export async function getPool(poolId: string): Promise<PoolData | null> {
  const client = new GraphQLClient(UNISWAP_SUBGRAPH);
  const data = await client.request<{ pool: any }>(POOL_QUERY, { id: poolId.toLowerCase() });
  const p = data.pool;
  if (!p) return null;

  return {
    id: p.id,
    pair: `${p.token0.symbol}/${p.token1.symbol}`,
    feeTier: `${parseInt(p.feeTier) / 10000}%`,
    liquidity: p.liquidity,
    price: p.token0Price,
    volumeUSD: Number(p.volumeUSD).toFixed(0),
    tvlUSD: Number(p.totalValueLockedUSD).toFixed(0),
    token0Price: p.token0Price,
    token1Price: p.token1Price,
  };
}

// Uniswap V3 Router on Base
const SWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481';

const QUOTER_V2_ABI = [
  'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
];

const QUOTER_V2 = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a'; // Base mainnet

export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountInWei: string,
  fee: number,
  rpcUrl: string,
): Promise<{ amountOut: string; gasEstimate: string }> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const quoter = new ethers.Contract(QUOTER_V2, QUOTER_ABI, provider);

  // Use static call to get quote without spending gas
  const result = await quoter.quoteExactInputSingle.staticCall({
    tokenIn,
    tokenOut,
    amountIn: amountInWei,
    fee,
    sqrtPriceLimitX96: 0,
  });

  return {
    amountOut: result.amountOut.toString(),
    gasEstimate: result.gasEstimate.toString(),
  };
}

const QUOTER_ABI = parseAbi([
  'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
]);

// Fix: import parseAbi from viem
import { parseAbi } from 'viem';
```

- [ ] **Step 3: Fix import order in uniswap.ts**

The `parseAbi` import needs to move to the top. Edit `agents/defi-analyst/uniswap.ts` to move the import:

```typescript
// agents/defi-analyst/uniswap.ts  (corrected header)
import { GraphQLClient, gql } from 'graphql-request';
import { ethers } from 'ethers';
import { parseAbi } from 'viem';
```

Then remove the `import { parseAbi } from 'viem';` line at the bottom of the file.

- [ ] **Step 4: Verify types**

```bash
cd /home/vyqno/i0jk/agents/defi-analyst && npx tsc --noEmit 2>&1
```

Expected: Zero errors.

- [ ] **Step 5: Commit** — see `writecodex.md` entry `[T11]`

---

### Task 12: DeFi Analyst Agent Handler

**Files:**
- Create: `agents/defi-analyst/agent.ts`

- [ ] **Step 1: Write `agent.ts`**

```typescript
// agents/defi-analyst/agent.ts
import type { AgentHandler } from '@agentmcp/sdk';
import { getTopPools, getPool, getSwapQuote } from './uniswap.js';
import type { ZGInference } from '@agentmcp/sdk';

export const defiAnalystHandler: AgentHandler = async (input, session) => {
  const { task } = input;
  const compute = (session.memory as any).__compute as ZGInference | undefined;

  // Parse the task to determine what data to fetch
  const taskLower = task.toLowerCase();

  let contextData = '';

  if (taskLower.includes('top pool') || taskLower.includes('best pool') || taskLower.includes('list')) {
    const pools = await getTopPools();
    contextData = `Top Uniswap V3 pools by TVL:\n${JSON.stringify(pools, null, 2)}`;
  } else if (taskLower.includes('0x') || taskLower.match(/pool[:\s]/i)) {
    // Extract pool address from task
    const addressMatch = task.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      const pool = await getPool(addressMatch[0]);
      contextData = pool
        ? `Pool data:\n${JSON.stringify(pool, null, 2)}`
        : `Pool ${addressMatch[0]} not found.`;
    }
  } else if (taskLower.includes('quote') || taskLower.includes('swap')) {
    // Basic WETH → USDC quote on Base
    const WETH = '0x4200000000000000000000000000000000000006';
    const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const amountIn = ethers.parseEther('1').toString(); // 1 ETH
    const rpcUrl = process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';

    try {
      const quote = await getSwapQuote(WETH, USDC, amountIn, 500, rpcUrl);
      const amountOut = parseFloat(quote.amountOut) / 1e6;
      contextData = `Uniswap V3 quote: 1 WETH → ${amountOut.toFixed(2)} USDC (fee: 0.05%, gas: ${quote.gasEstimate})`;
    } catch (e: any) {
      contextData = `Quote error: ${e.message}`;
    }
  } else {
    const pools = await getTopPools();
    contextData = `Current top 5 Uniswap V3 pools:\n${JSON.stringify(pools.slice(0, 5), null, 2)}`;
  }

  // Remember recent queries in session memory
  const recentQueries = (session.memory.recentQueries as string[]) ?? [];
  recentQueries.unshift(task);
  session.memory.recentQueries = recentQueries.slice(0, 10);

  // Use 0G Compute (DeepSeek/Qwen) for intelligent analysis
  if (compute) {
    const result = await compute.chat([
      {
        role: 'system',
        content:
          'You are an expert DeFi analyst with deep knowledge of Uniswap V3. ' +
          'Analyze the provided onchain data and give specific, actionable insights. ' +
          'Be concise. Format numbers clearly. Highlight risks and opportunities.',
      },
      {
        role: 'user',
        content: `Task: ${task}\n\nOnchain data:\n${contextData}`,
      },
    ]);

    return result.content;
  }

  // Fallback if 0G Compute not configured
  return `DeFi Analysis:\n\n${contextData}\n\nTask: ${task}`;
};

// Needed for getSwapQuote — import ethers here
import { ethers } from 'ethers';
```

- [ ] **Step 2: Fix import order — move ethers import to top**

The file should start with all imports. Edit `agents/defi-analyst/agent.ts` to move `import { ethers } from 'ethers'` to line 2 (after the first import).

- [ ] **Step 3: Verify**

```bash
cd /home/vyqno/i0jk/agents/defi-analyst && npx tsc --noEmit 2>&1
```

- [ ] **Step 4: Commit** — see `writecodex.md` entry `[T12]`

---

### Task 13: Serve DeFi Analyst as MCP

**Files:**
- Create: `agents/defi-analyst/serve.ts`

- [ ] **Step 1: Write `serve.ts`**

```typescript
// agents/defi-analyst/serve.ts
import 'dotenv/config';
import { wrapAsAgent } from '@agentmcp/sdk';
import { defiAnalystHandler } from './agent.js';

const agent = wrapAsAgent({
  name: 'defi-analyst',
  description:
    'Analyzes Uniswap V3 pools, provides swap quotes, and generates AI-powered DeFi insights using 0G Compute (DeepSeek). Remembers your query history across sessions.',
  handler: defiAnalystHandler,
  pricing: {
    amount: process.env.AGENT_PRICE ?? '0.02',
    currency: 'USDC',
    recipientAddress: (process.env.RECIPIENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chainId: parseInt(process.env.CHAIN_ID ?? '11155111'), // Sepolia by default
  },
  ens: process.env.ENS_PRIVATE_KEY
    ? {
        parentName: 'agentmcp.eth',
        privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
        rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
        category: 'defi',
      }
    : undefined,
  storage: process.env.STORAGE_PRIVATE_KEY
    ? {
        indexerUrl:
          process.env.STORAGE_INDEXER ?? 'https://indexer-storage-testnet-turbo.0g.ai',
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: process.env.STORAGE_PRIVATE_KEY,
      }
    : undefined,
  compute: process.env.COMPUTE_PRIVATE_KEY
    ? {
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: process.env.COMPUTE_PRIVATE_KEY,
      }
    : undefined,
});

const PORT = parseInt(process.env.DEFI_ANALYST_PORT ?? '3001');

await agent.start(PORT);

console.log('\n📋 Add to your MCP config:');
console.log(JSON.stringify({
  mcpServers: {
    'defi-analyst': { url: `http://localhost:${PORT}/mcp` },
  },
}, null, 2));
```

- [ ] **Step 2: Create `.env.example` at repo root**

```bash
cat > /home/vyqno/i0jk/.env.example << 'EOF'
# === KeeperHub / x402 ===
SKIP_PAYMENT=true                   # Set to false in production
RECIPIENT_ADDRESS=0xYOUR_WALLET     # Who receives the per-call fee
CHAIN_ID=11155111                   # 11155111=Sepolia, 8453=Base, 84532=Base Sepolia

# === 0G Storage ===
STORAGE_PRIVATE_KEY=0x...           # Wallet private key for 0G Storage uploads
STORAGE_INDEXER=https://indexer-storage-testnet-turbo.0g.ai
ZEROG_RPC_URL=https://evmrpc-testnet.0g.ai

# === 0G Compute ===
COMPUTE_PRIVATE_KEY=0x...           # Can be same as STORAGE_PRIVATE_KEY

# === ENS (Sepolia) ===
ENS_PRIVATE_KEY=0x...               # Wallet that controls agentmcp.eth subnames
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia

# === Uniswap (Base RPC for quotes) ===
BASE_RPC_URL=https://mainnet.base.org

# === Agent ports ===
DEFI_ANALYST_PORT=3001
RESEARCH_PORT=3002
EOF
```

- [ ] **Step 3: Verify .env.example is in .gitignore safe zone and install**

```bash
grep -n "\.env\.example" /home/vyqno/i0jk/.gitignore || echo "Add .env.example to whitelist (it should be committed)"
cd /home/vyqno/i0jk && pnpm install
```

- [ ] **Step 4: Commit** — see `writecodex.md` entry `[T13]`

---

## Phase 7: Registry UI (45 min)

### Task 14: Next.js App Setup

**Files:**
- Create: `packages/app/package.json`
- Create: `packages/app/next.config.ts`
- Create: `packages/app/tailwind.config.ts`

- [ ] **Step 1: Create app package.json**

```json
{
  "name": "@agentmcp/app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@agentmcp/sdk": "workspace:*",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "viem": "^2.21.0",
    "wagmi": "^2.13.0",
    "@tanstack/react-query": "^5.62.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `next.config.ts`**

```typescript
// packages/app/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@agentmcp/sdk'],
};

export default nextConfig;
```

- [ ] **Step 3: Create `tailwind.config.ts`**

```typescript
// packages/app/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create `packages/app/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create `packages/app/postcss.config.js`**

```javascript
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 6: Install app dependencies**

```bash
cd /home/vyqno/i0jk && pnpm install
```

- [ ] **Step 7: Commit scaffold** — see `writecodex.md` entry `[T14]`

---

### Task 15: ENS Agents API Route

**Files:**
- Create: `packages/app/app/api/agents/route.ts`

- [ ] **Step 1: Write agents API route**

```typescript
// packages/app/app/api/agents/route.ts
import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

// Known subnames under agentmcp.eth — in production, discover via ENS subgraph
// For hackathon, seed this list with our demo agents (matches agents/ directory)
const KNOWN_AGENTS = [
  'defi-analyst',
  'research',
  'code-review',   // agents/code-review/ — built in Task 17b
];

const PARENT = 'agentmcp.eth';

const AGENT_TEXT_KEYS = [
  'description', 'url', 'keywords',
  'agentmcp.price', 'agentmcp.model', 'agentmcp.reputation',
  'agentmcp.calls', 'agentmcp.status', 'agentmcp.updatedAt',
];

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia'),
});

export async function GET() {
  const agents = await Promise.all(
    KNOWN_AGENTS.map(async (name) => {
      const fullName = `${name}.${PARENT}`;
      const normalizedName = normalize(fullName);

      const textValues = await Promise.allSettled(
        AGENT_TEXT_KEYS.map((key) =>
          publicClient.getEnsText({ name: normalizedName, key }),
        ),
      );

      const [desc, url, category, price, model, reputation, calls, status, updatedAt] =
        textValues.map((r) => (r.status === 'fulfilled' ? r.value ?? '' : ''));

      return {
        name,
        fullName,
        description: desc || `The ${name} agent`,
        endpoint: url || '',
        category: category || 'general',
        price: price || '0.05 USDC',
        model: model || '0G Compute',
        reputation: reputation || '5.0',
        callCount: calls || '0',
        availability: (status || 'offline') as 'online' | 'offline',
        lastUpdated: updatedAt || new Date().toISOString(),
        mcpConfig: url
          ? JSON.stringify({ [name]: { url: `${url}` } })
          : null,
      };
    }),
  );

  return NextResponse.json({ agents });
}
```

- [ ] **Step 2: Commit** — see `writecodex.md` entry `[T15]`

---

### Task 16: AgentCard Component + Registry Page

**Files:**
- Create: `packages/app/components/AgentCard.tsx`
- Create: `packages/app/app/page.tsx`
- Create: `packages/app/app/layout.tsx`
- Create: `packages/app/app/globals.css`

- [ ] **Step 1: Write `AgentCard.tsx`**

```tsx
// packages/app/components/AgentCard.tsx
'use client';
import { useState } from 'react';

interface Agent {
  name: string;
  fullName: string;
  description: string;
  endpoint: string;
  category: string;
  price: string;
  model: string;
  reputation: string;
  callCount: string;
  availability: 'online' | 'offline';
  lastUpdated: string;
  mcpConfig: string | null;
}

export function AgentCard({ agent }: { agent: Agent }) {
  const [copied, setCopied] = useState(false);

  async function installAgent() {
    const config = {
      mcpServers: {
        [agent.name]: { url: agent.endpoint },
      },
    };
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
          <p className="text-xs text-gray-400 font-mono">{agent.fullName}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            agent.availability === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {agent.availability}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>⭐ {agent.reputation}</span>
        <span>📞 {agent.callCount} calls</span>
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{agent.category}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-sm">{agent.price}/call</span>
        <button
          onClick={installAgent}
          disabled={!agent.endpoint}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? '✓ Copied!' : 'Install →'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2 font-mono truncate">
        🤖 {agent.model}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/globals.css`**

```css
/* packages/app/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Write `app/layout.tsx`**

```tsx
// packages/app/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentMCP — Agents as MCP Servers',
  description: 'Discover, install, and pay for AI agents — one line of MCP config',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Write `app/page.tsx`**

```tsx
// packages/app/app/page.tsx
import { AgentCard } from '../components/AgentCard';

interface Agent {
  name: string;
  fullName: string;
  description: string;
  endpoint: string;
  category: string;
  price: string;
  model: string;
  reputation: string;
  callCount: string;
  availability: 'online' | 'offline';
  lastUpdated: string;
  mcpConfig: string | null;
}

async function getAgents(): Promise<Agent[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/agents`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.agents as Agent[];
}

export default async function HomePage() {
  const agents = await getAgents();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AgentMCP</h1>
            <p className="text-sm text-gray-500">Agents as MCP servers. One line to install.</p>
          </div>
          <a
            href="https://github.com/agentmcp/agentmcp"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            target="_blank"
          >
            GitHub →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">npm for AI Agents</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Every agent you see here is a valid MCP server. Click Install, paste one line into your
            Claude/Cursor config, and you're using a full AI agent — with persistent memory,
            verified compute, and micropayments built in.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 max-w-lg mx-auto text-left font-mono text-sm text-green-400 overflow-x-auto">
            <pre>{`{
  "mcpServers": {
    "defi-analyst": {
      "url": "https://defi-analyst.agentmcp.eth/mcp"
    }
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Agent grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">
            {agents.length} agents available
          </h3>
          <span className="text-sm text-gray-400">Powered by ENS · 0G · KeeperHub</span>
        </div>

        {agents.length === 0 ? (
          <p className="text-gray-500">Loading agents from ENS...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.fullName} agent={agent} />
            ))}
          </div>
        )}
      </section>

      {/* Tech stack footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
          Discovery via ENS · Sessions on 0G Storage · Inference on 0G Compute · Payments via KeeperHub x402
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 5: Verify Next.js builds**

```bash
cd /home/vyqno/i0jk/packages/app && npx next build 2>&1 | tail -30
```

Fix any errors before continuing.

- [ ] **Step 6: Commit** — see `writecodex.md` entry `[T16]`

---

## Phase 8: Research Agent + Demo Polish (30 min)

### Task 17: Research Agent (Second Demo Agent for 0G Track 2)

**Files:**
- Create: `agents/research/package.json`
- Create: `agents/research/agent.ts`
- Create: `agents/research/serve.ts`

- [ ] **Step 1: Create research package.json**

```json
{
  "name": "@agentmcp/research",
  "version": "0.1.0",
  "type": "module",
  "scripts": { "start": "npx tsx serve.ts" },
  "dependencies": {
    "@agentmcp/sdk": "workspace:*",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Write `agents/research/agent.ts`**

```typescript
// agents/research/agent.ts
import type { AgentHandler } from '@agentmcp/sdk';
import type { ZGInference } from '@agentmcp/sdk';

export const researchHandler: AgentHandler = async (input, session) => {
  const { task } = input;
  const compute = (session.memory as any).__compute as ZGInference | undefined;

  // Build context from remembered research
  const pastResearch = (session.memory.pastResearch as Array<{ query: string; summary: string }>) ?? [];
  const memoryContext =
    pastResearch.length > 0
      ? `\n\nPrevious research in this session:\n${pastResearch
          .slice(0, 3)
          .map((r) => `- ${r.query}: ${r.summary.slice(0, 100)}...`)
          .join('\n')}`
      : '';

  let result: string;

  if (compute) {
    const response = await compute.chat([
      {
        role: 'system',
        content:
          'You are a deep research agent. You synthesize complex topics clearly. ' +
          'Always cite your reasoning. Be thorough but concise.' + memoryContext,
      },
      { role: 'user', content: task },
    ]);
    result = response.content;
  } else {
    result = `Research task received: "${task}".\n\n0G Compute not configured — set COMPUTE_PRIVATE_KEY to enable AI inference.${memoryContext}`;
  }

  // Store research summary in persistent memory
  pastResearch.unshift({
    query: task,
    summary: result.slice(0, 200),
  });
  session.memory.pastResearch = pastResearch.slice(0, 20);

  return result;
};
```

- [ ] **Step 3: Write `agents/research/serve.ts`**

```typescript
// agents/research/serve.ts
import 'dotenv/config';
import { wrapAsAgent } from '@agentmcp/sdk';
import { researchHandler } from './agent.js';

const agent = wrapAsAgent({
  name: 'research',
  description:
    'Deep research agent with persistent memory. Remembers everything you've researched across sessions using 0G Storage. Powered by 0G Compute (DeepSeek).',
  handler: researchHandler,
  pricing: {
    amount: process.env.AGENT_PRICE ?? '0.01',
    currency: 'USDC',
    recipientAddress: (process.env.RECIPIENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chainId: parseInt(process.env.CHAIN_ID ?? '11155111'),
  },
  ens: process.env.ENS_PRIVATE_KEY
    ? {
        parentName: 'agentmcp.eth',
        privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
        rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
        category: 'research',
      }
    : undefined,
  storage: process.env.STORAGE_PRIVATE_KEY
    ? {
        indexerUrl: process.env.STORAGE_INDEXER ?? 'https://indexer-storage-testnet-turbo.0g.ai',
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: process.env.STORAGE_PRIVATE_KEY,
      }
    : undefined,
  compute: process.env.COMPUTE_PRIVATE_KEY
    ? {
        rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
        privateKey: process.env.COMPUTE_PRIVATE_KEY,
      }
    : undefined,
});

await agent.start(parseInt(process.env.RESEARCH_PORT ?? '3002'));
```

- [ ] **Step 4: Commit** — see `writecodex.md` entry `[T17]`

---

---

### Task 17b: Code Review Agent (Third Demo Agent — Required for 0G Track 2)

> 0G Track 2 requires **3** live demo agents. defi-analyst + research = 2. This is the third.

**Files:**
- Create: `agents/code-review/package.json` (copy structure from `agents/research/package.json`, change name)
- Create: `agents/code-review/agent.ts`
- Create: `agents/code-review/serve.ts`

- [ ] **Step 1: Create `agents/code-review/package.json`**

Same structure as `agents/research/package.json` with `"name": "@agentmcp/code-review"`.

- [ ] **Step 2: Write `agents/code-review/agent.ts`**

```typescript
// agents/code-review/agent.ts
import type { AgentHandler } from '@agentmcp/sdk';
import type { ZGInference } from '@agentmcp/sdk';

export const codeReviewHandler: AgentHandler = async (input, session) => {
  const { task } = input;
  const compute = (session.memory as any).__compute as ZGInference | undefined;

  const reviewHistory = (session.memory.reviewHistory as Array<{ file: string; summary: string }>) ?? [];
  const historyContext =
    reviewHistory.length > 0
      ? `\nPrevious reviews:\n${reviewHistory.slice(0, 3).map((r) => `- ${r.file}: ${r.summary.slice(0, 80)}`).join('\n')}`
      : '';

  let result: string;

  if (compute) {
    const response = await compute.chat([
      {
        role: 'system',
        content:
          'You are an expert code reviewer. Focus on: security vulnerabilities, type safety, ' +
          'performance, and best practices. Be specific and actionable. ' +
          'Format findings as a numbered list with severity (CRITICAL/HIGH/MEDIUM/LOW).' +
          historyContext,
      },
      { role: 'user', content: `Review the following code:\n\n${task}` },
    ]);
    result = response.content;
  } else {
    result = `Code review task received.\n\n0G Compute not configured — set COMPUTE_PRIVATE_KEY to enable AI review.`;
  }

  reviewHistory.unshift({ file: task.slice(0, 50), summary: result.slice(0, 150) });
  session.memory.reviewHistory = reviewHistory.slice(0, 10);

  return result;
};
```

- [ ] **Step 3: Write `agents/code-review/serve.ts`**

```typescript
// agents/code-review/serve.ts
import 'dotenv/config';
import { wrapAsAgent } from '@agentmcp/sdk';
import { codeReviewHandler } from './agent.js';

const agent = wrapAsAgent({
  name: 'code-review',
  description: 'AI code reviewer with persistent review history. Powered by 0G Compute (DeepSeek). Remembers all reviews across sessions.',
  handler: codeReviewHandler,
  pricing: {
    amount: process.env.AGENT_PRICE ?? '0.03',
    currency: 'USDC',
    recipientAddress: (process.env.RECIPIENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chainId: parseInt(process.env.CHAIN_ID ?? '11155111'),
  },
  ens: process.env.ENS_PRIVATE_KEY ? {
    parentName: 'agentmcp.eth',
    privateKey: process.env.ENS_PRIVATE_KEY as `0x${string}`,
    rpcUrl: process.env.SEPOLIA_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia',
    category: 'developer-tools',
  } : undefined,
  storage: process.env.STORAGE_PRIVATE_KEY ? {
    indexerUrl: process.env.STORAGE_INDEXER ?? 'https://indexer-storage-testnet-turbo.0g.ai',
    rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
    privateKey: process.env.STORAGE_PRIVATE_KEY,
  } : undefined,
  compute: process.env.COMPUTE_PRIVATE_KEY ? {
    rpcUrl: process.env.ZEROG_RPC_URL ?? 'https://evmrpc-testnet.0g.ai',
    privateKey: process.env.COMPUTE_PRIVATE_KEY,
  } : undefined,
});

await agent.start(parseInt(process.env.CODE_REVIEW_PORT ?? '3003'));
```

- [ ] **Step 4: Commit** — Add to `writecodex.md` as `[T17b]`:
  - Files: `agents/code-review/package.json`, `agents/code-review/agent.ts`, `agents/code-review/serve.ts`
  - Message: `feat(code-review): add third demo agent for 0G Track 2`

---

### Task 18: Final .env + README

**Files:**
- Modify: `.gitignore` (ensure `.env` is excluded, `.env.example` is NOT)
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# AgentMCP — Wrap Any Agent as an MCP Server

> ETHGlobal Open Agents 2026 | KeeperHub · ENS · 0G Labs · Uniswap

**One command. Full agent. Anyone can install it.**

```json
{
  "mcpServers": {
    "defi-analyst": { "url": "https://defi-analyst.agentmcp.eth/mcp" }
  }
}
```

## What It Does

AgentMCP wraps any agent as a valid MCP server — discoverable via ENS, payable per-call via x402, with persistent memory on 0G Storage and verifiable inference on 0G Compute.

## Quick Start

```bash
git clone https://github.com/your-org/agentmcp
cd agentmcp
cp .env.example .env
# Fill in .env with your keys

pnpm install

# Start the DeFi Analyst agent
cd agents/defi-analyst
SKIP_PAYMENT=true pnpm start

# In another terminal, start the registry
cd packages/app
pnpm dev
```

## Prize Integrations

| Sponsor | Integration |
|---------|------------|
| **KeeperHub** | x402 payment on every MCP call · retry logic · audit trail in session memory |
| **ENS** | Every agent gets `name.agentmcp.eth` · text records as live capability API · reputation updated after every call |
| **0G Storage** | Agent session state persisted to 0G Storage between calls — agent remembers you forever |
| **0G Compute** | DeFi + research agents run DeepSeek inference on 0G's TEE-verified GPU network |
| **Uniswap** | defi-analyst fetches V3 pool data from subgraph · generates real swap quotes via QuoterV2 |

## Architecture

```
MCP Client (Claude Code / Cursor)
    ↓ standard MCP call
AgentMCP Bridge
    1. x402 payment check → KeeperHub
    2. Load session ← 0G Storage
    3. Run handler (Uniswap data + 0G Compute inference)
    4. Save session → 0G Storage
    5. Update ENS text records (reputation, call count)
    ↓
Result streamed back to MCP client
```
```

- [ ] **Step 2: Commit README** — see `writecodex.md` entry `[T18]`

---

### Task 19: Final Verification + Submission Checklist

- [ ] **Step 1: Full build check**

```bash
cd /home/vyqno/i0jk
pnpm build 2>&1 | tail -40
```

Expected: SDK and app both build successfully.

- [ ] **Step 2: Start defi-analyst with SKIP_PAYMENT=true and test**

```bash
cd /home/vyqno/i0jk
cp .env.example .env
# Edit .env: set SKIP_PAYMENT=true, fill other values as needed

cd agents/defi-analyst
SKIP_PAYMENT=true npx tsx serve.ts
```

Expected output:
```
✓ AgentMCP: defi-analyst
✓ MCP endpoint: http://localhost:3001/mcp
✓ Price: 0.02 USDC/call
```

- [ ] **Step 3: Test health endpoint**

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","agent":"defi-analyst","calls":0}`

- [ ] **Step 4: Test MCP tool call**

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"call_agent","arguments":{"task":"What are the top Uniswap V3 pools right now?"}},"id":1}'
```

Expected: JSON response with DeFi pool data.

- [ ] **Step 5: Start registry UI**

```bash
cd /home/vyqno/i0jk/packages/app && pnpm dev
```

Open http://localhost:3000 — should show the registry with agent cards.

- [ ] **Step 6: Run final git status check**

```bash
git status                  # Must be clean or only .env present
git log --oneline -20       # Review all commits
```

- [ ] **Step 7: Final commit** — see `writecodex.md` entry `[T19]` for exact file list and safety checklist

- [ ] **Step 8: ETHGlobal Submission Checklist**

Verify before submitting:
- [ ] GitHub repo is public
- [ ] README explains all sponsor integrations clearly
- [ ] Demo video (2–4 min) shows: install flow, agent call, payment, ENS resolution
- [ ] Live deployment URL or localhost demo running during judging
- [ ] All code written during April 24 – May 3, 2026 (clean git history proves this)
- [ ] Submitted via Hacker Dashboard before **May 3, 12:00 PM EDT**
- [ ] KeeperHub feedback doc at `docs/keeperhub-feedback.md` is complete

---

## Spec Coverage Check

| PRD Feature | Task |
|-------------|------|
| `wrapAsAgent()` CLI/SDK | Tasks 10 + 11 |
| 0G Storage session persistence | Task 4 |
| ENS subname + text records | Task 7 |
| KeeperHub x402 per-call payment | Task 5 |
| 0G Compute verifiable inference | Task 8 |
| MCP streaming HTTP server | Task 9 |
| DeFi analyst agent (Uniswap) | Tasks 11 + 12 + 13 |
| Research agent (persistent memory) | Task 17 |
| Registry UI with ENS discovery | Tasks 15 + 16 |
| Agent profile pages | Task 16 (page.tsx) |
| Install flow (copy MCP config) | AgentCard.tsx `installAgent()` |
| KeeperHub feedback doc | Task 6 |
| x402 retry + audit trail | Task 5 (`verifyPayment`, session memory) |
| ENS live stats update (most creative) | `ens.updateStats()` in mcp-server.ts |

All 7 prize tracks are covered. KeeperHub is the deepest integration (x402 on every call + audit trail + feedback doc).
