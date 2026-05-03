'use client';

import Link from 'next/link';
import { ConnectButton } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '../../lib/thirdweb';

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google', 'apple', 'discord'] } }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('walletConnect'),
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold text-apple-text text-[17px] tracking-tight">
            AgentMCP
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[15px] text-apple-sub">
            <Link href="/" className="hover:text-apple-text transition-colors">
              Registry
            </Link>
            <Link href="/wrap" className="hover:text-apple-text transition-colors">
              Wrap Agent
            </Link>
            <Link href="/knowledge" className="hover:text-apple-text transition-colors">
              Knowledge
            </Link>
            <Link href="/dashboard" className="hover:text-apple-text transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
        <ConnectButton
          client={thirdwebClient}
          wallets={wallets}
          theme="light"
          connectButton={{
            label: 'Connect',
            style: {
              borderRadius: '980px',
              fontSize: '14px',
              padding: '8px 18px',
              background: '#000',
              color: '#fff',
            },
          }}
          detailsButton={{ style: { borderRadius: '980px', fontSize: '14px' } }}
        />
      </div>
    </nav>
  );
}
