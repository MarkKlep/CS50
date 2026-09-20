import fs from 'node:fs/promises';
import { InputGuardrailTripwireTriggered } from '@openai/agents';
import { OpenAI } from 'openai';
import { runGrounded, endedConversation, calledTool } from './agent.mjs';

const GOLDEN_SET_PATH = 'golden-set.json';
const JUDGE_MODEL = 'qwen2.5:7b';
const judgeClient = new OpenAI({ baseURL: 'http://localhost:11434/v1', apiKey: 'ollama' });

// Uses the LLM itself to grade free-form answer quality, since local model
// output isn't identical run to run and can't be checked with exact-match.
async function judge(question, answer, criteria) {
  const res = await judgeClient.chat.completions.create({
    model: JUDGE_MODEL,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Question: ${question}\nAnswer: ${answer}\nCriteria: ${criteria}\nDoes the answer satisfy the criteria? Reply with exactly one word: PASS or FAIL.`,
      },
    ],
  });
  return res.choices[0].message.content.trim().toUpperCase().startsWith('PASS');
}

// Runs one golden-set case and checks every field present in its `expect`
// block. Each case is pure data (see golden-set.json) - this is the only
// place that knows how to turn an `expect` field into an actual check.
async function evaluate({ input, expect }) {
  const checks = [];
  let result = null;
  let blocked = false;

  try {
    result = await runGrounded(input);
  } catch (err) {
    if (err instanceof InputGuardrailTripwireTriggered) blocked = true;
    else throw err;
  }

  if (expect.blocked !== undefined) {
    checks.push({ ok: blocked === expect.blocked, detail: `blocked=${blocked}` });
  }
  if (blocked) return checks;

  if (expect.agent) {
    checks.push({ ok: result.lastAgent?.name === expect.agent, detail: `agent=${result.lastAgent?.name}` });
  }
  if (expect.toolCalled) {
    const used = calledTool(result, expect.toolCalled);
    checks.push({ ok: used, detail: `tool(${expect.toolCalled})=${used}` });
  }
  if (expect.endsConversation !== undefined) {
    const ended = endedConversation(result);
    checks.push({ ok: ended === expect.endsConversation, detail: `ended=${ended}` });
  }
  if (expect.criteria) {
    const ok = await judge(input, result.finalOutput, expect.criteria);
    checks.push({ ok, detail: `criteria=${ok}` });
  }

  return checks;
}

async function main() {
  const cases = JSON.parse(await fs.readFile(GOLDEN_SET_PATH, 'utf8'));
  let failures = 0;

  for (const c of cases) {
    process.stdout.write(`${c.id} ... `);
    try {
      const checks = await evaluate(c);
      const pass = checks.every((chk) => chk.ok);
      const detail = checks.map((chk) => chk.detail).join(', ');
      console.log(pass ? `PASS (${detail})` : `FAIL (${detail})`);
      if (!pass) failures++;
    } catch (err) {
      console.log(`ERROR (${err.message})`);
      failures++;
    }
  }

  console.log(`\n${cases.length - failures}/${cases.length} passed`);
  process.exitCode = failures ? 1 : 0;
}

main();
