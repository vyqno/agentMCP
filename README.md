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

AgentMCP wraps any agent as a valid MCP server — discoverable via ENS subnames, payable per-call via x402, with persistent memory on 0G Storage and verifiable inference on 0G Compute.

## Quick Start

```bash
git clone https://github.com/your-org/agentmcp
cd agentmcp
cp .env.example .env
# Edit .env: set SKIP_PAYMENT=true for local testing

pnpm install

# Start the DeFi Analyst agent
cd agents/defi-analyst
SKIP_PAYMENT=true npx tsx serve.ts

# In another terminal, start the registry
cd packages/app && pnpm dev
```

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

## Prize Integrations

| Sponsor | Integration |
|---------|------------|
| **KeeperHub** | x402 on every MCP call · 402 response with payment spec · audit trail in session · feedback doc at `docs/keeperhub-feedback.md` |
| **ENS** | Every agent gets `name.agentmcp.eth` · text records updated after every 10 calls · reputation + price + endpoint queryable by name |
| **0G Storage** | Session state (memory, call history) persisted to 0G Storage — agent remembers you across restarts |
| **0G Compute** | DeFi, research, and code-review agents run DeepSeek on 0G's TEE-verified GPU network |
| **Uniswap** | `defi-analyst` fetches V3 pool data from subgraph · generates real swap quotes via QuoterV2 StaticCall |

## Demo Agents

| Agent | Port | Category | Price |
|-------|------|----------|-------|
| `defi-analyst.agentmcp.eth` | 3001 | DeFi | 0.02 USDC/call |
| `research.agentmcp.eth` | 3002 | Research | 0.01 USDC/call |
| `code-review.agentmcp.eth` | 3003 | Dev Tools | 0.03 USDC/call |

## SDK Usage

```typescript
import { wrapAsAgent } from '@agentmcp/sdk';

const agent = wrapAsAgent({
  name: 'my-agent',
  description: 'What my agent does',
  handler: async (input, session) => {
    // session.memory persists to 0G Storage
    session.memory.lastQuery = input.task;
    return 'result';
  },
  pricing: { amount: '0.05', currency: 'USDC', recipientAddress: '0x...', chainId: 8453 },
});

await agent.start(3001);
```

## Environment Variables

See `.env.example` for full configuration reference.
