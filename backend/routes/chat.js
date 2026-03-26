// Added by Reymes - 03/24/2026 - AI Chat route — calls Claude (Anthropic) on behalf of the frontend
require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

const SYSTEM_PROMPT = `You are PovertyLens AI, a helpful assistant for the PovertyLens platform — a tool that helps people understand global poverty through data, stories, and actionable insights.

You can help users with:
- Understanding poverty statistics and what they mean
- Explaining terms in the glossary (e.g., Gini coefficient, multidimensional poverty index)
- Navigating the platform's features (maps, timelines, donation pages, pledge wall, etc.)
- Suggesting ways to take action (donate, pledge, play FreeRice, share stories)
- Answering general questions about global and domestic poverty

Keep your answers concise, factual, and compassionate. If you don't know something, say so honestly.
Do not make up statistics — refer users to the Statistics or Timeline pages for data.`;

router.post('/', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'AI service is not configured. Please contact the site administrator.',
    });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided.' });
  }

  // Sanitise messages — only allow role/content strings to prevent prompt injection
  const safeMessages = messages
    .filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        ['user', 'assistant'].includes(m.role) &&
        typeof m.content === 'string'
    )
    .slice(-20) // keep last 20 turns to avoid token bloat
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: safeMessages,
    });

    const reply = response.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    return res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return res.status(502).json({
      error: 'Unable to reach the AI service. Please try again later.',
    });
  }
});

module.exports = router;
