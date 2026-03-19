// api/keys.js — Vercel serverless function
//
// Returns default API keys to Toolz Android clients.
// Keys are stored in Vercel Environment Variables — never in source code or the APK.
//
// ── REQUIRED Vercel Environment Variables ────────────────────────────────────
// Vercel Dashboard → Project → Settings → Environment Variables
//
//   GEMINI_DEFAULT     = AIza…
//   CHATGPT_DEFAULT    = sk-proj-…
//   GROQ_DEFAULT       = gsk_…
//   CLAUDE_DEFAULT     = sk-ant-…
//   DEEPSEEK_DEFAULT   = sk-…
//   OPENROUTER_DEFAULT = sk-or-v1-…
//
// No auth token required — the endpoint is open.
// The keys themselves are never visible in the bundle or the repo.
// ─────────────────────────────────────────────────────────────────────────────

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  const keys = {
    Gemini:     process.env.GEMINI_DEFAULT     || "",
    ChatGPT:    process.env.CHATGPT_DEFAULT    || "",
    Groq:       process.env.GROQ_DEFAULT       || "",
    Claude:     process.env.CLAUDE_DEFAULT     || "",
    DeepSeek:   process.env.DEEPSEEK_DEFAULT   || "",
    OpenRouter: process.env.OPENROUTER_DEFAULT || "",
  };

  const hasAny = Object.values(keys).some(v => v.length > 0);
  if (!hasAny) {
    console.error("[keys] No API keys configured — add GROQ_DEFAULT etc. to Vercel Environment Variables");
    return res.status(503).json({ error: "No keys configured" });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(keys);
}
