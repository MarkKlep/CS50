import fs from 'node:fs/promises';
import path from 'node:path';
import { embed, EMBED_MODEL } from './embeddings.mjs';

const DOCS_DIR = 'docs';
const STORE_PATH = 'data/vector-store.json';
const CHUNK_SIZE = 800;
const OVERLAP = 150;

function chunk(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = [];
  let buf = '';
  for (const p of paragraphs) {
    if (buf && buf.length + p.length + 2 > CHUNK_SIZE) {
      chunks.push(buf);
      buf = buf.slice(-OVERLAP) + '\n\n' + p;
    } else {
      buf = buf ? buf + '\n\n' + p : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

async function main() {
  const files = (await fs.readdir(DOCS_DIR)).filter((f) => /\.(md|txt)$/i.test(f));
  const outChunks = [];

  for (const file of files) {
    const text = await fs.readFile(path.join(DOCS_DIR, file), 'utf8');
    const pieces = chunk(text);
    for (const [i, piece] of pieces.entries()) {
      console.log(`embedding ${file} chunk ${i + 1}/${pieces.length}...`);
      const embedding = await embed(piece);
      outChunks.push({ id: `${file}#${i}`, source: file, chunkIndex: i, text: piece, embedding });
    }
  }

  await fs.mkdir('data', { recursive: true });
  await fs.writeFile(
    STORE_PATH,
    JSON.stringify({ model: EMBED_MODEL, createdAt: new Date().toISOString(), chunks: outChunks }, null, 2),
  );
  console.log(`Ingested ${files.length} files -> ${outChunks.length} chunks -> ${STORE_PATH}`);
}

main();
