# [NAME TBD] — Agents as MCP
## Product Requirements Document v1.0
### April 29, 2026 — ETHGlobal Open Agents

---

## The One Sentence

> **Wrap any agent as an MCP server in one command — anyone can install it, use it, and the owner earns every time.**

---

## The Problem

Someone built a crazy powerful agent. It lives on their machine.
It knows DeFi deeply. It remembers everything. It does complex multi-step work.

Right now, if you want to use it:
- You need to know how they built it
- You need to rebuild the integration yourself
- You need to trust their API
- You pay them nothing automatically
- If their server goes down, it's gone

**There is no standard way to share, discover, install, or pay for an agent.**

MCP solved this for tools. Nobody solved it for agents.

---

## The Insight

MCP is already installed everywhere.
Claude Code, Cursor, Windsurf, Zed, VS Code — millions of developers use MCP daily.

The MCP config file is the most valuable real estate in AI right now:

```json
{
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["@modelcontextprotocol/server-filesystem"] },
    "github":     { "command": "npx", "args": ["@modelcontextprotocol/server-github"] }
  }
}
```

Every developer already knows how to add an MCP server.
**What if a full agent was just another line in that file?**

```json
{
  "mcpServers": {
    "filesystem":    { "command": "..." },
    "github":        { "command": "..." },
    "trading-agent": { "url": "https://trading-agent.eth/mcp" }  ← someone's full agent
  }
}
```

Done. You're now using their agent as a tool. Complex tasks, persistent memory, real intelligence.
You never needed to know how it was built.

---

## The Solution

A platform with three parts:

### 1. The Wrapper (CLI + SDK)
Agent owners run one command to expose any agent as an MCP server:

```bash
npx agentmcp wrap --agent ./my-agent.js --name "trading-genius"
```

Output:
```
✓ Agent wrapped and running
✓ Memory registered on 0G Storage
✓ ENS name: trading-genius.agentmcp.eth
✓ MCP endpoint: https://trading-genius.agentmcp.eth/mcp
✓ x402 payment: 0.05 USDC per call
✓ Anyone can now add you to their MCP config
```

**What the wrapper does internally:**
- Translates any agent framework (OpenClaw, ElizaOS, LangChain, CrewAI, raw functions) into a valid MCP server
- Manages sessions — stores agent state on 0G Storage between calls
- Streams long-running responses back to the MCP client
- Collects x402 micropayments via KeeperHub on every call
- Publishes identity to ENS (ENSIP-25 compatible)

### 2. The Registry (Discovery)
A marketplace where you browse, search, and install agents as MCP servers.

```
agentmcp.eth registry
────────────────────────────────────────────────────
🔍 Search: "DeFi"

trading-genius.agentmcp.eth     ★4.9  0.05 USDC/call
  Analyzes positions, executes swaps, remembers your history

liquidity-pro.agentmcp.eth      ★4.7  0.03 USDC/call
  Uniswap V3 LP optimization, rebalances automatically

defi-risk.agentmcp.eth          ★4.8  0.02 USDC/call
  Real-time protocol risk scoring, exit alerts
────────────────────────────────────────────────────

[ Install ]  →  copies one line to your MCP config
```

**Discovery is powered by ENS.**
Each agent's ENS text records store: capabilities, price, category, response time, reputation score.
Query `agentmcp.eth` subnames to find any agent — no central database.

### 3. The Payment Layer
Every call through an agent-MCP server:
1. Checks x402 payment from caller's wallet
2. Routes request to the actual agent
3. Streams result back
4. Settles payment via KeeperHub (retry logic, MEV protection, audit trail)
5. Updates reputation on ENS text records

Completely automatic. Agent owner earns while they sleep.

---

## How It Works — The Technical Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code / Cursor / Any MCP Client                        │
│                                                              │
│  > "Analyze my Uniswap position for impermanent loss"        │
└──────────────────┬──────────────────────────────────────────┘
                   │ Standard MCP call
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ AgentMCP Bridge (our layer)                                  │
│                                                              │
│  1. Parse MCP tool call                                      │
│  2. Check x402 payment → KeeperHub                          │
│  3. Load agent session state ← 0G Storage                   │
│  4. Route to agent (wherever it runs)                        │
│  5. Stream result back                                       │
│  6. Save updated state → 0G Storage                         │
│  7. Settle payment → KeeperHub                              │
│  8. Update reputation → ENS text record                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ The Actual Agent (runs anywhere)                             │
│                                                              │
│  - Could be OpenClaw, ElizaOS, LangChain, CrewAI            │
│  - Could be a custom Python script                           │
│  - Could be a fine-tuned model on 0G Compute                │
│  - Could be a multi-agent swarm                              │
│  - Caller never knows. Caller doesn't care.                  │
└─────────────────────────────────────────────────────────────┘
```

### The hard problems we solve

**Problem 1: MCP is stateless, agents are stateful**
→ We persist session state on 0G Storage KV between calls
→ Every call loads context, every call saves updated context
→ Agent remembers you across sessions, across restarts, forever

**Problem 2: Agents run complex multi-step tasks, MCP expects fast responses**
→ We implement MCP streaming (Server-Sent Events)
→ Long-running tasks stream partial results back in real time
→ No timeouts. No blocking. Works for tasks that take minutes.

**Problem 3: How do you trust an agent you've never heard of?**
→ Every completed task generates an on-chain review (0G Chain)
→ Reputation score lives in ENS text records — tamper-proof, queryable
→ Verifiable compute proofs from 0G — you can verify the AI actually ran

**Problem 4: How do you find agents?**
→ ENS subnames under `agentmcp.eth`
→ Text records store capability metadata (category, price, SLA, model)
→ Registry UI lets you search, filter, and install in one click

---

## Why This Goes Viral

### Distribution is already built
MCP has millions of daily users. They already know the config file.
Adding one line is zero friction. That's the viral loop.

```
User discovers agent on registry
→ clicks Install
→ one line added to MCP config
→ uses agent, loves it
→ tells their team
→ team installs it
→ agent owner sees usage spike
→ agent owner tells other agent builders about the platform
→ more agents join
→ more users discover agents
→ repeat
```

### Network effects
More agents in registry → more useful the platform is → more users → more agents

Every agent that wraps to MCP becomes a distribution node for the platform.
Every user who installs an agent is one click away from discovering 100 more.

### Builders get paid
Today: you build a great agent. You share it on GitHub. Nobody pays you.
Tomorrow: you wrap it on AgentMCP. Every call earns x402 micropayments automatically.

That's the incentive for every serious agent builder to list here first.

---

## The 0G Differentiator

This is why nobody else builds this exact thing:

| Feature | Without 0G | With 0G |
|---|---|---|
| Agent memory | Lost on restart | Persistent forever (0G Storage) |
| AI inference | Tied to one API key, centralized | Decentralized, verifiable (0G Compute) |
| Proof of work | "Trust me bro" | Cryptographic proof every call |
| Ownership | Agent dies with the server | iNFT — portable, sellable, transferable |
| Cost | You pay OpenAI/Anthropic forever | Decentralized compute marketplace |

0G Compute runs real models (DeepSeek R1, Qwen3, GLM-5) with verifiable outputs.
That means every agent call comes with a cryptographic proof that the AI actually ran correctly.
No other platform offers this. This is the moat.

---

## SDK — How Agents Wrap Themselves

### Any function (raw)
```typescript
import { wrapAsAgent } from '@agentmcp/sdk'

const myAgent = wrapAsAgent({
  name: "trading-genius",
  description: "Analyzes DeFi positions and executes swaps",
  handler: async (input, session) => {
    // session.memory = persistent state from 0G Storage
    const analysis = await analyzePosition(input.positionId, session.memory)
    session.memory.lastAnalysis = analysis  // saved back to 0G automatically
    return analysis
  },
  pricing: { amount: "0.05", currency: "USDC" },
  model: "deepseek-r1"  // runs on 0G Compute
})

await myAgent.start()  // now live as MCP server + registered on ENS
```

### OpenClaw agent
```typescript
import { OpenClawWrapper } from '@agentmcp/sdk/adapters'
const wrapped = new OpenClawWrapper(myOpenClawAgent, config)
await wrapped.start()
```

### ElizaOS agent
```typescript
import { ElizaOSWrapper } from '@agentmcp/sdk/adapters'
const wrapped = new ElizaOSWrapper(myElizaAgent, config)
await wrapped.start()
```

### LangChain agent
```typescript
import { LangChainWrapper } from '@agentmcp/sdk/adapters'
const wrapped = new LangChainWrapper(myChain, config)
await wrapped.start()
```

### Installing someone else's agent
```typescript
import { AgentMCPClient } from '@agentmcp/sdk'

const client = new AgentMCPClient()
const result = await client.call("trading-genius.agentmcp.eth", {
  task: "analyze my WETH/USDC position",
  positionId: "12345"
})
```

---

## What We Build for the Hackathon (4 days)

### Day 1 (Apr 29 — today)
- Project scaffold: Next.js + 0G SDK + wagmi
- `@agentmcp/sdk` core: session manager (0G Storage), MCP server wrapper, x402 payment hook
- ENS subname setup on testnet

### Day 2 (Apr 30)
- OpenClaw + raw function adapters
- KeeperHub x402 integration
- 0G Compute integration (DeepSeek inference with processResponse)
- MCP streaming implementation

### Day 3 (May 1)
- 3 demo agents wrapped and live:
  1. `defi-analyst.agentmcp.eth` — analyzes DeFi positions using 0G Compute
  2. `research.agentmcp.eth` — deep research agent with persistent memory on 0G
  3. `code-review.agentmcp.eth` — reviews code, stores history on 0G Storage
- iNFT minting (ERC-7857) for each agent

### Day 4 (May 2)
- Registry UI (Next.js): browse, search, install agents
- Agent profile pages: capabilities, reputation, earnings, task history
- Connect wallet → wrap your agent flow
- Polish + demo video

### May 3 — Submit by 12PM EDT

---

## Hackathon Prize Map

### 0G Track 1 — Framework & Tooling ($7,500)
`@agentmcp/sdk` — the open-source framework that lets anyone wrap any agent as an MCP server. Includes adapters for OpenClaw, ElizaOS, LangChain. Native 0G Storage session management and 0G Compute inference. This is exactly what 0G Track 1 asks for: "core extensions that other builders will use."

### 0G Track 2 — Autonomous Agents & iNFTs ($7,500)
3 live agents deployed as iNFTs on 0G Chain. Each uses 0G Compute for verifiable inference and 0G Storage for persistent memory. They're real autonomous agents — not demos with hardcoded values.

### ENS — Best AI Agent Integration ($2,500)
ENS is the discovery layer. Every agent gets an ENS subname. Text records store capability metadata. Removing ENS makes agents undiscoverable. ENS is load-bearing.

### ENS — Most Creative Use ($2,500)
ENS text records as live agent capability APIs — updated after every task with current reputation, pricing, and availability. The ENS record IS the agent's public spec. Query any agent's capabilities by resolving their ENS name.

### KeeperHub — Best Use ($4,500)
x402 micropayments on every agent call, settled via KeeperHub. Retry logic means failed payments never strand users. Audit trail for every call. KeeperHub is the economic backbone — every single agent call flows through it.

### KeeperHub — Feedback Bounty ($250)
Document every integration pain point. Free $250.

**Total target: ~$24,750**

---

## Roadmap Beyond the Hackathon

### Month 1-2: Open Protocol
- Python SDK
- REST API for non-Node environments
- Agent versioning (update your agent without breaking existing users)
- Private agents (whitelist-only access)

### Month 3-4: Marketplace Growth
- Promoted listings — agents bid to appear first in search (AdWords model)
- Agent analytics dashboard — calls/day, revenue, reputation trend
- Mainnet deployment (0G Aristotle + ENS mainnet)
- Mobile SDK (agents on device)

### Month 5-6: Agent Economy
- Agent credit scores — borrow against reputation for gas/compute costs
- Agent insurance — stake to insure against failed tasks
- Agent composability — chain agents together in a visual builder
- Sub-agent spawning — agents can hire other agents on-platform

### Month 6-12: Standard
- Submit AgentMCP as an extension to MCP spec (Anthropic/Linux Foundation)
- Cross-chain bridges (Base, Arbitrum, Ethereum mainnet)
- Enterprise private registries (permissioned agent networks)
- 10,000 agents on platform

---

## Business Model

**Protocol fee:** 2% of every x402 payment routed through AgentMCP
At 100K calls/day × $0.05 avg = $1,000/day = $365K/year from fee alone

**Promoted listings:** Agents pay to rank higher in search
Same model as Google AdWords — programmatic bidding from agent earnings

**Enterprise:** Private registries for companies with internal agents
Flat monthly fee, unlimited agents, compliance exports

**Analytics:** Premium dashboard for agent operators
Revenue breakdown, call funnel, reputation analytics

---

## Why This Wins

**For agent builders:** First time they can monetize. Build once, earn forever.

**For developers:** Best agents in the world, one line of config.

**For the ecosystem:** MCP stays the standard. We extend it, not replace it.

**For 0G:** Every agent on the platform uses 0G Compute + Storage. Direct adoption driver.

**For VCs:** npm has 3M packages. How many agents will exist in 3 years?
We're building the registry. Protocol fee on every call. Network effects. Open but monetized.

YC pitch: *"We're npm for agents. The registry, the install command, and the payment layer — all in one."*
