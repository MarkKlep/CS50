import { OpenAI } from 'openai';

export const EMBED_MODEL = 'nomic-embed-text';
const BASE_URL = 'http://localhost:11434/v1';

const client = new OpenAI({ baseURL: BASE_URL, apiKey: 'ollama' });

export async function embed(text) {
  const res = await client.embeddings.create({ model: EMBED_MODEL, input: text });
  return res.data[0].embedding;
}
