'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface TryItWidgetProps {
  agentName: string;
}

export function TryItWidget({ agentName }: TryItWidgetProps) {
  const [task, setTask]       = useState('');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function run() {
    if (!task.trim()) return;
    setLoading(true);
    setResult('');
    setError('');
    try {
      const res = await fetch('/api/try-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, task }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (data.error) throw new Error(data.error);
      setResult(data.result ?? '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-gray-100 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-apple-text">Try It — Demo Mode</h3>
        <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
          No payment
        </span>
      </div>
      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder={`Ask ${agentName} anything…`}
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 resize-none"
      />
      <Button size="sm" onClick={run} disabled={loading || !task.trim()}>
        {loading ? 'Running…' : 'Run →'}
      </Button>
      {result && (
        <pre className="text-xs bg-gray-900 text-green-400 rounded-xl p-3 overflow-auto max-h-48 whitespace-pre-wrap">
          {result}
        </pre>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
