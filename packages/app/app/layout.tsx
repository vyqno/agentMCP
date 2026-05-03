import type { Metadata } from 'next';
import { ThirdwebProvider } from 'thirdweb/react';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentMCP — Agents as MCP Servers',
  description: 'Discover, install, and pay for AI agents — one line of MCP config',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-apple-gray font-sans antialiased min-h-screen flex flex-col">
        <ThirdwebProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThirdwebProvider>
      </body>
    </html>
  );
}
