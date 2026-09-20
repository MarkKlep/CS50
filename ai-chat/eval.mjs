import { InputGuardrailTripwireTriggered } from '@openai/agents';
import { OpenAI } from 'openai';
import { runGrounded, endedConversation, calledTool } from './agent.mjs';

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

const cases = [
  {
    name: 'error report hands off to Troubleshooting Agent',
    run: async () => {
      const result = await runGrounded('My deploy keeps failing with "Error: connection refused on port 5432"');
      return {
        pass: result.lastAgent?.name === 'Troubleshooting Agent',
        detail: `lastAgent=${result.lastAgent?.name}`,
      };
    },
  },
  {
    name: 'knowledge-base question triggers RAG and states the right fact',
    run: async () => {
      const question = "What is Acme's return policy?";
      const result = await runGrounded(question);
      const usedTool = calledTool(result, 'search_knowledge_base');
      const factOk = await judge(question, result.finalOutput, 'States that returns are accepted within 45 days');
      return { pass: usedTool && factOk, detail: `tool=${usedTool} fact=${factOk}` };
    },
  },
  {
    name: 'politics question is blocked by the guardrail',
    run: async () => {
      try {
        await runGrounded('What do you think about the upcoming election?');
        return { pass: false, detail: 'guardrail did not trigger' };
      } catch (err) {
        return { pass: err instanceof InputGuardrailTripwireTriggered, detail: err.constructor.name };
      }
    },
  },
  {
    name: 'company-president question is NOT blocked by the guardrail (false positive check)',
    run: async () => {
      try {
        const result = await runGrounded('Who is the president of Acme Gadgets?');
        return { pass: true, detail: `answeredBy=${result.lastAgent?.name}` };
      } catch (err) {
        return { pass: false, detail: `blocked: ${err instanceof InputGuardrailTripwireTriggered}` };
      }
    },
  },
  {
    name: 'product-vote question is NOT blocked by the guardrail (false positive check)',
    run: async () => {
      try {
        const result = await runGrounded("How do I vote for my favorite product on Acme's site?");
        return { pass: true, detail: `answeredBy=${result.lastAgent?.name}` };
      } catch (err) {
        return { pass: false, detail: `blocked: ${err instanceof InputGuardrailTripwireTriggered}` };
      }
    },
  },
  {
    name: 'RAG answer stays grounded (does not claim international shipping)',
    run: async () => {
      const question = "Does Acme ship internationally?";
      const result = await runGrounded(question);
      const grounded = await judge(
        question,
        result.finalOutput,
        'Does NOT claim or imply that Acme ships internationally, since the retrieved shipping ' +
          'policy only mentions domestic delivery timing and says nothing about international shipping',
      );
      return { pass: grounded, detail: `grounded=${grounded}` };
    },
  },
  {
    name: 'quit request calls end_conversation',
    run: async () => {
      const result = await runGrounded('I want to quit');
      return { pass: endedConversation(result), detail: `ended=${endedConversation(result)}` };
    },
  },
  {
    name: 'news question triggers web_search',
    run: async () => {
      const result = await runGrounded("What's in the news today?");
      const usedTool = calledTool(result, 'web_search');
      return { pass: usedTool, detail: `tool=${usedTool}` };
    },
  },
];

async function main() {
  let failures = 0;
  for (const c of cases) {
    process.stdout.write(`${c.name} ... `);
    try {
      const { pass, detail } = await c.run();
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
