import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Architecture & API Documentation Engine — /info & /api/info
 *
 * Explains the backend infrastructure, server-side resolution engine, database schemas,
 * and what every file in /api does.
 */

function renderInfoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Architecture &amp; System Docs — Toolz Backend</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Technical overview of Toolz serverless architecture, Redis database key schemas, and API handlers.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #090d16;
      color: #f1f5f9;
      min-height: 100vh;
      padding-bottom: 5rem;
    }
    .header-bar {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 1.25rem 2rem;
    }
    .header-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.5);
    }
    .brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 100px;
      padding: 0.6rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .back-btn:hover {
      background: #6366f1;
      border-color: #6366f1;
    }
    .main-content {
      max-width: 1100px;
      margin: 3rem auto 0;
      padding: 0 1.5rem;
    }
    .hero-box {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .m3-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
      margin-bottom: 0.75rem;
    }
    .hero-desc {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .files-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 3.5rem;
    }
    .file-card {
      background: #161e2e;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .file-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .file-path {
      font-family: monospace;
      font-size: 1.1rem;
      font-weight: 700;
      color: #818cf8;
      background: rgba(99, 102, 241, 0.1);
      padding: 4px 12px;
      border-radius: 8px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .file-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: #34d399;
      background: rgba(52, 211, 153, 0.1);
      padding: 4px 12px;
      border-radius: 100px;
      text-transform: uppercase;
    }
    .file-desc {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }
    .feature-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 10px;
    }
    .feature-list li {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 14px;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .feature-list li strong {
      color: #f1f5f9;
    }
    .schema-card {
      background: #161e2e;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2rem;
      margin-bottom: 3.5rem;
    }
    .schema-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .schema-table th {
      text-align: left;
      background: rgba(99, 102, 241, 0.12);
      color: #a5b4fc;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    .schema-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.875rem;
      color: #cbd5e1;
    }
    .schema-key {
      font-family: monospace;
      color: #38bdf8;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <header class="header-bar">
    <div class="header-container">
      <div class="brand-group">
        <div class="logo-badge">⚙️</div>
        <div>
          <div class="brand-title">Toolz System Architecture</div>
          <div class="brand-subtitle">Vercel Edge &amp; Upstash Redis Infrastructure</div>
        </div>
      </div>
      <a href="/spec" class="back-btn">← Back to Phone Catalog</a>
    </div>
  </header>

  <main class="main-content">
    <div class="hero-box">
      <div class="m3-pill">📖 Technical Documentation</div>
      <h1 class="hero-title">Backend &amp; API Architecture</h1>
      <p class="hero-desc">Detailed overview of serverless handlers, multi-layer model resolution, anti-bot bypass strategies, and Redis key schemas.</p>
    </div>

    <!-- API Files Directory -->
    <h2 class="section-title">📂 Serverless Handlers in /api</h2>
    <div class="files-grid">

      <!-- api/specs.ts -->
      <div class="file-card">
        <div class="file-header">
          <span class="file-path">/api/specs.ts</span>
          <span class="file-tag">Core Resolution Engine v3</span>
        </div>
        <p class="file-desc">The primary device specification resolver and web extraction engine. Serves GET requests for phone specifications with zero-latency caching and automated anti-bot escalation.</p>
        <ul class="feature-list">
          <li><strong>Layer 1:</strong> Built-in MODEL_MAP table for instant hardware code resolution</li>
          <li><strong>Layer 2:</strong> Dynamic Samsung SM- / GT- model code parser</li>
          <li><strong>Layer 3:</strong> Multi-key Upstash Redis device:&lt;model&gt; lookup</li>
          <li><strong>Layer 4:</strong> GSMArena quicksearch index catalog matcher</li>
          <li><strong>Scraper:</strong> Cheerio HTML parser + ScraperAPI proxy fallback</li>
          <li><strong>Storage:</strong> Permanent Redis caching (no TTL) for specs &amp; URL maps</li>
        </ul>
      </div>

      <!-- api/spec.ts -->
      <div class="file-card">
        <div class="file-header">
          <span class="file-path">/api/spec.ts</span>
          <span class="file-tag">Interactive Phone Catalog</span>
        </div>
        <p class="file-desc">Powers the Material 3 Expressive Phone Catalog (/spec). Displays all indexed Redis device specifications, features live search, and automatically auto-enriches the database on search.</p>
        <ul class="feature-list">
          <li><strong>Live Search:</strong> Filters catalog with brand badges and spec cards</li>
          <li><strong>Auto-Enrichment:</strong> Unindexed search queries trigger specs.ts extraction</li>
          <li><strong>GSMArena Modal:</strong> Displays 100% full technical spec tables</li>
          <li><strong>JSON Mode:</strong> Serves raw JSON data when Accept: application/json</li>
        </ul>
      </div>

      <!-- api/sync-devices.ts -->
      <div class="file-card">
        <div class="file-header">
          <span class="file-path">/api/sync-devices.ts</span>
          <span class="file-tag">Device Model Synchronizer</span>
        </div>
        <p class="file-desc">Synchronizes the official android-device-list (25,000+ devices) into Upstash Redis as permanent device:&lt;model&gt; keys mapped to commercial market names.</p>
        <ul class="feature-list">
          <li><strong>Auth:</strong> SYNC_PASSWORD timing-safe authentication</li>
          <li><strong>Security:</strong> IP failure counter and 5-attempt IP banning</li>
          <li><strong>Normalization:</strong> Generates upper, lower, and stripped model keys</li>
        </ul>
      </div>

      <!-- api/reset.ts -->
      <div class="file-card">
        <div class="file-header">
          <span class="file-path">/api/reset.ts</span>
          <span class="file-tag">Admin Cache Purge System</span>
        </div>
        <p class="file-desc">Administrative cache reset endpoint at /reset. Purges Redis cache keys (specs:*, url_map:*, catalog) with SHA-256 password hashing, CSRF nonces, and 3-attempt IP lockout.</p>
        <ul class="feature-list">
          <li><strong>Material 3 UI:</strong> Dark-themed responsive control panel</li>
          <li><strong>Purge Engine:</strong> Fail-safe chunked redis.keys() pattern matching</li>
          <li><strong>Single Invalidation:</strong> Purge specific phone model caches</li>
        </ul>
      </div>

      <!-- api/devicebot.ts -->
      <div class="file-card">
        <div class="file-header">
          <span class="file-path">/api/devicebot.ts</span>
          <span class="file-tag">AI Device Assistant</span>
        </div>
        <p class="file-desc">Conversational AI endpoint for device specification queries, comparison analysis, and hardware recommendations.</p>
        <ul class="feature-list">
          <li><strong>Natural Query:</strong> Understands complex device comparison prompts</li>
          <li><strong>Context Integration:</strong> Injects fresh specs from specs.ts</li>
        </ul>
      </div>

      <!-- api/info.ts -->
      <div class="file-card">
        <div class="file-header">
          <span class="file-path">/api/info.ts</span>
          <span class="file-tag">Documentation Engine</span>
        </div>
        <p class="file-desc">This documentation handler! Renders the Material 3 system architecture page and provides technical JSON specs when requested via API.</p>
      </div>

    </div>

    <!-- Redis Key Schema -->
    <h2 class="section-title">🗄️ Upstash Redis Database Key Schemas</h2>
    <div class="schema-card">
      <table class="schema-table">
        <thead>
          <tr>
            <th>Key Pattern</th>
            <th>Type</th>
            <th>Description</th>
            <th>TTL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="schema-key">specs:url:&lt;deviceId&gt;</td>
            <td>JSON Object</td>
            <td>Full GSMArena specifications payload for a device ID</td>
            <td>Permanent (No TTL)</td>
          </tr>
          <tr>
            <td class="schema-key">url_map:&lt;searchQuery&gt;</td>
            <td>String (URL)</td>
            <td>Maps a search query or model variant to its GSMArena URL</td>
            <td>Permanent (No TTL)</td>
          </tr>
          <tr>
            <td class="schema-key">device:&lt;modelCode&gt;</td>
            <td>String (Name)</td>
            <td>Maps internal model code (e.g. sm-s918b) to market name</td>
            <td>Permanent (No TTL)</td>
          </tr>
          <tr>
            <td class="schema-key">cache:gsm_quicksearch_catalog</td>
            <td>JSON Array</td>
            <td>Cached GSMArena static catalog index (quicksearch-82698.jpg)</td>
            <td>Permanent (No TTL)</td>
          </tr>
          <tr>
            <td class="schema-key">ban:&lt;ip&gt;</td>
            <td>String (Boolean)</td>
            <td>Temporarily locked IP addresses due to failed auth attempts</td>
            <td>15 Minutes</td>
          </tr>
          <tr>
            <td class="schema-key">fails:&lt;ip&gt;</td>
            <td>Integer</td>
            <td>Counter for failed password attempts</td>
            <td>15 Minutes</td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
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
      name: 'Toolz Backend Architecture',
      version: '3.0.0',
      handlers: {
        'api/specs.ts': 'Server-Side Resolution Engine v3 & Spec Extractor',
        'api/spec.ts': 'Material 3 Expressive Phone Catalog & Search Engine',
        'api/sync-devices.ts': 'Android Device List Synchronizer (25,000+ devices)',
        'api/reset.ts': 'Admin Cache Purge & Reset System',
        'api/devicebot.ts': 'Conversational AI Device Assistant',
        'api/info.ts': 'Architecture & API Documentation Engine',
      },
      database: 'Upstash Redis',
      scrapers: ['Direct GSMArena Fetch', 'ScraperAPI Proxy Fallback'],
    });
  }

  return res.status(200).send(renderInfoHtml());
}
