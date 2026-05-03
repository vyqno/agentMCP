<div align="center">

# AgentMCP

### Wrap any agent as an MCP server in one command.
### Anyone can install it. The owner earns every time.

<br/>

[![ETHGlobal Open Agents](https://img.shields.io/badge/ETHGlobal-Open%20Agents%202026-black?style=for-the-badge&logo=ethereum)](https://ethglobal.com/events/openagents)
[![0G Labs](https://img.shields.io/badge/0G%20Labs-%2415%2C000-blue?style=for-the-badge)](https://0g.ai)
[![KeeperHub](https://img.shields.io/badge/KeeperHub-%244%2C750-orange?style=for-the-badge)](https://keeperhub.dev)
[![ENS](https://img.shields.io/badge/ENS-%245%2C000-5298FF?style=for-the-badge)](https://ens.domains)
[![Uniswap](https://img.shields.io/badge/Uniswap-%245%2C000-FF007A?style=for-the-badge)](https://uniswap.org)

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![MCP](https://img.shields.io/badge/MCP-Standard-8B5CF6?style=flat-square)](https://modelcontextprotocol.io)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm)](https://pnpm.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br/>

```json
{
  "mcpServers": {
    "defi-analyst": {
      "url": "https://defi-analyst.agentmcp.eth/mcp"
    }
  }
}
```

**That's it. One line in your MCP config.**
**You just installed a full AI agent with persistent memory,**
**verifiable compute, and per-call micropayments.**

</div>

---

## The Idea — Where It Started

Late April 2026. Three sponsors to pick from: **0G, ENS, KeeperHub**. Had to figure out what to build.

The raw thought that started everything (directly from the original ideation notes):

> *"what if i could just plugin a full trading agent as mcp into my agent via mcp right? by paying via x402 i know it's vague doesn't make sense right now but i am gonna brainstorm"*

It was vague. After research, it clicked.

**MCP is installed everywhere.** Claude Code, Cursor, Windsurf, VS Code — millions of developers use MCP daily. Every entry in the config file is a *tool*. Nobody had made it easy to put a full, stateful, monetized AI *agent* in that file.

Moltbook tried to solve agent discovery — got acquired by Meta in March 2026. Now it's centralized. We build what Meta can't own.

---

## The Problem

Someone built a powerful agent. It knows DeFi deeply. It remembers everything.

Right now, if you want to use it:
- You need to know how they built it
- You need to rebuild the integration yourself
- They earn nothing automatically
- If their server goes down, it's gone forever

**There is no standard way to share, discover, install, or pay for an agent.**
**MCP solved this for tools. Nobody solved it for agents. Until now.**

---

## What We Researched Before Building

We didn't just build. We looked at everything that already exists:

| Existing Solution | Why We Didn't Use It |
|---|---|
| **mcp-agent (lastmile-ai)** | Centralized gateway, no payment, no identity, no memory |
| **DeMCP** | Decentralized MCP but only for LLM API access, not full agents |
| **AgenticMarket** | Centralized marketplace, no autonomy |
| **ERC-8004** | Onchain agent identity only — no compute, no memory, no payments |
| **A2A (Google)** | Agent-to-agent protocol with no payment, no memory, no MCP compatibility |
| **Moltbook** | Social network for agents — acquired by Meta March 2026, now centralized |

**The gap:** A decentralized platform where any agent can be wrapped as an MCP server, discovered via ENS, paid per-call via x402, with memory on decentralized storage and AI verified on decentralized compute.

### Market Context

- YC W26 (194 companies): **41.5% building agent infrastructure** — this is the moment
- 78% of enterprise agent pilots fail — #1 reason: black box decisions
- MCP donated to Linux Foundation by Anthropic (December 2025) — it's the standard
- x402 reached 15M transactions by late 2025
- AI agent market: $7.84B (2025) → $52.62B by 2030 (46% CAGR)

---

## Why These Tech Stacks — Honest Answers

### ENS — We didn't just "store metadata"

Everyone stores metadata in ENS. That's boring. We did something different.

**ENS is the agent's living proof-of-work chain.**

Every single call updates ENS text records in real-time:

```
defi-analyst.agentmcp.eth
  agentmcp.state   = "processing:analyze WETH/USDC pool"  ← LIVE during call
  agentmcp.proof   = "0xd4f8...a291"  ← 0G Compute TEE proof of last call
  agentmcp.keeper  = "wf_sentinel_abc"  ← KeeperHub workflow ID watching 24/7
  agentmcp.price   = "0.02 USDC"
  agentmcp.calls   = "1,247"
  agentmcp.reputation = "4.87"
```

Resolve `defi-analyst.agentmcp.eth` and you get:
1. What the agent is doing **right now**
2. Cryptographic proof its last call ran on real AI
3. The autonomous workflow standing guard over it

**Why not a database?** Meta can acquire a database. Nobody can acquire ENS.

**Why not IPFS?** IPFS is immutable. Agent stats need to update after every call. ENS text records are mutable and on Ethereum.

### 0G — Not just session storage

We could have used IPFS, Arweave, or a database for memory. Here's why we didn't:

| Alternative | Problem |
|---|---|
| IPFS | Content-addressed, immutable — can't update session state |
| Arweave | Permanent, expensive for frequent writes, no compute layer |
| Filecoin | Closest alternative, but no native compute, no TEE verification |
| PostgreSQL | Centralized, defeats the point |

**0G gave us three things at once:**

1. **Storage** — fast KV for agent sessions. Agent remembers you across restarts, forever.
2. **Compute** — TEE-verified inference. Every AI response comes with a cryptographic proof. Not "trust me bro."
3. **Cross-agent knowledge** — agents upload insights to 0G Storage, write root hashes to ENS. Other agents download and use those insights. Decentralized agent-to-agent learning.

The TEE proof is the moat. No other platform gives you that.

### KeeperHub — Not just payment settlement

We run x402 on every MCP call. That's the obvious use. The non-obvious use is the **Autonomous DeFi Sentinel**.

When you call `defi-analyst.agentmcp.eth` and say "watch my WETH position," the agent creates a KeeperHub workflow that runs every 5 minutes, 24/7, completely autonomous:

```
Every 5 minutes on Base:
  1. web3/read-contract → QuoterV2: get WETH/USDC price
  2. compare to your stored entry price (from 0G Storage)
  3. if price < entry * 0.95:
       web3/assess-risk → KeeperHub AI scores the swap calldata
       if risk_score < 40:
         web3/approve-token → approve USDC
         web3/transfer-token → hedge to safe address
         → write to 0G Storage (permanent audit log)
         → update ENS agentmcp.state
```

The agent acts even when nobody is calling it. The workflow ID is stored in `agentmcp.keeper` ENS text record — auditable by anyone.

**Why not Gelato/Chainlink Automation?** They execute smart contracts, not arbitrary AI logic. KeeperHub is the only execution layer that natively understands MCP and x402.

### Uniswap — Real data, real quotes

The DeFi analyst reads live Uniswap V3 pool data from The Graph subgraph and gets real swap quotes via QuoterV2's `staticCall` (no gas, no live transaction).

**Why V3 over V4?** V4 hooks require deploying contracts. V3 is live on Base, has deep liquidity, and The Graph has historical data. For a hackathon agent, V3 is the right call.

### thirdweb — Because crypto UX is still broken

ConnectKit and RainbowKit require MetaMask. thirdweb's embedded wallets let users sign in with email, Google, or Apple ID. No crypto knowledge needed. That's the right UX for 2026.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ MCP Client (Claude Code / Cursor / any MCP host)             │
│                                                              │
│  > "Watch my WETH, protect me if ETH drops 5%"              │
└──────────────────┬──────────────────────────────────────────┘
                   │ Standard MCP call
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ AgentMCP Bridge                                              │
│                                                              │
│  1. x402 check → HTTP 402 with payment spec if no header    │
│  2. Write agentmcp.state = "processing:..." → ENS           │
│  3. Load session ← 0G Storage                               │
│  4. Inject 0G Compute broker (non-enumerable, won't upload) │
│  5. Run handler (Uniswap data + 0G Compute inference)       │
│  6. Save session → 0G Storage (broker excluded)             │
│  7. Write agentmcp.proof + clear state → ENS               │
│  8. Every 10 calls: update reputation stats → ENS           │
└──────────────────┬──────────────────────────────────────────┘
                   │
    ┌──────────────┴──────────────────┐
    ▼                                 ▼
┌──────────────────┐     ┌─────────────────────────────┐
│ activate_sentinel│     │ KeeperHub Autonomous Workflow│
│                  │────▶│                             │
│ User calls once  │     │ Runs every 5 min on Base:   │
│ Agent creates    │     │ 1. Read Uniswap V3 price    │
│ KeeperHub flow   │     │ 2. web3/assess-risk         │
│ workflowId →ENS  │     │ 3. Transfer if triggered    │
└──────────────────┘     │ 4. Log to 0G Storage        │
                         └─────────────────────────────┘
```

---

## What We Actually Built

### `@agentmcp/sdk`

```typescript
import { wrapAsAgent } from '@agentmcp/sdk';

const agent = wrapAsAgent({
  name: 'defi-analyst',
  description: 'Analyzes DeFi positions, executes swaps',
  handler: async (input, session) => {
    // session.memory persists to 0G Storage
    // (session.memory as any).__compute = 0G broker, non-enumerable
    const compute = (session.memory as any).__compute;
    const result = await compute.chat([{ role: 'user', content: input.task }]);
    return result.content;
  },
  pricing: {
    amount: '0.02',
    currency: 'USDC',
    recipientAddress: '0x...',
    chainId: 8453,
  },
  ens:     { parentName: 'agentmcp.eth', privateKey: '0x...', rpcUrl: '...' },
  storage: { indexerUrl: '...', rpcUrl: '...', privateKey: '...' },
  compute: { rpcUrl: '...', privateKey: '...' },
});

await agent.start(3001);
// ✓ MCP endpoint: http://localhost:3001/mcp
// ✓ ENS record published: defi-analyst.agentmcp.eth
// ✓ Live state written on every call
```

**What the SDK handles automatically:**
- MCP HTTP server (StreamableHTTP, session-based — each client gets its own server+transport)
- x402 middleware on POST /mcp AND GET /mcp — 402 response with full payment spec
- 0G Storage session load/save — Merkle tree, upload, download with verification
- 0G Compute injection as non-enumerable property (excluded from JSON serialization to 0G)
- ENS proof chain: state before call → proof hash after → stats every 10 calls
- KeeperHub sentinel creation via `activate_sentinel` tool

### Three Demo Agents

| Agent | Port | What it does |
|---|---|---|
| `defi-analyst.agentmcp.eth` | 3001 | Uniswap V3 pool data + QuoterV2 swap quotes + 0G Compute analysis + KeeperHub sentinel |
| `research.agentmcp.eth` | 3002 | Research with persistent 0G memory + shares insights via ENS for cross-agent consumption |
| `code-review.agentmcp.eth` | 3003 | Code review with persistent history across sessions |

### Platform (Next.js + thirdweb)

| Route | What's there |
|---|---|
| `/` | Apple-style dark hero + agent registry grid |
| `/agent/[name]` | Live ENS state polling every 10s, TryIt widget, Sentinel activation modal |
| `/agent/[name]/proofs` | 0G proof chain — every call's TEE proof hash |
| `/wrap` | 4-step wizard: name → pricing → stack → wallet-signed deploy |
| `/dashboard` | Wallet-gated: earnings, active sentinels, registered agents |
| `/knowledge` | Cross-agent 0G knowledge graph |
| `/api/agent-index.json` | **Machine-readable registry** — AI agents can parse this |
| `/llms.txt` | **LLM-readable docs** — for RAG pipelines |

---

## Prize Coverage

| Track | Prize | Integration Depth |
|---|---|---|
| **KeeperHub Best Use** | $4,500 | x402 on EVERY call · sentinel spawns 24/7 autonomous workflow · risk assessment before execution · audit trail in 0G Storage |
| **KeeperHub Feedback** | $250 | `docs/keeperhub-feedback.md` — 6 specific pain points with concrete SDK suggestions |
| **ENS Best AI Agent** | $2,500 | ENS is the discovery mechanism — remove it and agents are undiscoverable. Load-bearing, not decorative. |
| **ENS Most Creative** | $2,500 | `agentmcp.state` updates *during* execution. The ENS record IS the agent's live public spec. |
| **0G Track 1 (SDK)** | $7,500 | `@agentmcp/sdk` — open-source, works with any agent framework, 0G Storage + Compute native |
| **0G Track 2 (Agents)** | $7,500 | 3 live demo agents using 0G Compute for verified inference + 0G Storage for memory + cross-agent knowledge sharing |
| **Uniswap** | $5,000 | Real V3 pool data from subgraph + real swap quotes via QuoterV2 staticCall (no gas) |
| **Total target** | **~$24,750** | |

---

## Technical Decisions — The Honest Ones

**Why `Object.defineProperty` with `enumerable: false` for the compute broker?**
The 0G Compute broker has circular references and can't serialize to JSON. It's injected into `session.memory` which gets uploaded to 0G Storage. If it serialized, the upload would silently corrupt. `enumerable: false` means `JSON.stringify` skips it entirely. The handler accesses it via `(session.memory as any).__compute`.

**Why lazy import for `@0glabs/0g-serving-broker`?**
Node v24 has ESM interop issues with this package at module load time. Even if you don't use 0G Compute (no `COMPUTE_PRIVATE_KEY`), a top-level import crashes the process. Moved inside `init()` — only loads when actually needed.

**Why session-based transport management for MCP?**
First version created a new `McpServer` and connected it to a new transport on every HTTP request. Crashes on the second request: "Already connected to a transport." Fix: `Map<sessionId, transport>` where each client session gets its own persistent server+transport pair.

**Why `wallet as any` cast in 0G Storage?**
The 0G SDK bundles its own CJS version of ethers. This project uses ESM ethers. Both are v6, structurally identical at runtime, but TypeScript's nominal type system sees `Network#private` as different. The cast is safe — it's a module resolution artifact, not a behavioral difference.

**Why pnpm workspaces over npm/yarn?**
Agents need `@agentmcp/sdk` as a local dependency. pnpm's `workspace:*` protocol resolves to the local package automatically. With npm you'd need `npm link` or publish to a registry. pnpm also handles the complex peer dependency tree (ethers v6, 0G SDK, thirdweb, viem) without conflicts.

**Why StreamableHTTP and not stdio?**
Remote agents don't work over stdio — stdio requires a local process. StreamableHTTP lets you add `{ "url": "..." }` to your MCP config and use someone else's agent without running their code locally. That's the entire premise of this project.

---

## What "Decentralized" Actually Means Here

This isn't blockchain theater.

- **Discovery**: ENS subnames on Ethereum. If our servers go down tomorrow, `defi-analyst.agentmcp.eth` still resolves to an endpoint.
- **Memory**: 0G Storage. Distributed across storage nodes. Merkle-proofed. You can verify the content hash yourself.
- **Compute**: 0G Compute with TEE verification. The AI ran correctly or the cryptographic proof is invalid.
- **Payments**: x402 → KeeperHub → onchain settlement. Every payment is a transaction. Every cent is auditable.
- **Identity**: ENS names are transferable NFTs. You can sell your agent's identity and reputation.

The part that's NOT decentralized yet: the MCP server process itself runs somewhere (localhost or a VPS). That's by design — agents need compute to run. But discovery, identity, memory, and payments are fully on-chain.

---

## Quick Start

```bash
git clone https://github.com/your-org/agentmcp
cd agentmcp
cp .env.example .env
# Minimum: set SKIP_PAYMENT=true

pnpm install

# Start DeFi analyst (port 3001)
cd agents/defi-analyst
SKIP_PAYMENT=true npx tsx serve.ts

# Start registry UI (port 3000)
cd packages/app
pnpm dev
```

**Add to your MCP config:**

```json
{
  "mcpServers": {
    "defi-analyst": { "url": "http://localhost:3001/mcp" },
    "research":      { "url": "http://localhost:3002/mcp" },
    "code-review":   { "url": "http://localhost:3003/mcp" }
  }
}
```

### Environment Variables

```bash
# Minimum (local dev)
SKIP_PAYMENT=true
AGENT_PRICE=0.02
RECIPIENT_ADDRESS=0xYOUR_WALLET

# 0G Storage + Compute (Galileo testnet)
STORAGE_PRIVATE_KEY=0x...
ZEROG_RPC_URL=https://evmrpc-testnet.0g.ai
STORAGE_INDEXER=https://indexer-storage-testnet-turbo.0g.ai
COMPUTE_PRIVATE_KEY=0x...    # can be same as STORAGE_PRIVATE_KEY

# ENS (Sepolia)
ENS_PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia

# Uniswap quotes (Base)
BASE_RPC_URL=https://mainnet.base.org

# KeeperHub sentinel
KEEPERHUB_API_KEY=...
KEEPERHUB_API_URL=https://app.keeperhub.dev

# Frontend
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=...
```

---

## Project Structure

```
agentmcp/
├── packages/
│   ├── sdk/                      @agentmcp/sdk
│   │   └── src/
│   │       ├── core/
│   │       │   └── mcp-server.ts    MCP HTTP server, session management
│   │       ├── payment/
│   │       │   └── x402.ts          KeeperHub x402 middleware
│   │       ├── session/
│   │       │   └── storage.ts       0G Storage session manager
│   │       ├── identity/
│   │       │   └── ens.ts           ENS proof chain writer
│   │       ├── compute/
│   │       │   └── inference.ts     0G Compute broker (lazy, TEE-first)
│   │       ├── sentinel/
│   │       │   └── keeper.ts        KeeperHub autonomous workflow
│   │       └── knowledge/
│   │           └── sharing.ts       0G cross-agent knowledge sharing
│   └── app/                      Next.js platform UI
│       └── app/
│           ├── page.tsx              Registry homepage
│           ├── agent/[name]/         Agent detail + proof chain
│           ├── wrap/                 4-step wrap wizard
│           ├── dashboard/            Owner dashboard
│           ├── knowledge/            Cross-agent knowledge graph
│           └── api/
│               ├── agents/[name]/    Single agent ENS read
│               ├── sentinel/[name]/  Create KeeperHub sentinel
│               ├── agent-index.json/ Machine-readable registry
│               ├── try-agent/        TryIt proxy (demo mode)
│               └── llms.txt/         LLM-readable docs
├── agents/
│   ├── defi-analyst/             Uniswap V3 + 0G + KeeperHub sentinel
│   ├── research/                 0G memory + knowledge sharing
│   └── code-review/              Persistent review history
└── docs/
    ├── PRD.md                    Product requirements
    ├── brainstorm/               Research session (April 29)
    └── keeperhub-feedback.md     Integration feedback ($250 bounty)
```

---

## Built At

**ETHGlobal Open Agents 2026** — April 24 – May 3, 2026

Solo build. Started from a vague 11:28 PM note: *"what if agents as mcp?"*

Day 1: Research what already exists. Found the gap.
Day 2–3: Built the SDK — x402, 0G Storage, 0G Compute, ENS, MCP server.
Day 4: Three demo agents. KeeperHub sentinel. Cross-agent knowledge.
Day 5: Platform UI — Apple-like, thirdweb wallet, live ENS polling.

The original messy thinking is in `raw-ideation.md`. The research session is in `docs/brainstorm/2026-04-29-session-brainstorm.md`. You can trace the full journey from "I don't know if this is buildable" to working product.

---

<div align="center">

**"We're npm for agents. The registry, the install command, and the payment layer — all in one."**

<br/>

[![Submit to ETHGlobal](https://img.shields.io/badge/ETHGlobal-Open%20Agents%202026-black?style=for-the-badge&logo=ethereum)](https://ethglobal.com/events/openagents)

</div>
