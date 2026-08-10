import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Technical Documentation Engine — /api/info
 *
 * Explains the backend infrastructure, server-side resolution engine, database schemas,
 * and what every file in /api does. Pure Material 3 Expressive.
 */

function renderInfoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Architecture — Toolz Engineering</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --md-primary: #FF6D00;
      --md-secondary: #00BFA5;
      --md-surface: #090d16;
      --md-on-surface: #f1f5f9;
      --md-on-surface-variant: #94a3b8;
      --md-outline: #2d3748;
      --md-surface-container: #161e2e;
      --md-surface-container-high: #1c2539;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--md-surface);
      color: var(--md-on-surface);
      min-height: 100vh;
      line-height: 1.5;
    }
    .main-wrapper {
      max-width: 1000px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
    }
    .back-nav {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: var(--md-on-surface-variant);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4rem;
      transition: color 0.2s;
    }
    .back-nav:hover { color: var(--md-primary); }
    .hero-header {
      margin-bottom: 6rem;
    }
    .m3-chip {
      display: inline-flex;
      background: rgba(255, 109, 0, 0.1);
      color: var(--md-primary);
      border: 1px solid rgba(255, 109, 0, 0.2);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 1.5rem;
    }
    .hero-title span { font-style: italic; font-family: serif; color: var(--md-primary); }
    .hero-desc {
      font-size: 1.15rem;
      color: var(--md-on-surface-variant);
      max-width: 600px;
      font-weight: 500;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 2.5rem;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--md-outline);
      opacity: 0.3;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 6rem;
    }
    .file-card {
      background: var(--md-surface-container);
      border-radius: 32px;
      padding: 2.5rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: transform 0.3s, background 0.3s;
    }
    .file-card:hover { transform: translateY(-4px); background: var(--md-surface-container-high); }
    .file-path {
      font-family: monospace;
      color: var(--md-primary);
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      display: block;
    }
    .file-meta {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--md-secondary);
      margin-bottom: 1.5rem;
      display: block;
    }
    .file-desc {
      color: var(--md-on-surface-variant);
      font-size: 1rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .feature-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      background: rgba(255, 255, 255, 0.04);
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--md-on-surface);
    }
    .schema-section {
      background: var(--md-surface-container);
      border-radius: 40px;
      padding: 3rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .schema-row {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 2rem;
      padding: 1.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .schema-row:last-child { border-bottom: none; }
    .schema-key { font-family: monospace; color: var(--md-primary); font-weight: 700; font-size: 0.9rem; }
    .schema-val { color: var(--md-on-surface-variant); font-size: 0.9rem; font-weight: 500; }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.5rem; }
      .schema-row { grid-template-columns: 1fr; gap: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="main-wrapper">
    <a href="/spec" class="back-nav">← Technical Index</a>

    <header class="hero-header">
      <div class="m3-chip">Engineering Documentation</div>
      <h1 class="hero-title">System <span>Architecture.</span></h1>
      <p class="hero-desc">Distributed hardware resolution engine powered by Vercel Edge and Upstash Redis.</p>
    </header>

    <h2 class="section-title">Backend Handlers</h2>
    <div class="grid-layout">

      <div class="file-card">
        <span class="file-path">/api/specs.ts</span>
        <span class="file-meta">Resolution Core v3</span>
        <p class="file-desc">Primary web extraction engine. Parses GSMArena technical sheets via Cheerio with ScraperAPI failover and permanent Redis synchronization.</p>
        <div class="feature-tags">
          <span class="tag">Cheerio Parser</span>
          <span class="tag">Proxy Failover</span>
          <span class="tag">Deduplication Lock</span>
        </div>
      </div>

      <div class="file-card">
        <span class="file-path">/api/spec.ts</span>
        <span class="file-meta">Index Handler</span>
        <p class="file-desc">Interactive catalog controller. Manages live search, brand filtering, and real-time database enrichment for the engineering catalog.</p>
        <div class="feature-tags">
          <span class="tag">Live Sync</span>
          <span class="tag">Edge Cached</span>
          <span class="tag">JSON/HTML Middleware</span>
        </div>
      </div>

      <div class="file-card">
        <span class="file-path">/api/sync-devices.ts</span>
        <span class="file-meta">Hardware Dictionary</span>
        <p class="file-desc">Synchronizes the official Android device database (25,000+ entries) into Redis model-to-market translation keys.</p>
        <div class="feature-tags">
          <span class="tag">Cron Triggered</span>
          <span class="tag">SHA-256 Auth</span>
          <span class="tag">Batch Processing</span>
        </div>
      </div>

    </div>

    <h2 class="section-title">Data Schema</h2>
    <div class="schema-section">
      <div class="schema-row">
        <span class="schema-key">specs:url:<id></span>
        <span class="schema-val">Full technical engineering sheet (JSON Payload)</span>
      </div>
      <div class="schema-row">
        <span class="schema-key">url_map:<query></span>
        <span class="schema-val">Authoritative URL mapping for hardware resolution</span>
      </div>
      <div class="schema-row">
        <span class="schema-key">device:<model></span>
        <span class="schema-val">Hardware model to market-name translation dictionary</span>
      </div>
    </div>

    <footer style="margin-top: 6rem; text-align: center; opacity: 0.2; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em;">
      Toolz Distributed Engine • 2026 Stable
    </footer>
  </div>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const isJson = req.query.json === '1' || req.headers['accept']?.includes('application/json');

  if (isJson) {
    return res.status(200).json({
      engine: 'Toolz Hardware Resolution',
      infrastructure: 'Vercel Edge + Upstash Redis',
      version: '4.0.0'
    });
  }

  return res.status(200).send(renderInfoHtml());
}
