import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Technical Documentation — Toolz specs backend.
 * Plain reference docs: what each endpoint does, with real examples.
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
'  <style>\n' +
'    :root { color-scheme: dark; }\n' +
'    * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'    body {\n' +
'      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n' +
'      background: #141218; color: #e8e2e9; line-height: 1.65;\n' +
'      -webkit-text-size-adjust: 100%;\n' +
'    }\n' +
'    .wrap { max-width: 860px; margin: 0 auto; padding: 24px 20px 72px; }\n' +
'    @media (min-width: 720px) { .wrap { padding: 48px 24px 96px; } }\n' +
'    .back { display: inline-block; font-size: 14px; color: #ffb37a; text-decoration: none; margin-bottom: 28px; }\n' +
'    .back:hover { text-decoration: underline; }\n' +
'    h1 { font-size: clamp(1.7rem, 4.5vw, 2.4rem); line-height: 1.15; letter-spacing: -0.01em; margin-bottom: 8px; }\n' +
'    .version { font-size: 13px; color: #8f889e; margin-bottom: 20px; }\n' +
'    .intro { font-size: 15.5px; color: #c9c2d4; max-width: 65ch; margin-bottom: 12px; }\n' +
'    .intro a, li a, td a, p.link a { color: #ffb37a; }\n' +
'    h2 { font-size: 1.25rem; margin: 44px 0 12px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.09); }\n' +
'    h3 { font-size: 1rem; margin: 22px 0 8px; }\n' +
'    p, li { font-size: 14.5px; color: #c9c2d4; }\n' +
'    p { margin-bottom: 10px; max-width: 72ch; }\n' +
'    ul, ol { padding-left: 22px; margin: 8px 0 12px; display: grid; gap: 6px; max-width: 72ch; }\n' +
'    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.87em;\n' +
'      background: rgba(255,255,255,0.07); border-radius: 6px; padding: 1px 6px; word-break: break-word; }\n' +
'    pre { background: #1c1a21; border: 1px solid rgba(255,255,255,0.09); border-radius: 14px;\n' +
'      padding: 16px 18px; overflow-x: auto; margin: 12px 0 16px; }\n' +
'    pre code { background: none; padding: 0; font-size: 12.5px; line-height: 1.6; color: #d8d2e0; word-break: normal; }\n' +
'    .endpoint { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 14px;\n' +
'      background: #1c1a21; border: 1px solid rgba(255,255,255,0.09); border-radius: 12px;\n' +
'      padding: 10px 14px; margin: 14px 0 4px; overflow-x: auto; white-space: nowrap; }\n' +
'    .get { color: #4de3c8; font-weight: 700; }\n' +
'    .post { color: #ffa04d; font-weight: 700; }\n' +
'    table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 13.5px; }\n' +
'    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;\n' +
'      color: #8f889e; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.12); }\n' +
'    td { padding: 9px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #c9c2d4; vertical-align: top; }\n' +
'    td:first-child { white-space: nowrap; }\n' +
'    footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.09);\n' +
'      font-size: 12.5px; color: #8f889e; display: flex; flex-wrap: wrap; gap: 6px 20px; justify-content: space-between; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="wrap">\n' +
'    <a class="back" href="/spec">&#8592; Back to Device Catalog</a>\n' +
'    <h1>Toolz specs API</h1>\n' +
'    <div class="version">Version ' + VERSION + ' &middot; <a href="/api/info?json=1" style="color:#ffb37a">machine-readable summary (?json=1)</a></div>\n' +
'    <p class="intro">This backend resolves a phone model name or hardware model code (for example what Android reports as <code>Build.MODEL</code>) into a full specification sheet. Spec text and images come from GSMArena; results are cached in Redis so repeat lookups return instantly. The <a href="/spec">Device Catalog</a> at <code>/spec</code> is the browsing UI on top of it.</p>\n' +
'\n' +
'    <h2>Worked example: resolving one phone</h2>\n' +
'    <p>Requesting this URL:</p>\n' +
'    <div class="endpoint"><span class="get">GET</span> /api/specs?model=SM-S928B</div>\n' +
'    <ol>\n' +
'      <li><b>Cache lookup.</b> The server checks Redis for <code>url_map:sm-s928b</code>. On a miss it keeps going; on a hit it returns the stored payload immediately with <code>"cached": true</code>.</li>\n' +
'      <li><b>Code to name.</b> <code>SM-S928B</code> matches the builtin Samsung pattern (S-series, generation 24, Ultra variant), giving <code>Samsung Galaxy S24 Ultra</code>.</li>\n' +
'      <li><b>Catalog match.</b> That name is scored against the GSMArena quicksearch catalog to find the device page URL.</li>\n' +
'      <li><b>Scrape.</b> The device page is fetched and parsed into sections (Network, Display, Platform, Battery, &#8230;). If a direct fetch is blocked, a proxy fallback is used.</li>\n' +
'      <li><b>Store.</b> The payload is saved in Redis under <code>specs:url:&lt;id&gt;</code> plus <code>url_map:</code> aliases for both the code and the full name, so either query hits the cache next time.</li>\n' +
'    </ol>\n' +
'    <p>A successful response looks like this (specifications trimmed):</p>\n' +
'    <pre><code>{\n' +
'  "search_query": "SM-S928B",\n' +
'  "search_name": "Samsung Galaxy S24 Ultra",\n' +
'  "matched_device": "Samsung Galaxy S24 Ultra",\n' +
'  "source_url": "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php",\n' +
'  "image": "https://fdn2.gsmarena.com/vv/bigpic/....jpg",\n' +
'  "specifications": {\n' +
'    "Network": { "Technology": "GSM / CDMA / HSPA / EVDO / LTE / 5G", "...": "..." },\n' +
'    "Display": { "Type": "Dynamic AMOLED 2X, 120Hz", "Size": "6.8 inches, ...", "...": "..." },\n' +
'    "...": {}\n' +
'  },\n' +
'  "timing_ms": 2314,\n' +
'  "cached": false\n' +
'}</code></pre>\n' +
'\n' +
'    <h2>Worked example: catalog search</h2>\n' +
'    <p>Requesting this URL (this is what the catalog page calls as you type):</p>\n' +
'    <div class="endpoint"><span class="get">GET</span> /api/spec?json=1&amp;q=pixel%209</div>\n' +
'    <ol>\n' +
'      <li>The server loads every cached payload (<code>specs:url:*</code>) and keeps entries whose device name or original query contains <code>pixel 9</code>.</li>\n' +
'      <li>If nothing matches, it resolves the query once through <code>/api/specs</code> and includes the fresh result, flagged with <code>"autoEnriched": true</code>. That is how searching a new phone adds it to the catalog.</li>\n' +
'      <li>If the cache is completely empty and no query was given, a small set of default flagships is resolved so the page is never blank.</li>\n' +
'    </ol>\n' +
'    <pre><code>{\n' +
'  "totalInRedis": 42,\n' +
'  "count": 3,\n' +
'  "query": "pixel 9",\n' +
'  "autoEnriched": false,\n' +
'  "devices": [ { "...": "same shape as above" } ]\n' +
'}</code></pre>\n' +
'\n' +
'    <h2>Endpoints</h2>\n' +
'\n' +
'    <h3>Resolve a single device</h3>\n' +
'    <div class="endpoint"><span class="get">GET</span> /api/specs?model=&lt;name-or-code&gt;&amp;refresh=1?</div>\n' +
'    <table>\n' +
'      <tr><th>Parameter</th><th>Meaning</th></tr>\n' +
'      <tr><td><code>model</code> (required)</td><td>Market name (<code>Pixel 9 Pro XL</code>) or hardware code (<code>SM-S928B</code>, <code>HUSKY</code>).</td></tr>\n' +
'      <tr><td><code>refresh=1</code> (optional)</td><td>Skip the cache and scrape again.</td></tr>\n' +
'    </table>\n' +
'    <p>Returns the payload shown above. Failures: <code>400</code> when <code>model</code> is missing, <code>404</code> when the device is not in the GSMArena catalog, <code>502</code> when the spec page could not be parsed, <code>500</code> on internal errors. Every response includes <code>timing_ms</code>.</p>\n' +
'    <p class="link"><a href="/api/specs?model=Samsung%20Galaxy%20S24%20Ultra">Try it: /api/specs?model=Samsung Galaxy S24 Ultra</a></p>\n' +
'\n' +
'    <h3>Catalog feed</h3>\n' +
'    <div class="endpoint"><span class="get">GET</span> /api/spec?json=1&amp;q=&lt;query&gt;</div>\n' +
'    <table>\n' +
'      <tr><th>Parameter</th><th>Meaning</th></tr>\n' +
'      <tr><td><code>q</code> (optional)</td><td>Case-insensitive substring filter over cached device names. Minimum 2 characters to trigger matching and auto-enrichment.</td></tr>\n' +
'      <tr><td><code>json=1</code></td><td>Without it, the endpoint serves the legacy server-rendered HTML catalog instead of JSON.</td></tr>\n' +
'    </table>\n' +
'    <p class="link"><a href="/api/spec?json=1&q=Pixel">Try it: /api/spec?json=1&amp;q=Pixel</a></p>\n' +
'\n' +
'    <h3>This documentation</h3>\n' +
'    <div class="endpoint"><span class="get">GET</span> /api/info</div>\n' +
'    <p>Serves this page. Add <code>?json=1</code> for the same information as JSON (engine, endpoints, Redis schema, limits).</p>\n' +
'\n' +
'    <h3>Rebuild the model dictionary (admin)</h3>\n' +
'    <div class="endpoint"><span class="post">POST</span> /api/sync-devices</div>\n' +
'    <p>Rebuilds the 25,000+ entry <code>device:&lt;model&gt;</code> dictionary from the Android device list. Password-protected. With <code>?action=invalidate-catalog</code> it clears the cached GSMArena catalog snapshot; with <code>?action=invalidate-specs</code> it clears all cached spec payloads and URL mappings.</p>\n' +
'\n' +
'    <h3>Clear cached data (admin)</h3>\n' +
'    <div class="endpoint"><span class="post">POST</span> /reset</div>\n' +
'    <p>Clears Redis cache: everything, only spec payloads (<code>specs:url:*</code>), only URL mappings (<code>url_map:*</code>), only the catalog snapshot, or a single model name. Password- and CSRF-protected; three wrong passwords locks the IP out for 15 minutes.</p>\n' +
'\n' +
'    <h2>How a model code becomes a spec page</h2>\n' +
'    <p>The Toolz app sends whatever Android reports (for example <code>SM-A366B</code> or <code>CPH2581</code>). Resolution runs through these layers in order, first hit wins:</p>\n' +
'    <ol>\n' +
'      <li><b>Builtin table.</b> Common codes compiled into the function, for example <code>S928 &#8594; Samsung Galaxy S24 Ultra</code>, <code>HUSKY &#8594; Google Pixel 8 Pro</code>, <code>CPH2581 &#8594; OnePlus 12</code>.</li>\n' +
'      <li><b>Samsung pattern parser.</b> Decodes SM/GT-style numbers structurally, for example <code>SM-S928B &#8594; S24 Ultra</code>, <code>SM-A366B &#8594; A36</code>, <code>SM-F956B &#8594; Z Fold6</code>.</li>\n' +
'      <li><b>Device dictionary.</b> The synced <code>device:&lt;code&gt;</code> map (25,000+ entries) covers the long tail of codes the table does not.</li>\n' +
'      <li><b>Catalog scoring.</b> Brand-aware token matching against the GSMArena quicksearch list. Single-letter tokens are ignored to avoid false positives; an exact match returns immediately.</li>\n' +
'    </ol>\n' +
'\n' +
'    <h2>What is stored in Redis</h2>\n' +
'    <table>\n' +
'      <tr><th>Key</th><th>Content</th></tr>\n' +
'      <tr><td><code>specs:url:&lt;id&gt;</code></td><td>The full JSON payload for one device. Kept permanently \u2014 no expiry.</td></tr>\n' +
'      <tr><td><code>url_map:&lt;query&gt;</code></td><td>Lowercased query string &#8594; GSMArena device URL. One device usually has at least two aliases (the code and the full name).</td></tr>\n' +
'      <tr><td><code>device:&lt;code&gt;</code></td><td>Hardware model code &#8594; market name, for example <code>device:cph2581 &#8594; OnePlus 12</code>.</td></tr>\n' +
'      <tr><td><code>cache:gsm_quicksearch_catalog</code></td><td>Snapshot of the GSMArena quicksearch catalog, so matching does not re-download it every request.</td></tr>\n' +
'      <tr><td><code>gsm:quicksearch_url</code></td><td>Which catalog snapshot URL is currently in use.</td></tr>\n' +
'      <tr><td><code>lock:specs:&lt;query&gt;</code></td><td>Short-lived lock (~22s). Simultaneous requests for the same uncached phone wait for the first one instead of scraping twice.</td></tr>\n' +
'    </table>\n' +
'\n' +
'    <h2>Behavior worth knowing</h2>\n' +
'    <ul>\n' +
'      <li><b>Cache never expires.</b> A cached spec is served as-is until purged via <code>/reset</code> or bypassed with <code>?refresh=1</code>. If a spec looks outdated, that is why.</li>\n' +
'      <li><b>Slow first loads time out.</b> Functions abort after 25 seconds (10 for this page). A <code>502</code> or <code>404</code> with <code>timing_ms</code> usually means GSMArena was slow \u2014 retrying often works, and a retry may hit the lock left by the first attempt.</li>\n' +
'      <li><b>GET endpoints are public cross-origin.</b> They send <code>Access-Control-Allow-Origin: *</code>, so browsers and the Toolz app can call them directly. Admin endpoints require the sync password.</li>\n' +
'      <li><b>Data belongs to GSMArena.</b> Spec text and images are shown for reference with a source link on every device in the catalog.</li>\n' +
'    </ul>\n' +
'\n' +
'    <footer>\n' +
'      <span>\u00a9 2026 Toolz Project \u00b7 Specs engine v' + VERSION + '</span>\n' +
'      <span>Spec data &amp; images \u00a9 GSMArena \u00b7 <a href="/spec" style="color:#ffb37a">Catalog</a> \u00b7 <a href="/" style="color:#ffb37a">Home</a></span>\n' +
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
