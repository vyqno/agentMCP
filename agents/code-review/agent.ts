// agents/code-review/agent.ts
import type { AgentHandler } from '@agentmcp/sdk';
import type { ZGInference } from '@agentmcp/sdk';

export const codeReviewHandler: AgentHandler = async (input, session) => {
  const { task } = input;
  const compute = (session.memory as any).__compute as ZGInference | undefined;

  const reviewHistory = (session.memory.reviewHistory as Array<{ snippet: string; finding: string }>) ?? [];
  const historyContext = reviewHistory.length > 0
    ? `\n\nPast reviews: ${reviewHistory.slice(0, 3).map((r) => `[${r.snippet}] → ${r.finding}`).join(' | ')}`
    : '';

  let result: string;

  if (compute) {
    const response = await compute.chat([
      {
        role: 'system',
        content:
          'You are an expert code reviewer. Focus on: security vulnerabilities, type safety, ' +
          'performance, and best practices. Format findings as numbered list with severity ' +
          '(CRITICAL/HIGH/MEDIUM/LOW). Be specific and actionable.' + historyContext,
      },
      { role: 'user', content: `Review this code:\n\n${task}` },
    ]);
    result = response.content;
  } else {
    result = `Code review task received.\n\n0G Compute not configured. Set COMPUTE_PRIVATE_KEY to enable AI review.`;
  }

  reviewHistory.unshift({ snippet: task.slice(0, 60), finding: result.slice(0, 150) });
  session.memory.reviewHistory = reviewHistory.slice(0, 10);

  return result;
};
