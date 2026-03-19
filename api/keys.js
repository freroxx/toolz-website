// api/keys.js — Vercel serverless function
//
// Reads API keys from Vercel server-side environment variables and returns
// them to authenticated Toolz Android clients.
//
// ── REQUIRED Vercel Environment Variables ────────────────────────────────────
// Vercel Dashboard → Project → Settings → Environment Variables:
//
//   APP_TOKEN          = Fd9M5rs0ydhEz8YeegDzohZH   ← MUST match APP_TOKEN in AiSettingsManager.kt
//   GEMINI_DEFAULT     = AIza…
//   CHATGPT_DEFAULT    = sk-proj-…
//   GROQ_DEFAULT       = gsk_…
//   CLAUDE_DEFAULT     = sk-ant-…
//   DEEPSEEK_DEFAULT   = sk-…
//   OPENROUTER_DEFAULT = sk-or-v1-…
// ─────────────────────────────────────────────────────────────────────────────

export default function handler(req, res) {
  // Allow preflight
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "x-toolz-token, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  // Node.js automatically lowercases all incoming header names.
  // Android sends "x-toolz-token: <APP_TOKEN>".
  const expected = process.env.APP_TOKEN;

  if (!expected) {
    // Deployment is missing the APP_TOKEN env var — tell the developer clearly
    console.error("[keys] APP_TOKEN env var is NOT set in Vercel dashboard.");
    console.error("[keys] Go to: Vercel → Project → Settings → Environment Variables");
    console.error("[keys] Add:  APP_TOKEN = Fd9M5rs0ydhEz8YeegDzohZH");
    return res.status(503).json({
      error: "Server misconfigured: APP_TOKEN missing from environment variables",
    });
  }

  const token = req.headers["x-toolz-token"];
  if (!token || token !== expected) {
    console.warn("[keys] Rejected — bad or missing x-toolz-token header");
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ── Return keys — never cache ──────────────────────────────────────────────
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  return res.status(200).json({
    Gemini:     process.env.GEMINI_DEFAULT     ?? "",
    ChatGPT:    process.env.CHATGPT_DEFAULT    ?? "",
    Groq:       process.env.GROQ_DEFAULT       ?? "",
    Claude:     process.env.CLAUDE_DEFAULT     ?? "",
    DeepSeek:   process.env.DEEPSEEK_DEFAULT   ?? "",
    OpenRouter: process.env.OPENROUTER_DEFAULT ?? "",
  });
}
