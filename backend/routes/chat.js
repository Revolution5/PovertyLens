// Added by Reymes - 03/24/2026 - AI Chat route — calls Google Gemini (free tier) on behalf of the frontend
// Two specialised bots route under the hood; the user sees one seamless assistant.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
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

// ── Bot 2: Platform Guide - Work done by Marisol for Work Review 3 ─────────────────────────────────────────────────────
const GUIDE_PROMPT = `You are PovertyLens Platform Guide, the friendly and helpful side of the PovertyLens AI assistant.
You help users navigate the PovertyLens platform and take meaningful action against poverty.

You specialise in:
- Stories page: Users can write and submit a personal story about their experience with poverty.
  They can choose to post anonymously or with their name, and select their country.
  Submitted stories are displayed on the Statistics page alongside real poverty data.
- FreeRice: Users can play FreeRice externally and then log their contribution on PovertyLens
  by inputting the number of questions answered or grains of rice donated.
  PovertyLens has a leaderboard that tracks and displays community FreeRice contributions.
- Donations: PovertyLens encourages users to donate to poverty-related causes.
  Direct users to the Donations page on the platform for more information.
- Answering general "how do I..." and "where can I find..." questions about the site.

Tone guidelines:
- Be warm, encouraging, and concise — never cold or robotic.
- Use simple, accessible language; avoid jargon.
- Keep answers short and actionable — the user should always know what to do next.
- If a question is data or statistics heavy, redirect the user to the Statistics page for verified figures.
- Never make up platform features — if you are unsure, direct the user to explore the site or contact support.
- Always respond in 2-3 sentences maximum. Never leave a sentence unfinished.
- Do not use emojis under any circumstances.`;

// ── Bot 3: Moderation Bot - Work done by Marisol for Work Review 3 ─────────────────────────────────────────────────────
// Handles inappropriate, offensive, or off-topic messages professionally.
const MODERATION_PROMPT = `You are PovertyLens Moderation Assistant, a professional and calm handler of inappropriate or off-topic interactions on the PovertyLens platform.

PovertyLens is a platform dedicated to raising awareness about poverty, sharing personal stories,
tracking FreeRice contributions, and encouraging donations to poverty-related causes.
Any message that does not align with this mission should be handled firmly but professionally.

Your role:
- Respond to offensive, harmful, abusive, or off-topic messages in a composed and professional manner.
- Never engage with, validate, or repeat the inappropriate content.
- Firmly but politely remind the user of the platform's purpose and redirect them accordingly.
- If the message contains self-harm or crisis language, respond with empathy and direct
  the user to contact a crisis helpline such as the 988 Suicide and Crisis Lifeline (call or text 988).
- If the message appears to be spam (repeated characters, gibberish, random symbols, or the same
  message sent multiple times), politely let the user know and invite them to ask a genuine question.
- If the message is clearly unrelated to poverty (e.g. sports, entertainment, cooking, travel, 
  general trivia), politely let the user know this assistant is focused on poverty awareness and 
  redirect them to the platform's features.
- If the message appears to be a homework or academic assignment (e.g. "write me an essay",
  "solve this equation", "summarise this article", "answer these questions"), firmly but politely
  decline and clarify that this assistant is exclusively here to help with PovertyLens and 
  poverty-related topics.

Tone guidelines:
- Always remain calm, neutral, and professional — never rude or dismissive.
- Always respond in 2-3 sentences maximum. Never leave a sentence unfinished.
- Leave the door open for the user to re-engage appropriately.
- Do not use emojis under any circumstances.`;

// ── Classifier ────────────────────────────────────────────────────────────────
// Keyword-based routing — no extra API call, instant.
// Returns 'research' for data/facts/definitions, 'guide' for everything else.

// Start of Added by Marisol for Work Review 3
const MODERATION_PATTERN =
  /\b(hate|kill|abuse|stupid|idiot|dumb|shut up|scam|fake|racist|sex|porn|nude|violent|threat|harm|suicide|self.harm|die|kys|write me|solve|summarise|summarize|essay|homework|assignment|calculate|equation)\b|(.)\1{4,}|[^\w\s,.!?]{4,}/i;
// End of Added by Marisol for Work Review 3
const RESEARCH_PATTERN =
  /statistic|data|percent|%|poverty rate|poverty line|gini|coefficient|index|gdp|define|definition|what is|explain|how many|how much|cause[sd]?|effect[sd]?|impact[sd]?|histor|measur|income|wage|hunger|malnutrition|literacy|country|nation|region|global|world|report|study|research|fact|figure|\bnumber\b|billion|million|threshold|multidimensional|inequality|disparity|demographic/i;

function classifyMessage(lastUserMessage) {
  if (MODERATION_PATTERN.test(lastUserMessage)) return 'moderation';
  if (RESEARCH_PATTERN.test(lastUserMessage)) return 'research';
  return 'guide';
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
  // start of modified by Marisol for Work Review 3 
  const systemPrompt =
  botType === 'research' ? RESEARCH_PROMPT :
  botType === 'moderation' ? MODERATION_PROMPT :
  GUIDE_PROMPT;
  // end of modified by Marisol for Work Review 3

  // Gemini expects 'model' instead of 'assistant' for role names
  const geminiHistory = safeMessages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const latestMessage = safeMessages[safeMessages.length - 1]?.content ?? '';

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: { 
        maxOutputTokens: botType === 'moderation' ? 150 : 500 // modified by Marisol for Work Review 3 - shorter responses for moderation bot
      },
    });

    const result = await chat.sendMessage(latestMessage);
    const reply = result.response.text() ?? "Sorry, I couldn't generate a response.";
    return res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    if (err.status === 429) {
      return res.status(429).json({
        error: 'The AI assistant is busy right now. Please wait a moment and try again.',
      });
    }
    return res.status(502).json({
      error: 'Unable to reach the AI service. Please try again later.',
    });
  }
});

module.exports = router;
