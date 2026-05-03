'use client';

import Link from 'next/link';
import { ConnectButton } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { hasThirdwebClientId, thirdwebClient } from '../../lib/thirdweb';

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google', 'apple', 'discord'] } }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('walletConnect'),
];

const navLinks = [
  { href: '/', label: 'Registry' },
  { href: '/wrap', label: 'Wrap Agent' },
  { href: '/knowledge', label: 'Knowledge' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6 py-3 md:h-14 md:py-0 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-8">
          <Link href="/" className="font-semibold text-apple-text text-[17px] tracking-tight">
            AgentMCP
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[15px] text-apple-sub">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-apple-text transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex md:hidden items-center gap-4 overflow-x-auto text-[14px] text-apple-sub">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="shrink-0 hover:text-apple-text transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          {hasThirdwebClientId ? (
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
          ) : (
            <span className="shrink-0 rounded-pill bg-apple-gray2 px-4 py-2 text-xs font-medium text-apple-sub">
              Set thirdweb client
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
