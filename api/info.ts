import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Technical Documentation — Toolz Backend
 * M3 Expressive docs page, matching the Toolz Device Catalog theme.
 */

const VERSION = '4.1.0';

function renderInfoHtml(): string {
  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <title>How specs work — Toolz</title>\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'  <meta name="description" content="How the Toolz Device Catalog resolves phone specs: endpoints, caching pipeline, Redis schema and limits.">\n' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">\n' +
'  <style>\n' +
'    :root {\n' +
'      --bg: #141218;\n' +
'      --card: #1e1c22;\n' +
'      --card-2: #25232c;\n' +
'      --border: rgba(255,255,255,0.09);\n' +
'      --text: #e8e2e9;\n' +
'      --muted: #a7a0b3;\n' +
'      --faint: #6f6a7c;\n' +
'      --primary: #ff6d00;\n' +
'      --on-primary: #ffffff;\n' +
'      --secondary: #00bfa5;\n' +
'      --radius: 24px;\n' +
'    }\n' +
'    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'    html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }\n' +
'    body {\n' +
'      font-family: "Google Sans Text", "Google Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;\n' +
'      background: var(--bg);\n' +
'      color: var(--text);\n' +
'      line-height: 1.6;\n' +
'      min-height: 100vh;\n' +
'      overflow-x: hidden;\n' +
'    }\n' +
'    ::selection { background: rgba(255,109,0,0.35); }\n' +
'    a { color: inherit; }\n' +
'    .bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }\n' +
'    .bg .blob { position: absolute; top: -220px; right: -160px; width: 560px; height: 560px;\n' +
'      background: radial-gradient(circle, rgba(255,109,0,0.16) 0%, transparent 70%); border-radius: 50%; }\n' +
'    .bg .grid { position: absolute; inset: 0; opacity: 0.05;\n' +
'      background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px);\n' +
'      background-size: 72px 72px; }\n' +
'    .wrap { position: relative; z-index: 1; max-width: 1020px; margin: 0 auto; padding: 20px 16px 64px; }\n' +
'    @media (min-width: 720px) { .wrap { padding: 40px 24px 88px; } }\n' +
'    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 32px; }\n' +
'    @media (min-width: 720px) { .topbar { margin-bottom: 48px; } }\n' +
'    .pill-btn { display: inline-flex; align-items: center; gap: 8px; text-decoration: none;\n' +
'      border: 1px solid var(--border); background: var(--card); color: var(--text);\n' +
'      border-radius: 999px; padding: 10px 18px; font-size: 13px; font-weight: 700; transition: border-color .2s, transform .15s; }\n' +
'    .pill-btn:hover { border-color: rgba(255,109,0,0.5); }\n' +
'    .pill-btn:active { transform: scale(0.97); }\n' +
'    .ver { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700;\n' +
'      letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);\n' +
'      border: 1px solid var(--border); background: var(--card); border-radius: 999px; padding: 10px 16px; }\n' +
'    .ver i { width: 8px; height: 8px; border-radius: 50%; background: var(--secondary); display: inline-block;\n' +
'      box-shadow: 0 0 0 4px rgba(0,191,165,0.15); }\n' +
'    .hero { text-align: center; margin-bottom: 28px; }\n' +
'    @media (min-width: 720px) { .hero { margin-bottom: 40px; } }\n' +
'    .kicker { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.18em;\n' +
'      text-transform: uppercase; color: var(--primary); background: rgba(255,109,0,0.1);\n' +
'      border: 1px solid rgba(255,109,0,0.25); border-radius: 999px; padding: 7px 16px; margin-bottom: 16px; }\n' +
'    h1 { font-family: "Google Sans", sans-serif; font-size: clamp(2rem, 6vw, 3.4rem);\n' +
'      line-height: 1.05; letter-spacing: -0.02em; font-weight: 700; margin-bottom: 12px; }\n' +
'    h1 em { font-style: italic; background: linear-gradient(135deg, #ff6d00, #00bfa5);\n' +
'      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }\n' +
'    .lede { color: var(--muted); font-size: 15px; max-width: 620px; margin: 0 auto 20px; }\n' +
'    @media (min-width: 720px) { .lede { font-size: 17px; } }\n' +
'    .meta { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }\n' +
'    .meta span { font-size: 12px; font-weight: 700; color: var(--muted); background: var(--card);\n' +
'      border: 1px solid var(--border); border-radius: 999px; padding: 7px 14px; }\n' +
'    .cta { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }\n' +
'    .btn-solid { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; background: var(--primary);\n' +
'      color: var(--on-primary); font-weight: 700; font-size: 14px; border-radius: 999px; padding: 12px 24px;\n' +
'      box-shadow: 0 8px 24px -8px rgba(255,109,0,0.6); transition: transform .15s, filter .2s; }\n' +
'    .btn-solid:hover { filter: brightness(1.08); }\n' +
'    .btn-solid:active { transform: scale(0.97); }\n' +
'    .btn-ghost { display: inline-flex; align-items: center; gap: 8px; text-decoration: none;\n' +
'      border: 1px solid var(--border); color: var(--text); font-weight: 700; font-size: 14px;\n' +
'      border-radius: 999px; padding: 12px 24px; background: var(--card); }\n' +
'    .btn-ghost:hover { border-color: rgba(255,109,0,0.5); }\n' +
'    .live { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 28px 0; }\n' +
'    @media (min-width: 720px) { .live { gap: 14px; } }\n' +
'    .live .cell { background: var(--card); border: 1px solid var(--border); border-radius: 18px;\n' +
'      padding: 14px 12px; text-align: center; }\n' +
'    @media (min-width: 720px) { .live .cell { border-radius: 22px; padding: 20px; } }\n' +
'    .live .num { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }\n' +
'    @media (min-width: 720px) { .live .num { font-size: 26px; } }\n' +
'    .live .lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--faint); margin-top: 2px; }\n' +
'    section.block { margin-bottom: 28px; }\n' +
'    @media (min-width: 720px) { section.block { margin-bottom: 40px; } }\n' +
'    .label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.2em;\n' +
'      text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }\n' +
'    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }\n' +
'    @media (min-width: 720px) { .card { padding: 28px; } }\n' +
'    .steps { display: grid; gap: 10px; }\n' +
'    @media (min-width: 900px) { .steps { grid-template-columns: repeat(5, 1fr); } }\n' +
'    .step { background: var(--card-2); border: 1px solid var(--border); border-radius: 18px; padding: 16px; }\n' +
'    .step .n { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;\n' +
'      border-radius: 10px; background: rgba(255,109,0,0.14); color: var(--primary);\n' +
'      font-size: 13px; font-weight: 700; margin-bottom: 10px; }\n' +
'    .step h3 { font-size: 14px; margin-bottom: 4px; }\n' +
'    .step p { font-size: 12.5px; color: var(--muted); }\n' +
'    .step code, .ep code, .schema code, .detail code { font-family: "Roboto Mono", ui-monospace, monospace;\n' +
'      font-size: 0.86em; color: #ffb37a; background: rgba(255,109,0,0.08);\n' +
'      border-radius: 6px; padding: 1px 6px; word-break: break-word; }\n' +
'    .eps { display: grid; gap: 10px; }\n' +
'    @media (min-width: 860px) { .eps { grid-template-columns: 1fr 1fr; } }\n' +
'    .ep { background: var(--card-2); border: 1px solid var(--border); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 8px; }\n' +
'    .ep.wide { grid-column: 1 / -1; }\n' +
'    .ep .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }\n' +
'    .method { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; border-radius: 999px; padding: 4px 10px; }\n' +
'    .method.get { background: rgba(0,191,165,0.12); color: #4de3c8; border: 1px solid rgba(0,191,165,0.3); }\n' +
'    .method.post { background: rgba(255,109,0,0.12); color: #ffa04d; border: 1px solid rgba(255,109,0,0.3); }\n' +
'    .path { font-family: "Roboto Mono", monospace; font-size: 13px; font-weight: 500; word-break: break-all; }\n' +
'    .ep p { font-size: 13px; color: var(--muted); }\n' +
'    .ep ul { list-style: none; display: grid; gap: 4px; }\n' +
'    .ep li { font-size: 12.5px; color: var(--muted); padding-left: 16px; position: relative; }\n' +
'    .ep li::before { content: ""; position: absolute; left: 2px; top: 9px; width: 6px; height: 6px;\n' +
'      border-radius: 50%; background: var(--primary); opacity: 0.7; }\n' +
'    .try { margin-top: auto; padding-top: 6px; }\n' +
'    .try a { font-size: 12.5px; font-weight: 700; color: var(--primary); text-decoration: none; }\n' +
'    .try a:hover { text-decoration: underline; }\n' +
'    .two { display: grid; gap: 10px; }\n' +
'    @media (min-width: 860px) { .two { grid-template-columns: 1.15fr 1fr; } }\n' +
'    .schema-row { display: flex; flex-direction: column; gap: 2px; padding: 12px 0; border-bottom: 1px solid var(--border); }\n' +
'    .schema-row:last-child { border-bottom: none; }\n' +
'    @media (min-width: 720px) { .schema-row { flex-direction: row; justify-content: space-between; gap: 16px; align-items: baseline; } }\n' +
'    .schema-key { font-family: "Roboto Mono", monospace; font-size: 12.5px; color: #ffb37a; font-weight: 500; }\n' +
'    .schema-val { font-size: 12.5px; color: var(--muted); }\n' +
'    .detail h3 { font-size: 14px; margin: 16px 0 6px; }\n' +
'    .detail h3:first-child { margin-top: 0; }\n' +
'    .detail p, .detail li { font-size: 13px; color: var(--muted); }\n' +
'    .detail ul { padding-left: 18px; display: grid; gap: 4px; margin-top: 6px; }\n' +
'    .notes { display: grid; gap: 8px; }\n' +
'    .note { display: flex; gap: 10px; font-size: 13px; color: var(--muted); background: var(--card-2);\n' +
'      border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; }\n' +
'    .note b { color: var(--text); }\n' +
'    footer { border: 1px solid var(--border); background: var(--card); border-radius: var(--radius);\n' +
'      padding: 20px; display: flex; flex-direction: column; gap: 12px; }\n' +
'    @media (min-width: 720px) { footer { flex-direction: row; align-items: center; justify-content: space-between; padding: 24px 28px; } }\n' +
'    footer p { font-size: 12px; color: var(--faint); }\n' +
'    footer nav { display: flex; gap: 8px; flex-wrap: wrap; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="bg" aria-hidden="true"><div class="blob"></div><div class="grid"></div></div>\n' +
'  <div class="wrap">\n' +
'    <div class="topbar">\n' +
'      <a class="pill-btn" href="/spec">&#8592; Device Catalog</a>\n' +
'      <span class="ver"><i></i>API docs &middot; v' + VERSION + '</span>\n' +
'    </div>\n' +
'\n' +
'    <header class="hero">\n' +
'      <span class="kicker">Toolz backend</span>\n' +
'      <h1>How Toolz specs <em>work.</em></h1>\n' +
'      <p class="lede">Type a phone name, get full hardware specs. Search hits a serverless API backed by Redis \u2014 cached results return instantly, new ones are resolved from GSMArena and stored for next time.</p>\n' +
'      <div class="meta"><span>Vercel serverless</span><span>Upstash Redis</span><span>Source: GSMArena</span></div>\n' +
'      <div class="cta">\n' +
'        <a class="btn-solid" href="/spec">Open the catalog</a>\n' +
'        <a class="btn-ghost" href="/api/info?json=1">View as JSON</a>\n' +
'      </div>\n' +
'    </header>\n' +
'\n' +
'    <div class="live" id="live" hidden>\n' +
'      <div class="cell"><div class="num" id="live-count">\u2014</div><div class="lbl">Devices stored</div></div>\n' +
'      <div class="cell"><div class="num" id="live-showing">\u2014</div><div class="lbl">Returned by API</div></div>\n' +
'      <div class="cell"><div class="num">25s</div><div class="lbl">Function budget</div></div>\n' +
'    </div>\n' +
'\n' +
'    <section class="block">\n' +
'      <span class="label">Request pipeline</span>\n' +
'      <div class="card"><div class="steps">\n' +
'        <div class="step"><span class="n">1</span><h3>Cache check</h3><p><code>url_map</code> \u2192 <code>specs:url</code>. Hit returns in milliseconds with <code>cached: true</code>.</p></div>\n' +
'        <div class="step"><span class="n">2</span><h3>Dedup lock</h3><p>Concurrent requests for the same query wait on <code>lock:specs</code> instead of scraping twice.</p></div>\n' +
'        <div class="step"><span class="n">3</span><h3>Discovery</h3><p>Model code \u2192 market name \u2192 GSMArena URL via builtin map, Samsung parser, device dictionary and quicksearch scoring.</p></div>\n' +
'        <div class="step"><span class="n">4</span><h3>Extraction</h3><p>Spec page fetched and parsed (Cheerio), with a proxy fallback if direct fetch is blocked.</p></div>\n' +
'        <div class="step"><span class="n">5</span><h3>Stored forever</h3><p>Payload saved to <code>specs:url</code> plus query aliases. No expiry \u2014 later searches are instant.</p></div>\n' +
'      </div></div>\n' +
'    </section>\n' +
'\n' +
'    <section class="block">\n' +
'      <span class="label">Endpoints</span>\n' +
'      <div class="eps">\n' +
'        <div class="ep">\n' +
'          <div class="row"><span class="method get">GET</span><span class="path">/api/specs?model=&#8230;</span></div>\n' +
'          <p>Resolve a single device to full specs. Powers model-code lookups in the Toolz app.</p>\n' +
'          <ul><li><code>model</code> required \u2014 e.g. <code>SM-S928B</code>, <code>Pixel 9 Pro XL</code></li>\n' +
'          <li><code>refresh=1</code> optional \u2014 skip cache, scrape fresh</li>\n' +
'          <li>Returns <code>matched_device</code>, <code>image</code>, <code>specifications</code>, <code>timing_ms</code>, <code>cached</code></li></ul>\n' +
'          <div class="try"><a href="/api/specs?model=Samsung%20Galaxy%20S24%20Ultra">Try it \u2192</a></div>\n' +
'        </div>\n' +
'        <div class="ep">\n' +
'          <div class="row"><span class="method get">GET</span><span class="path">/api/spec?json=1&amp;q=&#8230;</span></div>\n' +
'          <p>Catalog feed behind the <b>/spec</b> page. Lists cached devices, filters by query, auto-fetches new matches.</p>\n' +
'          <ul><li><code>q</code> optional search text</li>\n' +
'          <li>Returns <code>totalInRedis</code>, <code>count</code>, <code>devices[]</code></li>\n' +
'          <li>Without <code>json=1</code> serves the legacy HTML catalog</li></ul>\n' +
'          <div class="try"><a href="/api/spec?json=1&q=Pixel">Try it \u2192</a></div>\n' +
'        </div>\n' +
'        <div class="ep">\n' +
'          <div class="row"><span class="method get">GET</span><span class="path">/api/info</span></div>\n' +
'          <p>This page. Append <code>?json=1</code> for the machine-readable summary (engine, endpoints, schema).</p>\n' +
'          <div class="try"><a href="/api/info?json=1">Try it \u2192</a></div>\n' +
'        </div>\n' +
'        <div class="ep">\n' +
'          <div class="row"><span class="method post">POST</span><span class="path">/api/sync-devices</span></div>\n' +
'          <p>Admin only. Rebuilds the 25,000+ entry <code>device:&lt;model&gt;</code> dictionary from the Android device list.</p>\n' +
'          <ul><li>Password protected</li><li><code>?action=invalidate-catalog</code> clears the quicksearch snapshot</li>\n' +
'          <li><code>?action=invalidate-specs</code> clears cached spec payloads</li></ul>\n' +
'        </div>\n' +
'        <div class="ep wide">\n' +
'          <div class="row"><span class="method post">POST</span><span class="path">/reset</span></div>\n' +
'          <p>Admin only. Purges Redis cache: full purge, <code>specs:url:*</code>, <code>url_map:*</code>, catalog snapshot, or one model. Password + CSRF protected with a 3-attempt IP lockout.</p>\n' +
'        </div>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section class="block">\n' +
'      <span class="label">Data &amp; storage</span>\n' +
'      <div class="two">\n' +
'        <div class="card"><span class="label">Redis schema</span>\n' +
'          <div class="schema">\n' +
'            <div class="schema-row"><span class="schema-key">specs:url:&lt;id&gt;</span><span class="schema-val">Full spec payload \u00b7 kept permanently</span></div>\n' +
'            <div class="schema-row"><span class="schema-key">url_map:&lt;query&gt;</span><span class="schema-val">Lowercased query \u2192 GSMArena URL</span></div>\n' +
'            <div class="schema-row"><span class="schema-key">device:&lt;code&gt;</span><span class="schema-val">Model code \u2192 market name (25k+ entries)</span></div>\n' +
'            <div class="schema-row"><span class="schema-key">cache:gsm_quicksearch_catalog</span><span class="schema-val">GSMArena catalog snapshot</span></div>\n' +
'            <div class="schema-row"><span class="schema-key">gsm:quicksearch_url</span><span class="schema-val">Active catalog URL</span></div>\n' +
'            <div class="schema-row"><span class="schema-key">lock:specs:&lt;query&gt;</span><span class="schema-val">Short-lived dedup lock (~22s)</span></div>\n' +
'          </div>\n' +
'        </div>\n' +
'        <div class="card detail"><span class="label">Name resolution</span>\n' +
'          <h3>Builtin model map</h3>\n' +
'          <p>Common codes ship in the function: <code>S928 \u2192 S24 Ultra</code>, <code>HUSKY \u2192 Pixel 8 Pro</code>, <code>CPH2581 \u2192 OnePlus 12</code>.</p>\n' +
'          <h3>Samsung parser</h3>\n' +
'          <p>Dynamic patterns decode SM/GT numbers: <code>SM-S928B \u2192 S24 Ultra</code>, <code>SM-A366B \u2192 A36</code>, <code>SM-F956B \u2192 Z Fold6</code>.</p>\n' +
'          <h3>Catalog scoring</h3>\n' +
'          <p>Brand-aware token match against the GSMArena quicksearch list. One-letter tokens are ignored; exact matches return immediately.</p>\n' +
'        </div>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <section class="block">\n' +
'      <span class="label">Good to know</span>\n' +
'      <div class="notes">\n' +
'        <div class="note"><span>\ud83d\udc8e</span><span><b>Cache is permanent.</b> Entries have no expiry, so repeats are instant. Stale data is fixed via <b>/reset</b> or <b>?refresh=1</b>.</span></div>\n' +
'        <div class="note"><span>\u23f1\ufe0f</span><span><b>25-second budget.</b> Scrapes abort if GSMArena is slow; the API returns 502/404 with <b>timing_ms</b> so you can retry.</span></div>\n' +
'        <div class="note"><span>\ud83c\udf10</span><span><b>Open CORS.</b> <b>GET</b> endpoints allow any origin \u2014 safe to call from browsers and the Toolz app.</span></div>\n' +
'        <div class="note"><span>\u00a9\ufe0f</span><span><b>Credit where due.</b> Spec text and images belong to GSMArena and are shown for reference with a source link on every device.</span></div>\n' +
'      </div>\n' +
'    </section>\n' +
'\n' +
'    <footer>\n' +
'      <p>\u00a9 2026 Toolz Project \u00b7 Specs engine v' + VERSION + ' \u00b7 Data &amp; images \u00a9 GSMArena</p>\n' +
'      <nav><a class="pill-btn" href="/spec">Catalog</a><a class="pill-btn" href="/">Home</a></nav>\n' +
'    </footer>\n' +
'  </div>\n' +
'  <script>\n' +
'    (function () {\n' +
'      fetch("/api/spec?json=1&q=", { headers: { accept: "application/json" } })\n' +
'        .then(function (r) { return r.ok ? r.json() : null; })\n' +
'        .then(function (d) {\n' +
'          if (!d) return;\n' +
'          document.getElementById("live").hidden = false;\n' +
'          if (d.totalInRedis != null) document.getElementById("live-count").textContent = d.totalInRedis;\n' +
'          if (d.count != null) document.getElementById("live-showing").textContent = d.count;\n' +
'        })\n' +
'        .catch(function () {});\n' +
'    })();\n' +
'  </script>\n' +
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
