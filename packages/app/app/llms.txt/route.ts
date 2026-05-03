import { NextResponse } from 'next/server';

export async function GET() {
  const text = `# AgentMCP — npm for AI agents

AgentMCP wraps any agent as a valid MCP server. Every agent is:
- Discoverable via ENS subname (e.g., defi-analyst.agentmcp.eth)
- Payable per-call via x402 (KeeperHub settlement)
- Memory-persistent via 0G Storage
- AI-verifiable via 0G Compute TEE proofs

## Available Agents

### defi-analyst.agentmcp.eth
Tools: call_agent, get_capabilities, activate_sentinel
Capabilities: Uniswap V3 analysis, swap quotes, autonomous DeFi sentinel via KeeperHub
Price: 0.02 USDC/call

### research.agentmcp.eth
Tools: call_agent, get_capabilities
Capabilities: Deep research with persistent 0G memory, cross-agent knowledge sharing
Price: 0.01 USDC/call

### code-review.agentmcp.eth
Tools: call_agent, get_capabilities
Capabilities: Code review with persistent history via 0G Storage
Price: 0.03 USDC/call

## How to Use (MCP Config)

{
  "mcpServers": {
    "defi-analyst": { "url": "https://defi-analyst.agentmcp.eth/mcp" }
  }
}

## Machine-Readable Registry

GET /.well-known/agent-index.json

## ENS Proof Chain

Every call writes to ENS:
- agentmcp.state   = live state ("processing:task" or "idle")
- agentmcp.proof   = 0G Compute TEE proof hash
- agentmcp.keeper  = KeeperHub workflow ID watching the agent
`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
