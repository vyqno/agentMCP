# Codex Commit Reference

> All commit instructions for the AgentMCP implementation plan.
> Codex: use this file as your commit map. Execute each entry after completing the corresponding task.

## Rules
- Add files by EXACT path — never `git add -A` or `git add .`
- Verify `git status` shows no `.env` or `node_modules` before every commit
- Run `pnpm build` before each phase-end commit to catch type errors
- Commit messages must not mention any AI assistant or tool name

---

## Commit Map

### [T1] Monorepo root setup
**Files:**
```
package.json
pnpm-workspace.yaml
tsconfig.base.json
.gitignore
```
**Message:** `chore: monorepo root setup with pnpm workspaces`

---

### [T2] SDK package scaffold
**Files:**
```
packages/sdk/package.json
packages/sdk/tsconfig.json
```
**Message:** `chore: add @agentmcp/sdk package scaffold`

---

### [T3] Core type definitions
**Files:**
```
packages/sdk/src/types.ts
```
**Message:** `feat(sdk): add core type definitions`

---

### [T4] 0G Storage session manager
**Files:**
```
packages/sdk/src/session/storage.ts
```
**Message:** `feat(sdk): add 0G Storage session manager`

---

### [T5] KeeperHub x402 middleware
**Files:**
```
packages/sdk/src/payment/x402.ts
```
**Message:** `feat(sdk): add x402 payment middleware`

---

### [T6] KeeperHub feedback doc
**Files:**
```
docs/keeperhub-feedback.md
```
**Message:** `docs: add KeeperHub integration feedback`

---

### [T7] ENS identity layer
**Files:**
```
packages/sdk/src/identity/ens.ts
```
**Message:** `feat(sdk): add ENS identity layer with live text record updates`

---

### [T8] 0G Compute inference wrapper
**Files:**
```
packages/sdk/src/compute/inference.ts
```
**Message:** `feat(sdk): add 0G Compute inference wrapper`

---

### [T9] MCP HTTP server
**Files:**
```
packages/sdk/src/core/mcp-server.ts
```
**Message:** `feat(sdk): add Express MCP HTTP server with all integrations wired`

---

### [T10] SDK public API + build
**Files:**
```
packages/sdk/src/index.ts
packages/sdk/dist/
```
**Message:** `feat(sdk): export public API and build dist`

---

### [T11] DeFi analyst package + Uniswap utilities
**Files:**
```
agents/defi-analyst/package.json
agents/defi-analyst/tsconfig.json
agents/defi-analyst/uniswap.ts
```
**Message:** `feat(defi-analyst): add Uniswap V3 pool data and quote utilities`

---

### [T12] DeFi analyst agent handler
**Files:**
```
agents/defi-analyst/agent.ts
```
**Message:** `feat(defi-analyst): add agent handler with Uniswap V3 and 0G Compute`

---

### [T13] DeFi analyst serve + .env.example
**Files:**
```
agents/defi-analyst/serve.ts
.env.example
```
**Message:** `feat(defi-analyst): add serve.ts and .env.example`

---

### [T14] Next.js app scaffold
**Files:**
```
packages/app/package.json
packages/app/next.config.ts
packages/app/tailwind.config.ts
packages/app/tsconfig.json
packages/app/postcss.config.js
```
**Message:** `feat(app): scaffold Next.js registry UI`

---

### [T15] ENS agents discovery API
**Files:**
```
packages/app/app/api/agents/route.ts
```
**Message:** `feat(app): add ENS agents discovery API route`

---

### [T16] Registry UI pages + components
**Files:**
```
packages/app/components/AgentCard.tsx
packages/app/app/layout.tsx
packages/app/app/globals.css
packages/app/app/page.tsx
```
**Message:** `feat(app): add registry UI with ENS-powered agent grid`

---

### [T17] Research agent
**Files:**
```
agents/research/package.json
agents/research/agent.ts
agents/research/serve.ts
```
**Message:** `feat(research): add research agent with 0G persistent memory`

---

### [T17b] Code review agent (third demo agent — required for 0G Track 2)
**Files:**
```
agents/code-review/package.json
agents/code-review/agent.ts
agents/code-review/serve.ts
```
**Message:** `feat(code-review): add third demo agent for 0G Track 2`

---

### [T18] README
**Files:**
```
README.md
```
**Message:** `docs: add README with architecture and integration summary`

---

### [T19] Final verification commit
**Before committing:** Run `pnpm build`, confirm zero errors, run health check.
**Files:** Any remaining unstaged changes (check `git status` carefully)
**Message:** `chore: pre-submission final state`

---

## Safety Review Checklist (run before T19)

Codex: before the final commit, verify each item:

- [ ] No `.env` file staged or committed anywhere in git history
- [ ] No private keys, API keys, or secrets in any source file
- [ ] All `AgentHandler` functions return `Promise<string>` — no unhandled rejections
- [ ] `file.close()` is always in a `finally` block in `storage.ts`
- [ ] `processResponse()` is called after EVERY fetch to the 0G compute endpoint
- [ ] x402Middleware is applied to ALL `/mcp` POST routes — no bypass path exists
- [ ] `.env.example` contains only placeholder values, never real keys
- [ ] `pnpm build` exits 0 with zero TypeScript errors
- [ ] `GET /health` responds without payment check
- [ ] `POST /mcp` returns 402 when `SKIP_PAYMENT` is not set and `X-Payment` header is missing
- [ ] ENS `setText` calls use `normalize()` on all names before namehash
- [ ] `indexer.download()` is always wrapped in try/catch (can throw, not just return error)
- [ ] `ethers.JsonRpcProvider` is used (v6 syntax) — never `ethers.providers.JsonRpcProvider`
- [ ] Uniswap `quoteExactInputSingle` uses `.staticCall()` — never sends a real transaction for quotes
- [ ] Session `memory.__compute` is defined with `enumerable: false` via `Object.defineProperty` — confirm it does NOT appear in `JSON.stringify(session.memory)`
- [ ] `GET /mcp` route has `x402Middleware` — same as POST (confirmed in setupRoutes)
- [ ] `processResponse()` is called on BOTH success AND failure paths in `inference.ts`
- [ ] All three demo agents exist: `agents/defi-analyst/`, `agents/research/`, `agents/code-review/`

---

## Post-Implementation Codex Review Steps

After all 19 tasks are committed, run:

```bash
# 1. Full build
pnpm build

# 2. Type check all packages
pnpm typecheck

# 3. Start defi-analyst in dev mode
SKIP_PAYMENT=true node agents/defi-analyst/serve.ts

# 4. Smoke test MCP endpoint
curl http://localhost:3001/health
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'

# 5. Test 402 flow (without SKIP_PAYMENT)
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
# Expected: HTTP 402 with X-Payment-Required in response body

# 6. Registry UI
cd packages/app && pnpm dev
# Open http://localhost:3000 — verify agent cards render
```

If any step fails, investigate and fix before the final commit.
