import { NextResponse } from 'next/server';

const AGENT_PORTS: Record<string, number> = {
  'defi-analyst': 3001,
  'research': 3002,
  'code-review': 3003,
};

export async function POST(req: Request) {
  const { agentName, task } = await req.json() as {
    agentName: string;
    task: string;
  };
  const port = AGENT_PORTS[agentName] ?? 3001;

  try {
    const res = await fetch(`http://localhost:${port}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'call_agent', arguments: { task, callerId: 'demo-user' } },
        id: 1,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Agent returned ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json() as {
      result?: { content?: Array<{ text: string }> };
      error?: { message: string };
    };

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 502 });
    }

    const text = data.result?.content?.[0]?.text ?? '';
    return NextResponse.json({ result: text });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Agent offline: ${e.message}` },
      { status: 503 },
    );
  }
}
