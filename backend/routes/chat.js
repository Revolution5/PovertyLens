// Added by Reymes - 03/24/2026 - AI Chat route — calls Google Gemini (free tier) on behalf of the frontend
// Two specialised bots route under the hood; the user sees one seamless assistant.
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// ── Bot 1: Research Analyst ───────────────────────────────────────────────────
// Handles questions about poverty data, statistics, definitions, history, causes.
const RESEARCH_PROMPT = `You are PovertyLens Research Analyst, the data-focused side of the PovertyLens AI assistant.
You specialise in:
- Poverty statistics, rates, and trends (global, national, regional)
- Definitions and explanations of poverty-related terms (Gini coefficient, MPI, poverty line, etc.)
- Historical context and causes of poverty
- Country and regional comparisons
- Research findings and reports

Guidelines:
- Be analytical, precise, and compassionate.
- Never invent statistics — always direct users to the Statistics or Timeline pages on PovertyLens for verified data.
- If a term is in the PovertyLens Glossary, mention they can look it up there.
- Keep answers concise and factual.
- If the question is really about how to use the platform, gently answer it but note you are primarily a research assistant.`;

// ── Bot 2: Platform Guide ─────────────────────────────────────────────────────
// TODO: Fill this out — handles navigation, features, actions, donations, pledges, FreeRice, account help.
// Add your personality, topics, and guidelines below following the same pattern as Bot 1 above.
const GUIDE_PROMPT = `You are PovertyLens Platform Guide, the action-focused side of the PovertyLens AI assistant.

// TODO: Add what this bot specialises in (e.g. platform navigation, donations, pledges, FreeRice, account help)

// TODO: Add guidelines for tone and behaviour

Keep answers concise and helpful.`;

// ── Classifier ────────────────────────────────────────────────────────────────
// Keyword-based routing — no extra API call, instant.
// Returns 'research' for data/facts/definitions, 'guide' for everything else.
const RESEARCH_PATTERN =
  /statistic|data|percent|%|poverty rate|poverty line|gini|coefficient|index|gdp|define|definition|what is|explain|how many|how much|cause[sd]?|effect[sd]?|impact[sd]?|histor|measur|income|wage|hunger|malnutrition|literacy|country|nation|region|global|world|report|study|research|fact|figure|\bnumber\b|billion|million|threshold|multidimensional|inequality|disparity|demographic/i;

function classifyMessage(lastUserMessage) {
  return RESEARCH_PATTERN.test(lastUserMessage) ? 'research' : 'guide';
}

// ── Route ─────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

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

  // Classify based on the latest user message
  const lastUser = [...safeMessages].reverse().find((m) => m.role === 'user');
  const botType = lastUser ? classifyMessage(lastUser.content) : 'guide';
  const systemPrompt = botType === 'research' ? RESEARCH_PROMPT : GUIDE_PROMPT;

  // Gemini expects 'model' instead of 'assistant' for role names
  const geminiHistory = safeMessages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const latestMessage = safeMessages[safeMessages.length - 1]?.content ?? '';

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(latestMessage);
    const reply = result.response.text() ?? "Sorry, I couldn't generate a response.";
    return res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return res.status(502).json({
      error: 'Unable to reach the AI service. Please try again later.',
    });
  }
});

module.exports = router;
