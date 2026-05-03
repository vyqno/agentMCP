export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-apple-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-apple-sub">
        <span>AgentMCP — npm for AI agents</span>
        <span className="flex flex-wrap gap-x-4 gap-y-2">
          <span>Discovery: ENS</span>
          <span>Memory: 0G</span>
          <span>Payments: KeeperHub x402</span>
        </span>
      </div>
    </footer>
  );
}
