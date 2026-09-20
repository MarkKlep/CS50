# ai-chat Project Overview

ai-chat is a small chat application built on the OpenAI Agents SDK
(`@openai/agents`), running entirely against a local Ollama server instead of
OpenAI's cloud API. The chat model is `qwen2.5:7b`, served from
`http://localhost:11434/v1`.

## Architecture

The app has two entry points that both drive the same `triage` agent defined
in `agent.mjs`:

- `server.mjs` — an Express server exposing a single `POST /chat` route,
  used by the static front end in `public/index.html`.
- `subagent.mjs` — a command-line chat loop using the same agent.

The `triage` agent is the main entry point for every conversation. It can:

- Hand off math questions to a dedicated `Math Tutor` agent, which only does
  arithmetic and shows its steps.
- Call a `web_search` tool to look up current or live information.
- Call an `end_conversation` tool when the user wants to quit the chat.
- Call a `search_knowledge_base` tool to retrieve relevant passages from the
  project's local reference documents in `docs/` before answering questions
  that depend on project-specific information.

## Retrieval-augmented generation (RAG)

Documents placed in the `docs/` folder are split into overlapping chunks,
embedded with the `nomic-embed-text` Ollama model, and stored in
`data/vector-store.json` by running `npm run ingest`. At query time, the
`search_knowledge_base` tool embeds the user's question, ranks the stored
chunks by cosine similarity, and returns the top matches for the model to use
as context in its answer.
