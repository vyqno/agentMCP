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
