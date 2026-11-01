import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Technical documentation for the Toolz specs backend.
 * Served as a standalone HTML reference at /api/info, with the same
 * information available as JSON at /api/info?json=1.
 */

const VERSION = '4.1.0';
const SITE = 'https://toolz-app.vercel.app';

function renderInfoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Toolz specs API — reference</title>
  <meta name="description" content="Reference for the Toolz specs backend: endpoint contracts, response shapes, phone model resolution, Redis storage and caching behaviour.">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="theme-color" content="#120922">
  <meta name="color-scheme" content="dark">
  <link rel="canonical" href="${SITE}/api/info">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Toolz">
  <meta property="og:title" content="Toolz specs API — reference">
  <meta property="og:description" content="Endpoint contracts, response shapes, model-code resolution and caching behaviour for the Toolz specs engine.">
  <meta property="og:url" content="${SITE}/api/info">
  <meta property="og:image" content="${SITE}/logo.png">
  <meta property="og:image:width" content="1080">
  <meta property="og:image:height" content="1080">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Toolz specs API — reference">
  <meta name="twitter:description" content="Endpoint contracts, response shapes, model-code resolution and caching behaviour for the Toolz specs engine.">
  <meta name="twitter:image" content="${SITE}/logo.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Google+Sans+Text:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Toolz specs API reference",
    "description": "Endpoint contracts, response shapes, phone model resolution and caching behaviour for the Toolz specs engine.",
    "url": "${SITE}/api/info",
    "inLanguage": "en",
    "version": "${VERSION}",
    "author": { "@type": "Organization", "name": "Toolz", "url": "${SITE}/" },
    "publisher": {
      "@type": "Organization",
      "name": "Toolz",
      "url": "${SITE}/",
      "logo": { "@type": "ImageObject", "url": "${SITE}/logo.png" }
    }
  }
  </script>

  <style>
    :root {
      --bg: #120922;
      --surface: #180d2a;
      --surface-2: #1d1230;
      --inset: #0b0516;
      --line: rgba(201, 165, 238, 0.13);
      --line-strong: rgba(201, 165, 238, 0.26);
      --text: #efe7f8;
      --muted: #c6b6d8;
      --faint: #9c8cb4;
      --primary: #8b55c9;
      --primary-soft: #b98ae6;
      --lavender: #c9a5ee;
      --lilac: #e0b6f2;
      --mono: "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      --sans: "Google Sans Text", "Google Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      --display: "Google Sans", "Google Sans Text", system-ui, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--sans);
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.05;
      background-image:
        linear-gradient(var(--line-strong) 1px, transparent 1px),
        linear-gradient(90deg, var(--line-strong) 1px, transparent 1px);
      background-size: 80px 80px;
    }

    body::after {
      content: "";
      position: fixed;
      inset: 0 0 auto;
      height: 420px;
      z-index: 0;
      pointer-events: none;
      background: radial-gradient(680px 320px at 22% -90px, rgba(139, 85, 201, 0.28), transparent 70%);
    }

    ::selection { background: rgba(139, 85, 201, 0.45); color: #fff; }

    a { color: var(--lavender); text-decoration: none; }
    a:hover { color: var(--lilac); }

    .shell {
      position: relative;
      z-index: 1;
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 18px 72px;
    }

    @media (min-width: 720px) { .shell { padding: 0 28px 96px; } }

    /* Top bar */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 0;
      border-bottom: 1px solid var(--line);
    }

    .brand { display: flex; align-items: center; gap: 12px; color: var(--text); }
    .brand:hover { color: var(--text); }
    .brand img {
      width: 36px; height: 36px; object-fit: cover;
      border: 1px solid var(--line-strong);
      background: rgba(139, 85, 201, 0.12);
      transform: scale(1.02);
    }
    .brand-name { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.2; }
    .brand-sub {
      font-family: var(--mono); font-size: 8px; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--faint);
    }

    .top-actions { display: flex; align-items: center; gap: 8px; }

    .chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 12px; border: 1px solid var(--line);
      font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--muted); white-space: nowrap;
    }
    .chip i {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--lavender);
      box-shadow: 0 0 0 3px rgba(201, 165, 238, 0.14);
    }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 16px; border: 1px solid transparent;
      font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; white-space: nowrap;
      transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.15s;
    }
    .btn:active { transform: scale(0.98); }
    .btn-outline { border-color: var(--line-strong); color: var(--text); background: transparent; }
    .btn-outline:hover { border-color: rgba(201, 165, 238, 0.55); color: var(--lilac); }
    .btn-solid { background: var(--primary); color: #fff; }
    .btn-solid:hover { background: #9a64d6; color: #fff; }
    .btn-small { padding: 8px 12px; font-size: 10px; }

    /* Layout */
    .layout {
      display: grid;
      grid-template-columns: 210px minmax(0, 1fr);
      gap: 56px;
      align-items: start;
    }

    @media (max-width: 920px) {
      .layout { grid-template-columns: minmax(0, 1fr); gap: 0; }
      .rail { display: none; }
    }

    .rail { position: sticky; top: 24px; padding-top: 40px; }

    .rail-label {
      font-family: var(--mono); font-size: 8px; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--faint); margin-bottom: 14px;
    }

    .toc { list-style: none; display: grid; gap: 2px; }
    .toc a {
      display: flex; align-items: baseline; gap: 10px;
      padding: 7px 0; color: var(--muted);
      font-size: 12px; border-bottom: 1px solid transparent;
    }
    .toc a:hover { color: var(--lilac); border-bottom-color: var(--line); }
    .toc .n {
      font-family: var(--mono); font-size: 8px; color: var(--primary-soft);
      min-width: 16px;
    }

    .rail-note {
      margin-top: 22px; padding-top: 16px; border-top: 1px solid var(--line);
      font-family: var(--mono); font-size: 8px; line-height: 1.9;
      letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint);
    }

    /* Hero */
    .hero { padding: 48px 0 40px; }
    @media (min-width: 720px) { .hero { padding: 64px 0 52px; } }

    .eyebrow {
      display: flex; align-items: center; gap: 12px;
      font-family: var(--mono); font-size: 9px; font-weight: 500;
      letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary-soft);
      margin-bottom: 18px;
    }
    .eyebrow::before { content: ""; width: 32px; height: 1px; background: var(--primary-soft); }

    h1 {
      font-family: var(--display);
      font-size: clamp(2.4rem, 6.5vw, 4.2rem);
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.035em;
      max-width: 820px;
    }
    h1 span { color: rgba(239, 231, 248, 0.5); }

    .lede {
      margin-top: 22px;
      max-width: 680px;
      font-size: 15px;
      line-height: 1.75;
      color: var(--muted);
    }
    .lede code { font-size: 0.88em; }

    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }

    .facts {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px; margin-top: 34px;
      border: 1px solid var(--line); background: var(--line);
      max-width: 680px;
    }
    @media (min-width: 640px) { .facts { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    .fact { background: var(--surface); padding: 14px 16px; }
    .fact dt {
      font-family: var(--mono); font-size: 8px; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--faint); margin-bottom: 4px;
    }
    .fact dd { font-family: var(--mono); font-size: 12px; color: var(--text); }

    /* Sections */
    section { padding: 34px 0; border-top: 1px solid var(--line); scroll-margin-top: 20px; }
    @media (min-width: 720px) { section { padding: 44px 0; } }

    .section-head { margin-bottom: 20px; }
    .kicker {
      display: block; font-family: var(--mono); font-size: 9px; font-weight: 500;
      letter-spacing: 0.2em; text-transform: uppercase; color: var(--primary-soft);
      margin-bottom: 8px;
    }
    h2 {
      font-family: var(--display); font-size: clamp(1.35rem, 3vw, 1.75rem);
      font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;
    }
    .section-head p { margin-top: 8px; max-width: 70ch; font-size: 13.5px; color: var(--muted); }

    .card {
      background: var(--surface);
      border: 1px solid var(--line);
      padding: 22px;
    }
    @media (min-width: 720px) { .card { padding: 28px 30px; } }

    .card h3 {
      font-size: 14px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.01em;
    }
    .card p, .card li { font-size: 13.5px; color: var(--muted); }
    .card p { max-width: 72ch; }
    .card p + p { margin-top: 10px; }
    .card b { color: var(--text); font-weight: 600; }
    .card ul.plain { list-style: none; display: grid; gap: 10px; margin-top: 10px; }
    .card ul.plain li {
      padding-left: 14px; border-left: 2px solid rgba(139, 85, 201, 0.5);
    }
    .card ol { padding-left: 20px; display: grid; gap: 9px; margin-top: 10px; max-width: 72ch; }
    .card ol li::marker { color: var(--primary-soft); font-family: var(--mono); font-size: 0.85em; }

    /* Steps */
    .steps { display: grid; gap: 1px; background: var(--line); border: 1px solid var(--line); margin-top: 18px; }
    @media (min-width: 820px) { .steps { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
    .step { background: var(--surface-2); padding: 16px; }
    .step .n {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; margin-bottom: 10px;
      border: 1px solid var(--line-strong);
      font-family: var(--mono); font-size: 10px; color: var(--primary-soft);
    }
    .step h4 { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
    .step p { font-size: 11.5px; line-height: 1.6; }

    /* Endpoints */
    .eps { display: grid; gap: 12px; }
    @media (min-width: 860px) { .eps { grid-template-columns: 1fr 1fr; } }
    .ep {
      display: flex; flex-direction: column; gap: 10px;
      background: var(--surface); border: 1px solid var(--line); padding: 18px;
    }
    .ep.full { grid-column: 1 / -1; }
    .ep-head { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
    .method {
      font-family: var(--mono); font-size: 8px; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 3px 8px; border: 1px solid var(--line-strong); color: var(--lavender);
    }
    .method.post { color: var(--lilac); border-color: rgba(224, 182, 242, 0.35); }
    .path { font-family: var(--mono); font-size: 12px; color: var(--text); word-break: break-all; }
    .ep p { font-size: 12.5px; }
    .try { margin-top: auto; padding-top: 4px; }
    .try a {
      font-family: var(--mono); font-size: 9px; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary-soft);
    }
    .try a:hover { color: var(--lilac); }

    /* Code */
    code {
      font-family: var(--mono);
      font-size: 0.86em;
      background: rgba(201, 165, 238, 0.09);
      border: 1px solid rgba(201, 165, 238, 0.1);
      padding: 1px 5px;
      color: #e9dcf8;
      word-break: break-word;
    }

    .codebox { margin-top: 18px; border: 1px solid var(--line); background: var(--inset); }
    .codebar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 8px 14px; border-bottom: 1px solid var(--line);
      font-family: var(--mono); font-size: 8px; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--faint);
    }
    pre { overflow-x: auto; padding: 16px 18px; }
    pre code {
      background: none; border: 0; padding: 0;
      font-size: 12px; line-height: 1.7; color: #dccdf0;
      word-break: normal; white-space: pre;
    }

    /* Tables */
    .table-wrap { margin-top: 16px; overflow-x: auto; border: 1px solid var(--line); }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 460px; }
    th {
      text-align: left; padding: 9px 12px;
      font-family: var(--mono); font-size: 8px; font-weight: 500;
      letter-spacing: 0.14em; text-transform: uppercase; color: var(--faint);
      border-bottom: 1px solid var(--line); background: var(--surface-2);
    }
    td {
      padding: 11px 12px; color: var(--muted); vertical-align: top;
      border-bottom: 1px solid rgba(201, 165, 238, 0.08);
    }
    tr:last-child td { border-bottom: 0; }
    tr:hover td { background: rgba(139, 85, 201, 0.05); }
    td.key { white-space: nowrap; }

    /* Footer */
    footer {
      display: flex; flex-direction: column; gap: 12px;
      margin-top: 12px; padding-top: 22px; border-top: 1px solid var(--line);
    }
    @media (min-width: 720px) {
      footer { flex-direction: row; align-items: center; justify-content: space-between; }
    }
    footer p {
      font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--faint);
    }
    footer nav { display: flex; gap: 8px; flex-wrap: wrap; }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      * { transition: none !important; }
    }
  </style>
</head>
<body>
  <a class="btn btn-outline btn-small" href="#main" style="position:absolute;left:-9999px;top:0;z-index:10" onfocus="this.style.left='12px';this.style.top='12px'" onblur="this.style.left='-9999px'">Skip to content</a>

  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/spec" aria-label="Toolz Spec Index">
        <img src="/logo.png" alt="">
        <span>
          <span class="brand-name">Toolz</span><br>
          <span class="brand-sub">Spec index</span>
        </span>
      </a>
      <div class="top-actions">
        <span class="chip"><i></i>API reference · v${VERSION}</span>
        <a class="btn btn-outline btn-small" href="/spec">Catalog</a>
      </div>
    </header>

    <div class="layout">
      <aside class="rail">
        <div class="rail-label">On this page</div>
        <nav aria-label="Documentation sections">
          <ol class="toc">
            <li><a href="#example"><span class="n">01</span>Worked example</a></li>
            <li><a href="#catalog"><span class="n">02</span>Catalog search</a></li>
            <li><a href="#endpoints"><span class="n">03</span>Endpoints</a></li>
            <li><a href="#resolution"><span class="n">04</span>Model resolution</a></li>
            <li><a href="#storage"><span class="n">05</span>Storage</a></li>
            <li><a href="#notes"><span class="n">06</span>Notes &amp; limits</a></li>
          </ol>
        </nav>
        <div class="rail-note">
          Engine v${VERSION}<br>
          Vercel + Upstash<br>
          JSON available
        </div>
      </aside>

      <main id="main">
        <section class="hero" style="border-top:0">
          <div class="eyebrow">Public reference</div>
          <h1>The Toolz specs engine. <span>One query, a full datasheet.</span></h1>
          <p class="lede">
            Send a phone name or hardware model code — like Android's <code>Build.MODEL</code> —
            and get a structured spec sheet back. Data is read from GSMArena, normalised, and
            cached in Redis so repeat lookups are effectively instant. The
            <a href="/spec">Device Catalog</a> is the browsing UI built on top of it.
          </p>

          <div class="actions">
            <a class="btn btn-solid" href="/spec">Open the catalog</a>
            <a class="btn btn-outline" href="/api/spec?json=1&amp;q=Pixel">Try a live query</a>
            <a class="btn btn-outline" href="/api/info?json=1">Read as JSON</a>
          </div>

          <dl class="facts">
            <div class="fact"><dt>Base URL</dt><dd>toolz-app.vercel.app</dd></div>
            <div class="fact"><dt>Auth</dt><dd>GET is public</dd></div>
            <div class="fact"><dt>Cache</dt><dd>Redis, no TTL</dd></div>
            <div class="fact"><dt>Source</dt><dd>GSMArena</dd></div>
          </dl>
        </section>

        <section id="example">
          <div class="section-head">
            <span class="kicker">01 / Worked example</span>
            <h2>Resolving one phone</h2>
            <p>What happens when a client asks for a single Samsung model code.</p>
          </div>
          <div class="card">
            <h3>GET <code>/api/specs?model=SM-S928B</code></h3>
            <div class="steps">
              <div class="step">
                <span class="n">1</span>
                <h4>Cache lookup</h4>
                <p>Checks Redis for <code>url_map:sm-s928b</code>. A hit returns the stored payload with <code>"cached": true</code>.</p>
              </div>
              <div class="step">
                <span class="n">2</span>
                <h4>Code to name</h4>
                <p><code>SM-S928B</code> matches the built-in Samsung pattern: S-series, generation 24, Ultra variant.</p>
              </div>
              <div class="step">
                <span class="n">3</span>
                <h4>Catalog match</h4>
                <p>The resolved name is scored against the GSMArena quicksearch catalog to find the device page.</p>
              </div>
              <div class="step">
                <span class="n">4</span>
                <h4>Extract</h4>
                <p>The page is fetched and parsed into sections — Network, Display, Platform, Battery and so on — with a proxy fallback.</p>
              </div>
              <div class="step">
                <span class="n">5</span>
                <h4>Store</h4>
                <p>Saved under <code>specs:url:&lt;id&gt;</code> plus aliases for the code and full name.</p>
              </div>
            </div>

            <div class="codebox">
              <div class="codebar"><span>200 OK · application/json</span><span>trimmed response</span></div>
              <pre><code>{
  "search_query": "SM-S928B",
  "search_name": "Samsung Galaxy S24 Ultra",
  "matched_device": "Samsung Galaxy S24 Ultra",
  "source_url": "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php",
  "image": "https://fdn2.gsmarena.com/vv/bigpic/....jpg",
  "specifications": {
    "Network": { "Technology": "GSM / CDMA / HSPA / EVDO / LTE / 5G" },
    "Display": { "Type": "Dynamic AMOLED 2X, 120Hz", "Size": "6.8 inches" }
  },
  "timing_ms": 2314,
  "cached": false
}</code></pre>
            </div>
          </div>
        </section>

        <section id="catalog">
          <div class="section-head">
            <span class="kicker">02 / Catalog search</span>
            <h2>What the catalog page calls</h2>
            <p>The same endpoint powers search, brand filters and the initial grid on <a href="/spec">/spec</a>.</p>
          </div>
          <div class="card">
            <h3>GET <code>/api/spec?json=1&amp;q=pixel%209</code></h3>
            <ol>
              <li>Loads cached payloads and keeps entries whose device name or original query contains <code>pixel 9</code>.</li>
              <li>If nothing matches, the query is resolved once through <code>/api/specs</code> and included with <code>"autoEnriched": true</code>. That is how a new search adds itself to the catalog.</li>
              <li>If the cache is empty and no query was given, a few default flagships are resolved so the grid is never blank.</li>
            </ol>

            <div class="codebox">
              <div class="codebar"><span>200 OK · application/json</span><span>catalog envelope</span></div>
              <pre><code>{
  "totalInRedis": 42,
  "count": 3,
  "query": "pixel 9",
  "autoEnriched": false,
  "devices": [ { "...": "same shape as above" } ]
}</code></pre>
            </div>
          </div>
        </section>

        <section id="endpoints">
          <div class="section-head">
            <span class="kicker">03 / Endpoints</span>
            <h2>Contracts</h2>
            <p>Five endpoints cover lookups, the catalog feed, this document, and cache maintenance.</p>
          </div>

          <div class="eps">
            <div class="ep">
              <div class="ep-head"><span class="method">GET</span><span class="path">/api/specs?model=…</span></div>
              <p>
                Resolve one device. <code>model</code> is required — a market name or code such as
                <code>Pixel 9 Pro XL</code> or <code>HUSKY</code>. Add <code>refresh=1</code> to skip
                the cache. Errors: <code>400</code> missing param, <code>404</code> not in catalog,
                <code>502</code> parse failed. Responses include <code>timing_ms</code>.
              </p>
              <div class="try"><a href="/api/specs?model=Samsung%20Galaxy%20S24%20Ultra">Try it →</a></div>
            </div>

            <div class="ep">
              <div class="ep-head"><span class="method">GET</span><span class="path">/api/spec?json=1&amp;q=…</span></div>
              <p>
                Catalog feed. <code>q</code> filters cached names (minimum 2 characters, triggers
                auto-enrichment on a miss). Without <code>json=1</code> it serves the legacy
                server-rendered HTML catalog.
              </p>
              <div class="try"><a href="/api/spec?json=1&amp;q=Pixel">Try it →</a></div>
            </div>

            <div class="ep">
              <div class="ep-head"><span class="method">GET</span><span class="path">/api/info</span></div>
              <p>
                This page. <code>?json=1</code> returns the same reference as a machine-readable
                JSON document.
              </p>
              <div class="try"><a href="/api/info?json=1">Try it →</a></div>
            </div>

            <div class="ep">
              <div class="ep-head"><span class="method post">POST</span><span class="path">/api/sync-devices</span></div>
              <p>
                <b>Admin.</b> Rebuilds the 25,000+ entry model dictionary. Password-protected.
                <code>?action=invalidate-catalog</code> clears the catalog snapshot;
                <code>?action=invalidate-specs</code> clears cached specs.
              </p>
            </div>

            <div class="ep full">
              <div class="ep-head"><span class="method post">POST</span><span class="path">/reset</span></div>
              <p>
                <b>Admin.</b> Clears cache — everything, only payloads, only URL mappings, only the
                catalog snapshot, or a single model. Password and CSRF protected; three wrong
                passwords lock the IP for 15 minutes.
              </p>
            </div>
          </div>
        </section>

        <section id="resolution">
          <div class="section-head">
            <span class="kicker">04 / Model resolution</span>
            <h2>From model code to market name</h2>
            <p>Clients send whatever Android reports. Layers run in order and the first hit wins.</p>
          </div>
          <div class="card">
            <ol>
              <li><b>Built-in table</b> — common codes: <code>S928 → S24 Ultra</code>, <code>HUSKY → Pixel 8 Pro</code>, <code>CPH2581 → OnePlus 12</code>.</li>
              <li><b>Samsung parser</b> — decodes SM/GT numbers: <code>SM-S928B → S24 Ultra</code>, <code>SM-A366B → A36</code>, <code>SM-F956B → Z Fold6</code>.</li>
              <li><b>Device dictionary</b> — the synced <code>device:&lt;code&gt;</code> map covers the long tail.</li>
              <li><b>Catalog scoring</b> — brand-aware token match against quicksearch; one-letter tokens are ignored and exact matches return immediately.</li>
            </ol>
          </div>
        </section>

        <section id="storage">
          <div class="section-head">
            <span class="kicker">05 / Storage</span>
            <h2>Redis schema</h2>
            <p>Every key is written once and reused on subsequent requests.</p>
          </div>
          <div class="card">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Key</th><th>Content</th></tr></thead>
                <tbody>
                  <tr><td class="key"><code>specs:url:&lt;id&gt;</code></td><td>Full JSON payload for one device. Permanent, no expiry.</td></tr>
                  <tr><td class="key"><code>url_map:&lt;query&gt;</code></td><td>Lowercased query → GSMArena URL. A device usually has two aliases: code and full name.</td></tr>
                  <tr><td class="key"><code>device:&lt;code&gt;</code></td><td>Model code → market name, e.g. <code>device:cph2581 → OnePlus 12</code>.</td></tr>
                  <tr><td class="key"><code>cache:gsm_quicksearch_catalog</code></td><td>Catalog snapshot, so matching does not re-download it per request.</td></tr>
                  <tr><td class="key"><code>gsm:quicksearch_url</code></td><td>Which snapshot URL is active.</td></tr>
                  <tr><td class="key"><code>lock:specs:&lt;query&gt;</code></td><td>Short lock (~22s): concurrent requests for the same uncached phone wait instead of scraping twice.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="notes">
          <div class="section-head">
            <span class="kicker">06 / Notes &amp; limits</span>
            <h2>Operational behaviour</h2>
          </div>
          <div class="card">
            <ul class="plain">
              <li><b>Cache never expires.</b> Cached specs are served as-is until purged via <code>/reset</code> or bypassed with <code>?refresh=1</code>.</li>
              <li><b>Slow first loads time out.</b> Functions abort after 25s (10s for this page). A <code>502</code>/<code>404</code> with <code>timing_ms</code> usually means GSMArena was slow — retrying often works.</li>
              <li><b>GET endpoints are public and cross-origin</b> (<code>Access-Control-Allow-Origin: *</code>). Admin endpoints require the sync password.</li>
              <li><b>Data belongs to GSMArena</b> and is shown for reference with a source link on every device.</li>
            </ul>
          </div>
        </section>

        <footer>
          <p>© 2026 Toolz Project · Engine v${VERSION} · Data &amp; images © GSMArena</p>
          <nav aria-label="Footer">
            <a class="btn btn-outline btn-small" href="/spec">Catalog</a>
            <a class="btn btn-outline btn-small" href="/">Home</a>
            <a class="btn btn-outline btn-small" href="/api/info?json=1">JSON</a>
          </nav>
        </footer>
      </main>
    </div>
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
      version: VERSION,
      documentation: `${SITE}/api/info`,
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
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Robots-Tag', 'index, follow');
  return res.status(200).send(renderInfoHtml());
}
