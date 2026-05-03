// packages/sdk/src/knowledge/sharing.ts
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { StorageConfig, ENSConfig } from '../types.js';
import { ENSIdentity } from '../identity/ens.js';

export interface SharedInsight {
  agentName: string;
  topic: string;
  content: string;
  timestamp: string;
  rootHash?: string;
}

export class KnowledgeSharing {
  private indexer: Indexer;
  private wallet: ethers.Wallet;
  private rpcUrl: string;
  private ens: ENSIdentity | null;

  constructor(storageConfig: StorageConfig, ensConfig?: ENSConfig) {
    this.indexer = new Indexer(storageConfig.indexerUrl);
    const provider = new ethers.JsonRpcProvider(storageConfig.rpcUrl);
    this.wallet = new ethers.Wallet(storageConfig.privateKey, provider);
    this.rpcUrl = storageConfig.rpcUrl;
    this.ens = ensConfig ? new ENSIdentity(ensConfig) : null;
  }

  /** Upload insight to 0G Storage + write root hash to ENS agentmcp.sharedInsight */
  async shareInsight(agentName: string, ensParentName: string, insight: SharedInsight): Promise<string> {
    const tempPath = path.join(os.tmpdir(), `insight-${Date.now()}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(insight, null, 2));

    const file = await ZgFile.fromFilePath(tempPath);
    let rootHash = '';
    try {
      const [tree, treeErr] = await file.merkleTree();
      if (treeErr) throw treeErr;
      rootHash = tree!.rootHash() ?? '';
      if (!rootHash) throw new Error('Null root hash from 0G');

      const [, uploadErr] = await this.indexer.upload(file, this.rpcUrl, this.wallet as any);
      if (uploadErr) throw new Error(`0G upload failed: ${uploadErr.message}`);
    } finally {
      await file.close();
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }

    if (this.ens) {
      const fullName = `${agentName}.${ensParentName}`;
      const record = JSON.stringify({ rootHash, topic: insight.topic, ts: insight.timestamp });
      await this.ens.setText(fullName, 'agentmcp.sharedInsight', record).catch(() => {});
    }

    return rootHash;
  }

  /** Read another agent's insight from their ENS record + download from 0G */
  async consumeInsight(agentName: string, ensParentName: string): Promise<SharedInsight | null> {
    if (!this.ens) return null;

    const fullName = `${agentName}.${ensParentName}`;
    const raw = await this.ens.getText(fullName, 'agentmcp.sharedInsight');
    if (!raw) return null;

    let rootHash: string;
    try {
      const parsed = JSON.parse(raw) as { rootHash: string; topic: string; ts: string };
      rootHash = parsed.rootHash;
    } catch {
      return null;
    }

    const tempPath = path.join(os.tmpdir(), `insight-dl-${Date.now()}.json`);
    try {
      const err = await this.indexer.download(rootHash, tempPath, true);
      if (err) throw err;
      const data = fs.readFileSync(tempPath, 'utf8');
      return JSON.parse(data) as SharedInsight;
    } catch {
      return null;
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}
