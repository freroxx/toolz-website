// api/keys.js
// Vercel serverless function — runs on the server, never in the browser bundle.
// Keys are read from Vercel Environment Variables (set in the dashboard),
// which are server-only and never exposed to clients.
//
// Set these in: Vercel Dashboard → Your Project → Settings → Environment Variables
// (NOT in .env committed to Git)
//
// Required env vars:
//   GEMINI_DEFAULT, CHATGPT_DEFAULT, GROQ_DEFAULT,
//   CLAUDE_DEFAULT, DEEPSEEK_DEFAULT, OPENROUTER_DEFAULT
//   APP_TOKEN  ← a secret string you invent, e.g. "toolz-2026-secret"

export default function handler(req, res) {
  // ── CORS ─────────────────────────────────────────────────────────────────
  // Only allow requests that include your app token in the header.
  // This stops random bots from harvesting your keys.
  const token = req.headers["x-toolz-token"];
  if (token !== process.env.APP_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ── Only allow GET ────────────────────────────────────────────────────────
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Return keys ────────────────────────────────────────────────────────────
  // Keys are read from Vercel server-side env vars at request time.
  // They are NEVER embedded in the JS bundle.
  res.setHeader("Cache-Control", "no-store"); // don't cache — keys may rotate
  return res.status(200).json({
    Gemini:     process.env.GEMINI_DEFAULT     ?? "",
    ChatGPT:    process.env.CHATGPT_DEFAULT    ?? "",
    Groq:       process.env.GROQ_DEFAULT       ?? "",
    Claude:     process.env.CLAUDE_DEFAULT     ?? "",
    DeepSeek:   process.env.DEEPSEEK_DEFAULT   ?? "",
    OpenRouter: process.env.OPENROUTER_DEFAULT ?? "",
  });
}
