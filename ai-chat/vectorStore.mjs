import fs from 'node:fs/promises';

const STORE_PATH = 'data/vector-store.json';

// Cached after first read; only changes via `npm run ingest`, which requires a server restart to pick up.
let cached = null;

async function loadStore() {
  if (cached) return cached;
  let raw;
  try {
    raw = await fs.readFile(STORE_PATH, 'utf8');
  } catch {
    throw new Error('Vector store not found. Run `npm run ingest` first.');
  }
  cached = JSON.parse(raw);
  return cached;
}

function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function search(queryEmbedding, topK = 4) {
  const { chunks } = await loadStore();
  return chunks
    .map((c) => ({ source: c.source, text: c.text, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
