// api/keys.js — Vercel serverless function
//
// Returns default API keys to authenticated Toolz Android clients.
// Keys come from Vercel server-side Environment Variables — never the JS bundle.
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
//   APP_TOKEN = Fd9M5rs0ydhEz8YeegDzohZH  (optional but recommended)
//   └─ If set, only requests with header x-toolz-token: <APP_TOKEN> are served.
//   └─ If NOT set, all GET requests are served (open mode — add APP_TOKEN to lock it down).
// ─────────────────────────────────────────────────────────────────────────────

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "x-toolz-token, Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  // ── Auth gate (only enforced when APP_TOKEN env var is set) ───────────────
  const expected = process.env.APP_TOKEN;
  if (expected) {
    // APP_TOKEN is configured — enforce it
    const token = req.headers["x-toolz-token"];
    if (!token || token !== expected) {
      console.warn("[keys] Rejected request — bad or missing x-toolz-token");
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    // APP_TOKEN not set — open mode. Log a reminder but still serve keys.
    // This lets the app work immediately without requiring dashboard setup.
    console.warn("[keys] APP_TOKEN not set — serving keys in open mode. " +
      "Add APP_TOKEN=Fd9M5rs0ydhEz8YeegDzohZH to Vercel Environment Variables to restrict access.");
  }

  // ── Check that at least one key is present ────────────────────────────────
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
    console.error("[keys] No API keys are set! Add GROQ_DEFAULT etc. to Vercel Environment Variables.");
    return res.status(503).json({ error: "No keys configured on server" });
  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  return res.status(200).json(keys);
}
