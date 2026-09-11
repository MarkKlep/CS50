import express from 'express';
import { triage, endedConversation, InputGuardrailTripwireTriggered } from './agent.mjs';
import { run } from '@openai/agents';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const input = [...history, { role: 'user', content: message }];

  try {
    const result = await run(triage, input);
    res.json({
      reply: result.finalOutput,
      answeredBy: result.lastAgent?.name,
      history: result.history,
      ended: endedConversation(result),
    });
  } catch (err) {
    if (err instanceof InputGuardrailTripwireTriggered) {
      return res.json({ blocked: err.result.guardrail.name, history });
    }
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`chat server on http://localhost:${PORT}`));
