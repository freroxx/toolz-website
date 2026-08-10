import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Technical Documentation — Toolz Backend
 * Pure Material 3 Engineering Spec.
 */

function renderInfoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Architecture — Toolz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --md-primary: #FF6D00;
      --md-surface: #090d16;
      --md-on-surface: #f1f5f9;
      --md-on-surface-variant: #94a3b8;
      --md-outline: #2d3748;
      --md-surface-container: #161e2e;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--md-surface);
      color: var(--md-on-surface);
      line-height: 1.6;
      padding: 4rem 1.5rem;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header { margin-bottom: 4rem; border-left: 4px solid var(--md-primary); padding-left: 1.5rem; }
    .title { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .desc { color: var(--md-on-surface-variant); font-size: 1.1rem; font-weight: 500; }

    .section-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: var(--md-primary); margin-bottom: 2rem; display: block; }

    .file-list { display: grid; gap: 1.5rem; margin-bottom: 4rem; }
    .file-card { background: var(--md-surface-container); border-radius: 24px; padding: 2rem; border: 1px solid rgba(255,255,255,0.05); }
    .file-path { font-family: monospace; color: var(--md-primary); font-weight: 700; display: block; margin-bottom: 0.5rem; }
    .file-info { color: var(--md-on-surface-variant); font-size: 0.95rem; }

    .schema-box { background: var(--md-surface-container); border-radius: 24px; padding: 2rem; border: 1px solid rgba(255,255,255,0.05); }
    .schema-row { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 2rem; }
    .schema-row:last-child { border-bottom: none; }
    .schema-key { font-family: monospace; color: var(--md-primary); font-weight: 700; }
    .schema-val { color: var(--md-on-surface-variant); font-size: 0.9rem; text-align: right; }

    .back-btn { display: inline-block; margin-top: 4rem; color: var(--md-on-surface-variant); text-decoration: none; font-weight: 700; font-size: 0.85rem; border-bottom: 1px solid transparent; transition: all 0.2s; }
    .back-btn:hover { color: var(--md-primary); border-color: var(--md-primary); }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">System Architecture</h1>
      <p class="desc">Toolz Distributed Hardware Resolution Engine</p>
    </header>

    <span class="section-label">Serverless Handlers</span>
    <div class="file-list">
      <div class="file-card">
        <span class="file-path">/api/specs.ts</span>
        <p class="file-info">Core extraction engine. Resolves technical sheets from GSMArena via Edge-side parsing.</p>
      </div>
      <div class="file-card">
        <span class="file-path">/api/spec.ts</span>
        <p class="file-info">Technical Index controller. Manages database synchronization and real-time resolution.</p>
      </div>
      <div class="file-card">
        <span class="file-path">/api/sync-devices.ts</span>
        <p class="file-info">Automated dictionary sync. Maps hardware model codes to commercial market names.</p>
      </div>
    </div>

    <span class="section-label">Redis Data Schema</span>
    <div class="schema-box">
      <div class="schema-row">
        <span class="schema-key">specs:url:<id></span>
        <span class="schema-val">Technical Hardware Payload</span>
      </div>
      <div class="schema-row">
        <span class="schema-key">url_map:<query></span>
        <span class="schema-val">Resolution Map Dictionary</span>
      </div>
      <div class="schema-row">
        <span class="schema-key">device:<model></span>
        <span class="schema-val">Hardware Translation Layer</span>
      </div>
    </div>

    <a href="/spec" class="back-btn">Return to Technical Index</a>
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
      version: '4.1.0'
    });
  }

  return res.status(200).send(renderInfoHtml());
}
