import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Technical Documentation — Toolz specs backend.
 * M3 Expressive reference docs: what each endpoint does, with real examples.
 */

const VERSION = '4.1.0';

function renderInfoHtml(): string {
  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <title>Toolz specs API — docs</title>\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'  <meta name="description" content="Reference docs for the Toolz specs backend: endpoints, parameters, response fields, caching and model-code resolution.">\n' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">\n' +
'  <style>\n' +
'    :root {\n' +
'      --bg: #141218;\n' +
'      --card: #1e1c22;\n' +
'      --card-2: #26242d;\n' +
'      --inset: #17161b;\n' +
'      --border: rgba(255,255,255,0.08);\n' +
'      --text: #e9e3ec;\n' +
'      --muted: #b3a9c0;\n' +
'      --faint: #7e7589;\n' +
'      --primary: #ff6d00;\n' +
'      --on-primary: #ffffff;\n' +
'      --secondary: #00bfa5;\n' +
'    }\n' +
'    * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'    html { scroll-behavior: smooth; }\n' +
'    body {\n' +
'      font-family: "Google Sans Text", "Google Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;\n' +
'      background: var(--bg); color: var(--text); line-height: 1.65;\n' +
'      -webkit-text-size-adjust: 100%;\n' +
'    }\n' +
'    body::before {\n' +
'      content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;\n' +
'      background: radial-gradient(560px 320px at 85% -60px, rgba(255,109,0,0.10), transparent 70%);\n' +
'    }\n' +
'    ::selection { background: rgba(255,109,0,0.35); }\n' +
'    .wrap { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 20px 16px 72px; }\n' +
'    @media (min-width: 720px) { .wrap { padding: 40px 24px 96px; } }\n' +
'\n' +
'    /* Top bar */\n' +
'    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 36px; }\n' +
'    @media (min-width: 720px) { .topbar { margin-bottom: 52px; } }\n' +
'    .btn { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; border-radius: 999px;\n' +
'      font-size: 13.5px; font-weight: 700; padding: 11px 20px; transition: transform .15s, background .2s, border-color .2s; }\n' +
'    .btn:active { transform: scale(0.97); }\n' +
'    .btn-outline { border: 1px solid var(--border); background: var(--card); color: var(--text); }\n' +
'    .btn-outline:hover { border-color: rgba(255,109,0,0.55); }\n' +
'    .btn-solid { background: var(--primary); color: var(--on-primary); border: 1px solid transparent;\n' +
'      box-shadow: 0 8px 24px -10px rgba(255,109,0,0.7); }\n' +
'    .btn-solid:hover { filter: brightness(1.08); }\n' +
'    .ver { display: inline-flex; align-items: center; gap: 9px; font-size: 11px; font-weight: 700;\n' +
'      letter-spacing: 0.14em; color: var(--muted); border: 1px solid var(--border);\n' +
'      background: var(--card); border-radius: 999px; padding: 11px 17px; white-space: nowrap; }\n' +
'    .ver i { width: 8px; height: 8px; border-radius: 50%; background: var(--secondary);\n' +
'      box-shadow: 0 0 0 4px rgba(0,191,165,0.15); }\n' +
'\n' +
'    /* Hero */\n' +
'    .hero { text-align: center; margin-bottom: 30px; }\n' +
'    @media (min-width: 720px) { .hero { margin-bottom: 40px; } }\n' +
'    .hero h1 { font-family: "Google Sans", sans-serif; font-size: clamp(2rem, 6vw, 3.2rem);\n' +
'      letter-spacing: -0.02em; line-height: 1.08; margin-bottom: 14px; }\n' +
'    .hero p { color: var(--muted); font-size: 15.5px; max-width: 640px; margin: 0 auto 22px; }\n' +
'    @media (min-width: 720px) { .hero p { font-size: 16.5px; } }\n' +
'    .hero p a { color: #ffb37a; }\n' +
'    .hero .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 22px; }\n' +
'    .toc { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }\n' +
'    .toc a { font-size: 12.5px; font-weight: 700; color: var(--muted); text-decoration: none;\n' +
'      border: 1px solid var(--border); background: var(--card); border-radius: 999px; padding: 8px 16px; }\n' +
'    .toc a:hover { color: var(--text); border-color: rgba(255,109,0,0.5); }\n' +
'\n' +
'    /* Sections */\n' +
'    section { margin-bottom: 26px; scroll-margin-top: 20px; }\n' +
'    @media (min-width: 720px) { section { margin-bottom: 36px; } }\n' +
'    .label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.2em;\n' +
'      color: var(--primary); margin-bottom: 12px; }\n' +
'    .card { background: var(--card); border: 1px solid var(--border); border-radius: 28px; padding: 22px; }\n' +
'    @media (min-width: 720px) { .card { padding: 30px 32px; } }\n' +
'    .card h3 { font-size: 15.5px; margin-bottom: 6px; }\n' +
'    .card p, .card li { font-size: 14px; color: var(--muted); }\n' +
'    .card p { margin-bottom: 10px; max-width: 70ch; }\n' +
'    .card p:last-child { margin-bottom: 0; }\n' +
'    .card ol, .card ul.plain { padding-left: 22px; display: grid; gap: 8px; margin: 10px 0 4px; max-width: 70ch; }\n' +
'    .card b { color: var(--text); }\n' +
'    .card p a, .card li a { color: #ffb37a; }\n' +
'\n' +
'    /* Steps */\n' +
'    .steps { display: grid; gap: 10px; }\n' +
'    @media (min-width: 760px) { .steps { grid-template-columns: repeat(5, 1fr); } }\n' +
'    .step { background: var(--card-2); border: 1px solid var(--border); border-radius: 20px; padding: 16px; }\n' +
'    .step .n { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px;\n' +
'      border-radius: 12px; background: rgba(255,109,0,0.14); color: var(--primary);\n' +
'      font-size: 13px; font-weight: 700; margin-bottom: 10px; }\n' +
'    .step h4 { font-size: 13.5px; margin-bottom: 4px; }\n' +
'    .step p { font-size: 12.5px; }\n' +
'\n' +
'    /* Endpoint cards */\n' +
'    .eps { display: grid; gap: 10px; }\n' +
'    @media (min-width: 820px) { .eps { grid-template-columns: 1fr 1fr; } }\n' +
'    .ep { background: var(--card-2); border: 1px solid var(--border); border-radius: 20px;\n' +
'      padding: 20px; display: flex; flex-direction: column; gap: 10px; }\n' +
'    .ep.full { grid-column: 1 / -1; }\n' +
'    .ep .head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }\n' +
'    .method { font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; border-radius: 999px; padding: 4px 11px; }\n' +
'    .method.get { background: rgba(0,191,165,0.12); color: #4de3c8; border: 1px solid rgba(0,191,165,0.32); }\n' +
'    .method.post { background: rgba(255,109,0,0.12); color: #ffa04d; border: 1px solid rgba(255,109,0,0.32); }\n' +
'    .path { font-family: "Roboto Mono", ui-monospace, monospace; font-size: 13px; word-break: break-all; }\n' +
'    .ep p { font-size: 13px; }\n' +
'    .try { margin-top: auto; }\n' +
'    .try a { font-size: 13px; font-weight: 700; color: var(--primary); text-decoration: none; }\n' +
'    .try a:hover { text-decoration: underline; }\n' +
'\n' +
'    /* Code + tables */\n' +
'    code { font-family: "Roboto Mono", ui-monospace, monospace; font-size: 0.87em;\n' +
'      background: rgba(255,255,255,0.07); border-radius: 6px; padding: 1px 6px; word-break: break-word; }\n' +
'    pre { background: var(--inset); border: 1px solid var(--border); border-radius: 16px;\n' +
'      padding: 16px 18px; overflow-x: auto; margin: 12px 0 4px; }\n' +
'    pre code { background: none; padding: 0; font-size: 12.5px; line-height: 1.65; color: #d9d3e2; word-break: normal; }\n' +
'    table { width: 100%; border-collapse: collapse; margin: 10px 0 4px; font-size: 13.5px; }\n' +
'    th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.1em;\n' +
'      color: var(--faint); padding: 8px 10px; border-bottom: 1px solid var(--border); }\n' +
'    td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--muted); vertical-align: top; }\n' +
'    tr:last-child td { border-bottom: none; }\n' +
'    td.key { white-space: nowrap; }\n' +
'    @media (max-width: 560px) { td.key { white-space: normal; } }\n' +
'\n' +
'    footer { border: 1px solid var(--border); background: var(--card); border-radius: 28px;\n' +
'      padding: 22px; display: flex; flex-direction: column; gap: 12px; }\n' +
'    @media (min-width: 720px) { footer { flex-direction: row; align-items: center; justify-content: space-between; padding: 24px 30px; } }\n' +
'    footer p { font-size: 12.5px; color: var(--faint); }\n' +
'    footer nav { display: flex; gap: 8px; flex-wrap: wrap; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="wrap">\n' +
'    <div class="topbar">\n' +
'      <a class="btn btn-outline" href="/spec">&#8592; Device Catalog</a>\n' +
'      <span class="ver"><i></i>API DOCS &middot; v' + VERSION + '</span>\n' +
'    </div>\n' +
'\n' +
'    <header class="hero">\n' +
'      <h1>Toolz specs API</h1>\n' +
'      <p>Turns a phone name or hardware model code (like Android\u2019s <code>Build.MODEL</code>) into a full spec sheet. Data comes from GSMArena and is cached in Redis, so repeats are instant. The <a href="/spec">Device Catalog</a> is the browsing UI on top of it. <a href="/api/info?json=1">Same docs as JSON</a>.</p>\n' +
'      <div class="actions">\n' +
'        <a class="btn btn-solid" href="/spec">Open the catalog</a>\n' +
'        <a class="btn btn-outline" href="/api/spec?json=1&q=Pixel">Try a live query</a>\n' +
'      </div>\n' +
'      <nav class="toc">\n' +
'        <a href="#example">Example</a><a href="#catalog">Catalog search</a><a href="#endpoints">Endpoints</a><a href="#resolution">Resolution</a><a href="#storage">Storage</a><a href="#notes">Notes</a>\n' +
'      </nav>\n' +
'    </header>\n' +
'\n' +
'    <section id="example">\n' +
'      <span class="label">Worked example</span>\n' +
'      <div class="card">\n' +
'        <h3>Resolving one phone: <code>GET /api/specs?model=SM-S928B</code></h3>\n' +
'        <div class="steps">\n' +
'          <div class="step"><span class="n">1</span><h4>Cache lookup</h4><p>Checks Redis for <code>url_map:sm-s928b</code>. A hit returns the stored payload with <code>"cached": true</code>.</p></div>\n' +
'          <div class="step"><span class="n">2</span><h4>Code to name</h4><p><code>SM-S928B</code> matches the builtin Samsung pattern: S-series, generation 24, Ultra variant.</p></div>\n' +
'          <div class="step"><span class="n">3</span><h4>Catalog match</h4><p><code>Samsung Galaxy S24 Ultra</code> is scored against the GSMArena quicksearch catalog to find its page URL.</p></div>\n' +
'          <div class="step"><span class="n">4</span><h4>Scrape</h4><p>The device page is fetched and parsed into sections (Network, Display, Platform, Battery, &#8230;), with a proxy fallback.</p></div>\n' +
'          <div class="step"><span class="n">5</span><h4>Store</h4><p>Saved under <code>specs:url:&lt;id&gt;</code> plus aliases for the code and the full name, so either query hits cache next time.</p></div>\n' +
'        </div>\n' +
'        <h3 style="margin-top:20px">Response shape (trimmed)</h3>\n' +
'        <pre><code>{\n' +
'  "search_query": "SM-S928B",\n' +
'  "search_name": "Samsung Galaxy S24 Ultra",\n' +
'  "matched_device": "Samsung Galaxy S24 Ultra",\n' +
'  "source_url": "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php",\n' +
'  "image": "https://fdn2.gsmarena.com/vv/bigpic/....jpg",\n' +
'  "specifications": {\n' +
'    "Network": { "Technology": "GSM / CDMA / HSPA / EVDO / LTE / 5G", "...": "..." },\n' +
'    "Display": { "Type": "Dynamic AMOLED 2X, 120Hz", "Size": "6.8 inches, ...", "...": "..." }\n' +
'  },\n' +
'  "timing_ms": 2314,\n' +
'  "cached": false\n' +
'}</code></pre>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section id="catalog">\n' +
'      <span class="label">Catalog search</span>\n' +
'      <div class="card">\n' +
'        <h3>What the catalog page calls: <code>GET /api/spec?json=1&amp;q=pixel%209</code></h3>\n' +
'        <ol>\n' +
'          <li>Loads every cached payload and keeps entries whose device name or original query contains <code>pixel 9</code>.</li>\n' +
'          <li>If nothing matches, the query is resolved once through <code>/api/specs</code> and included with <code>"autoEnriched": true</code> \u2014 that is how searching a new phone adds it to the catalog.</li>\n' +
'          <li>If the cache is empty and no query was given, a few default flagships are resolved so the page is never blank.</li>\n' +
'        </ol>\n' +
'        <pre><code>{\n' +
'  "totalInRedis": 42,\n' +
'  "count": 3,\n' +
'  "query": "pixel 9",\n' +
'  "autoEnriched": false,\n' +
'  "devices": [ { "...": "same shape as above" } ]\n' +
'}</code></pre>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section id="endpoints">\n' +
'      <span class="label">Endpoints</span>\n' +
'      <div class="eps">\n' +
'        <div class="ep">\n' +
'          <div class="head"><span class="method get">GET</span><span class="path">/api/specs?model=&#8230;</span></div>\n' +
'          <p>Resolve one device. <code>model</code> is required (name or code, e.g. <code>Pixel 9 Pro XL</code>, <code>HUSKY</code>). <code>refresh=1</code> skips the cache. Errors: <code>400</code> missing param, <code>404</code> not in catalog, <code>502</code> parse failed. Always includes <code>timing_ms</code>.</p>\n' +
'          <div class="try"><a href="/api/specs?model=Samsung%20Galaxy%20S24%20Ultra">Try it &#8594;</a></div>\n' +
'        </div>\n' +
'        <div class="ep">\n' +
'          <div class="head"><span class="method get">GET</span><span class="path">/api/spec?json=1&amp;q=&#8230;</span></div>\n' +
'          <p>Catalog feed. <code>q</code> filters cached names (min 2 chars, triggers auto-enrich on miss). Without <code>json=1</code> it serves the legacy server-rendered HTML catalog.</p>\n' +
'          <div class="try"><a href="/api/spec?json=1&q=Pixel">Try it &#8594;</a></div>\n' +
'        </div>\n' +
'        <div class="ep">\n' +
'          <div class="head"><span class="method get">GET</span><span class="path">/api/info</span></div>\n' +
'          <p>This page. <code>?json=1</code> returns the same reference as JSON.</p>\n' +
'          <div class="try"><a href="/api/info?json=1">Try it &#8594;</a></div>\n' +
'        </div>\n' +
'        <div class="ep">\n' +
'          <div class="head"><span class="method post">POST</span><span class="path">/api/sync-devices</span></div>\n' +
'          <p><b>Admin.</b> Rebuilds the 25,000+ entry model dictionary. Password-protected; <code>?action=invalidate-catalog</code> clears the catalog snapshot, <code>?action=invalidate-specs</code> clears cached specs.</p>\n' +
'        </div>\n' +
'        <div class="ep full">\n' +
'          <div class="head"><span class="method post">POST</span><span class="path">/reset</span></div>\n' +
'          <p><b>Admin.</b> Clears cache: everything, only payloads, only URL mappings, only the catalog snapshot, or one model. Password + CSRF protected; 3 wrong passwords locks the IP for 15 minutes.</p>\n' +
'        </div>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section id="resolution">\n' +
'      <span class="label">Name resolution</span>\n' +
'      <div class="card">\n' +
'        <p>The app sends whatever Android reports. Layers run in order, first hit wins:</p>\n' +
'        <ol>\n' +
'          <li><b>Builtin table</b> \u2014 common codes: <code>S928 &#8594; S24 Ultra</code>, <code>HUSKY &#8594; Pixel 8 Pro</code>, <code>CPH2581 &#8594; OnePlus 12</code>.</li>\n' +
'          <li><b>Samsung parser</b> \u2014 decodes SM/GT numbers: <code>SM-S928B &#8594; S24 Ultra</code>, <code>SM-A366B &#8594; A36</code>, <code>SM-F956B &#8594; Z Fold6</code>.</li>\n' +
'          <li><b>Device dictionary</b> \u2014 the synced <code>device:&lt;code&gt;</code> map covers the long tail.</li>\n' +
'          <li><b>Catalog scoring</b> \u2014 brand-aware token match against quicksearch; one-letter tokens ignored, exact matches return immediately.</li>\n' +
'        </ol>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section id="storage">\n' +
'      <span class="label">Storage</span>\n' +
'      <div class="card">\n' +
'        <table>\n' +
'          <tr><th>Key</th><th>Content</th></tr>\n' +
'          <tr><td class="key"><code>specs:url:&lt;id&gt;</code></td><td>Full JSON payload for one device. Permanent, no expiry.</td></tr>\n' +
'          <tr><td class="key"><code>url_map:&lt;query&gt;</code></td><td>Lowercased query &#8594; GSMArena URL. A device usually has two aliases: code + full name.</td></tr>\n' +
'          <tr><td class="key"><code>device:&lt;code&gt;</code></td><td>Model code &#8594; market name, e.g. <code>device:cph2581 &#8594; OnePlus 12</code>.</td></tr>\n' +
'          <tr><td class="key"><code>cache:gsm_quicksearch_catalog</code></td><td>Catalog snapshot, so matching does not re-download it per request.</td></tr>\n' +
'          <tr><td class="key"><code>gsm:quicksearch_url</code></td><td>Which snapshot URL is active.</td></tr>\n' +
'          <tr><td class="key"><code>lock:specs:&lt;query&gt;</code></td><td>Short lock (~22s): simultaneous requests for the same uncached phone wait instead of scraping twice.</td></tr>\n' +
'        </table>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section id="notes">\n' +
'      <span class="label">Notes</span>\n' +
'      <div class="card">\n' +
'        <ul class="plain">\n' +
'          <li><b>Cache never expires.</b> Cached specs are served as-is until purged via <code>/reset</code> or bypassed with <code>?refresh=1</code>.</li>\n' +
'          <li><b>Slow first loads time out.</b> Functions abort after 25s (10s for this page). A <code>502</code>/<code>404</code> with <code>timing_ms</code> usually means GSMArena was slow \u2014 retrying often works.</li>\n' +
'          <li><b>GET endpoints are public cross-origin</b> (<code>Access-Control-Allow-Origin: *</code>). Admin endpoints need the sync password.</li>\n' +
'          <li><b>Data belongs to GSMArena</b> and is shown for reference with a source link on every device.</li>\n' +
'        </ul>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <footer>\n' +
'      <p>\u00a9 2026 Toolz Project \u00b7 Specs engine v' + VERSION + ' \u00b7 Data &amp; images \u00a9 GSMArena</p>\n' +
'      <nav><a class="btn btn-outline" href="/spec">Catalog</a><a class="btn btn-outline" href="/">Home</a></nav>\n' +
'    </footer>\n' +
'  </div>\n' +
'</body>\n' +
'</html>';
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
      version: VERSION,
      infrastructure: 'Vercel serverless + Upstash Redis',
      source: 'GSMArena (spec text + images, shown with source link)',
      catalogUi: '/spec',
      pipeline: [
        'cache-check: url_map -> specs:url (cached:true on hit)',
        'dedup-lock: lock:specs:<query> (~22s, concurrent callers wait)',
        'discovery: builtin model map -> Samsung parser -> device:<code> dictionary (25k+) -> GSMArena quicksearch scoring',
        'extraction: Cheerio parse of spec page, proxy fallback',
        'store: specs:url:<id> + url_map aliases, no TTL',
      ],
      endpoints: [
        {
          method: 'GET',
          path: '/api/specs?model=<name-or-code>&refresh=1?',
          description: 'Resolve one device to full specifications.',
        },
        {
          method: 'GET',
          path: '/api/spec?json=1&q=<query>',
          description: 'Catalog feed for /spec. Returns totalInRedis, count, devices[].',
        },
        { method: 'GET', path: '/api/info?json=1', description: 'This document, machine-readable.' },
        {
          method: 'POST',
          path: '/api/sync-devices',
          description: 'Admin: rebuild device:<model> dictionary; actions invalidate-catalog, invalidate-specs.',
        },
        {
          method: 'POST',
          path: '/reset',
          description: 'Admin: purge specs:url:*, url_map:*, catalog snapshot, or a single model.',
        },
      ],
      redisSchema: {
        'specs:url:<id>': 'Full spec payload, permanent',
        'url_map:<query>': 'Lowercased query -> GSMArena URL',
        'device:<code>': 'Model code -> market name (25k+ entries)',
        'cache:gsm_quicksearch_catalog': 'GSMArena catalog snapshot',
        'gsm:quicksearch_url': 'Active catalog URL',
        'lock:specs:<query>': 'Short-lived dedup lock',
      },
      limits: {
        functionBudget: '25s maxDuration (10s for /api/info)',
        cacheTtl: 'none (permanent until purged)',
        cors: 'GET endpoints allow *',
      },
    });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(renderInfoHtml());
}
