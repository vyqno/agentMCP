// packages/sdk/src/core/mcp-server.ts
import express, { type Request, type Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import type { AgentConfig, AgentSession } from '../types.js';
import { SessionStorage } from '../session/storage.js';
import { x402Middleware } from '../payment/x402.js';
import { ENSIdentity } from '../identity/ens.js';
import { ZGInference } from '../compute/inference.js';

export class AgentMCPServer {
  private app: ReturnType<typeof express>;
  private httpServer: import('http').Server | null = null;
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

    if (config.storage) this.session = new SessionStorage(config.storage);
    if (config.ens) this.ens = new ENSIdentity(config.ens);
    if (config.compute) this.compute = new ZGInference(config.compute);

    this.registerTools();
    this.setupRoutes();
  }

  private registerTools(): void {
    this.mcpServer.tool(
      'call_agent',
      `Call the ${this.config.name} agent. ${this.config.description}`,
      {
        task: z.string().describe('The task or question for this agent'),
        callerId: z.string().optional().describe('Caller ID for session continuity'),
      },
      async ({ task, callerId = 'anonymous' }) => {
        const agentSession: AgentSession = this.session
          ? await this.session.load(this.config.name, callerId)
          : this.emptySession(callerId);

        // CRITICAL: inject compute via non-enumerable property so JSON.stringify excludes it
        // This prevents the broker object from being serialized and uploaded to 0G Storage
        if (this.compute) {
          Object.defineProperty(agentSession.memory, '__compute', {
            value: this.compute,
            enumerable: false,
            writable: true,
            configurable: true,
          });
        }

        const result = await this.config.handler({ task }, agentSession);

        if (this.session) await this.session.save(agentSession);

        // Update ENS stats every 10 calls — non-blocking
        this.callCount += 1;
        if (this.ens && this.config.ens && this.callCount % 10 === 0) {
          const fullName = `${this.config.name}.${this.config.ens.parentName}`;
          this.ens.updateStats(fullName, agentSession.callCount, agentSession.reputationScore)
            .catch(console.error);
        }

        return { content: [{ type: 'text' as const, text: result }] };
      },
    );

    this.mcpServer.tool(
      'get_capabilities',
      `Get current capabilities, pricing, and reputation of ${this.config.name}`,
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
        return { content: [{ type: 'text' as const, text: JSON.stringify(record, null, 2) }] };
      },
    );
  }

  private setupRoutes(): void {
    this.app.get('/health', (_, res) => {
      res.json({ status: 'ok', agent: this.config.name, calls: this.callCount });
    });

    // MCP endpoint — x402 required on both POST and GET
    this.app.post('/mcp', x402Middleware(this.config.pricing), async (req: Request, res: Response) => {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
      await this.mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });

    this.app.get('/mcp', x402Middleware(this.config.pricing), async (req: Request, res: Response) => {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
      await this.mcpServer.connect(transport);
      await transport.handleRequest(req, res);
    });
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
    const http = await import('http');
    this.httpServer = http.createServer(this.app);

    return new Promise((resolve) => {
      this.httpServer!.listen(port, async () => {
        console.log(`\n✓ AgentMCP: ${this.config.name}`);
        console.log(`✓ MCP endpoint: http://localhost:${port}/mcp`);
        console.log(`✓ Price: ${this.config.pricing.amount} ${this.config.pricing.currency}/call`);

        if (this.ens && this.config.ens) {
          const fullName = `${this.config.name}.${this.config.ens.parentName}`;
          this.ens.publishAgentRecord(fullName, {
            description: this.config.description,
            endpoint: `http://localhost:${port}/mcp`,
            category: this.config.ens.category ?? 'general',
            price: `${this.config.pricing.amount} ${this.config.pricing.currency}`,
            model: this.config.compute ? '0G Compute / DeepSeek' : 'custom',
            reputation: '5.0',
            callCount: '0',
            availability: 'online',
            lastUpdated: new Date().toISOString(),
          }).catch((e: Error) => console.warn('ENS publish failed (non-fatal):', e.message));
        }

        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.ens && this.config.ens) {
      const fullName = `${this.config.name}.${this.config.ens.parentName}`;
      await this.ens.setText(fullName, 'agentmcp.status', 'offline').catch(() => {});
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
