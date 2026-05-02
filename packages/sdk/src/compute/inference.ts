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
  // Using 'any' for broker field because ZGComputeNetworkBroker's inference sub-API
  // returns complex generic types that don't narrow cleanly via ReturnType<typeof createZGComputeNetworkBroker>.
  // The runtime shape is stable; we only call well-known methods.
  private broker: any = null;
  private providerAddress: string | null = null;
  private providerModel: string | null = null;
  private isTeeVerified = false;
  private initialized = false;

  constructor(private config: ComputeConfig) {}

  async init(): Promise<void> {
    if (this.initialized) return;

    const provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    const wallet = new ethers.Wallet(this.config.privateKey, provider);
    // Cast: 0G SDK bundles CJS ethers; this package uses ESM ethers.
    // Types are nominally distinct but structurally identical at runtime.
    this.broker = await createZGComputeNetworkBroker(wallet as any);

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
