import readline from 'node:readline';
import { triage, endedConversation, InputGuardrailTripwireTriggered } from './agent.mjs';
import { run } from '@openai/agents';

runChat();

async function runChat() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt('\n> ');
  rl.prompt();

  let history = [];

  for await (const line of rl) {
    const prompt = line.trim();
    if (!prompt) continue;

    if (/^(exit|end|quit|q|bye)$/i.test(prompt)) break;

    history.push({ role: 'user', content: prompt });

    try {
      const result = await run(triage, history);
      console.log('answered by:', result.lastAgent?.name);
      console.log(result.finalOutput);

      history = result.history;
      if (endedConversation(result)) break;
    } catch (err) {
      if (err instanceof InputGuardrailTripwireTriggered) {
        console.log('blocked by guardrail:', err.result.guardrail.name);
      } else {
        throw err;
      }
    }

    if (!rl.closed) rl.prompt();
  }

  rl.close();
}
