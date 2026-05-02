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
      if (!rootHash) throw new Error('0G merkleTree returned null rootHash');

      // Cast needed: 0G SDK bundles CJS ethers while this package uses ESM ethers —
      // the Signer types are structurally identical at runtime but nominally distinct.
      const [, uploadErr] = await this.indexer.upload(file, this.rpcUrl, this.wallet as never);
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
