import { OpenAI } from 'openai';
import {
  Agent,
  tool,
  OpenAIChatCompletionsModel,
  setDefaultOpenAIClient,
  setTracingDisabled,
} from '@openai/agents';
import { z } from 'zod';

export { InputGuardrailTripwireTriggered } from '@openai/agents';

const MODEL = 'qwen2.5:7b';
const BASE_URL = 'http://localhost:11434/v1';

const client = new OpenAI({ baseURL: BASE_URL, apiKey: 'ollama' });
setDefaultOpenAIClient(client);
setTracingDisabled(true);

const model = new OpenAIChatCompletionsModel(client, MODEL);

// TOOLS
const endChat = tool({
  name: 'end_conversation',
  description: 'Call this when the user says they want to quit, exit, or end the chat.',
  parameters: z.object({}),
  execute: async () => 'Ending the chat now.',
});

const webSearch = tool({
  name: 'web_search',
  description: 'Search the web and return the top result titles for a query.',
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const titles = [...html.matchAll(/result__a"[^>]*>([^<]+)/g)]
      .slice(0, 5)
      .map((m) => m[1]);
    return titles.length ? titles.join('\n') : 'No results found.';
  },
});

function latestUserText(input) {
  if (typeof input === 'string') return input;
  const lastUser = [...input].reverse().find((item) => item.role === 'user');
  return typeof lastUser?.content === 'string' ? lastUser.content : '';
}

// GUARDRAILS
const noPolitics = {
  name: 'no-politics',
  execute: async ({ input }) => {
    const text = latestUserText(input);
    return {
      tripwireTriggered:
        /\b(politic|election|president|government|parliament|senate|congress|vote|voting|democrat|republican|left-wing|right-wing|sanction|geopolit)\w*/i.test(
          text,
        ),
      outputInfo: { checked: text },
    };
  },
};

// AGENTS
const mathTutor = new Agent({
  name: 'Math Tutor',
  model,
  modelSettings: { temperature: 0 },
  instructions: 'You only do arithmetic. Show the steps in one or two lines.',
});

export const triage = new Agent({
  name: 'Triage',
  model,
  modelSettings: { temperature: 0 },
  instructions:
    `
    If the user asks a math question, hand off to the Math Tutor.

    If the user asks for current/live/real-time information (prices, news, scores, dates),
    you must call the web_search tool first and base your answer on its results.

    If the user says they want to quit, exit, leave, or end the chat, call the
    end_conversation tool - don't just say goodbye in text, actually call it.
    Otherwise answer in one sentence.
    
    If the user asks how you're doing or about your mood, say briefly that you're doing well and ready to help.
    `,
  handoffs: [mathTutor],
  tools: [webSearch, endChat],
  inputGuardrails: [noPolitics],
});

export function endedConversation(result) {
  return result.newItems.some(
    (item) => item.rawItem?.type === 'function_call' && item.rawItem.name === 'end_conversation',
  );
}
