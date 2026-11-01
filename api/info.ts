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
      --surface-1: #180d2a;
      --surface-2: #1d1230;
      --surface-3: #2a1c3e;
      --surface-4: #332648;
      --inset: #0b0516;

      --primary: #8b55c9;
      --primary-soft: #b98ae6;
      --on-primary: #ffffff;
      --primary-container: #3a1b5c;
      --on-primary-container: #e9d3ff;

      --secondary: #c9a5ee;
      --secondary-container: #4a2a6b;
      --on-secondary-container: #f0dcff;

      --tertiary: #e0b6f2;
      --tertiary-container: #5c2f70;
      --on-tertiary-container: #f7dcff;

      --text: #efe7f8;
      --muted: #c6b6d8;
      --faint: #9c8cb4;
      --outline: rgba(201, 165, 238, 0.16);
      --outline-strong: rgba(201, 165, 238, 0.32);

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
      inset: -220px -140px auto;
      height: 720px;
      z-index: 0;
      pointer-events: none;
      background:
        radial-gradient(580px 420px at 82% 0%, rgba(139, 85, 201, 0.30), transparent 70%),
        radial-gradient(480px 380px at 6% 30%, rgba(224, 182, 242, 0.13), transparent 70%);
    }

    ::selection { background: rgba(139, 85, 201, 0.5); color: #fff; }

    a { color: var(--primary-soft); text-decoration: none; }
    a:hover { color: var(--tertiary); }

    :focus-visible {
      outline: 3px solid var(--secondary);
      outline-offset: 3px;
      border-radius: 10px;
    }

    .shell {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 18px 64px;
    }

    @media (min-width: 720px) { .shell { padding: 0 28px 88px; } }

    .skip { position: absolute; left: -9999px; top: 0; z-index: 20; }
    .skip:focus { left: 12px; top: 12px; }

    /* ── Top bar ─────────────────────────────────────────────────────── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 0;
    }

    .brand { display: flex; align-items: center; gap: 12px; color: var(--text); }
    .brand:hover { color: var(--text); }

    .brand-mark {
      display: flex;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 16px;
      background: var(--primary-container);
      flex-shrink: 0;
    }
    .brand-mark img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.7); }

    .brand-text { display: flex; flex-direction: column; line-height: 1.2; }
    .brand-text b { font-family: var(--display); font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
    .brand-text small { font-size: 11px; font-weight: 500; color: var(--muted); }

    .top-actions { display: flex; align-items: center; gap: 8px; }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--surface-3);
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      white-space: nowrap;
    }
    .status-pill i {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--secondary);
      box-shadow: 0 0 0 4px rgba(201, 165, 238, 0.14);
    }

    /* ── Pills ───────────────────────────────────────────────────────── */
    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 22px;
      border: 1px solid transparent;
      border-radius: 999px;
      font-family: var(--sans);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .pill:active { transform: scale(0.96); }
    .pill-small { padding: 8px 15px; font-size: 12px; }

    .pill-filled { background: var(--primary); color: var(--on-primary); }
    .pill-filled:hover { background: #9a64d6; color: var(--on-primary); box-shadow: 0 10px 24px rgba(139, 85, 201, 0.35); }

    .pill-tonal { background: var(--secondary-container); color: var(--on-secondary-container); }
    .pill-tonal:hover { background: #58327d; color: var(--on-secondary-container); box-shadow: 0 8px 20px rgba(74, 42, 107, 0.45); }

    .pill-outline { border-color: var(--outline-strong); color: var(--primary-soft); background: transparent; }
    .pill-outline:hover { background: rgba(139, 85, 201, 0.12); color: var(--tertiary); border-color: rgba(224, 182, 242, 0.5); }

    /* ── Layout ──────────────────────────────────────────────────────── */
    .layout {
      display: grid;
      grid-template-columns: 214px minmax(0, 1fr);
      gap: 52px;
      align-items: start;
    }

    @media (max-width: 940px) {
      .layout { grid-template-columns: minmax(0, 1fr); gap: 0; }
      .rail { display: none; }
    }

    .rail { position: sticky; top: 24px; padding-top: 44px; }

    .rail-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--faint);
      margin-bottom: 12px;
      padding-left: 12px;
    }

    .toc { display: grid; gap: 3px; }
    .toc a {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 9px 12px;
      border-radius: 999px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .toc a:hover { background: var(--surface-3); color: var(--text); }
    .toc .n { font-size: 11px; font-weight: 700; color: var(--primary-soft); }

    .rail-card {
      margin-top: 20px;
      padding: 16px;
      border-radius: 24px;
      background: var(--surface-2);
    }
    .rail-card-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--faint);
      margin-bottom: 6px;
    }
    .rail-card p { font-size: 12.5px; color: var(--muted); margin-bottom: 12px; }

    /* ── Hero ────────────────────────────────────────────────────────── */
    .hero { padding: 40px 0 44px; }
    @media (min-width: 720px) { .hero { padding: 56px 0 52px; } }

    .eyebrow-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 15px;
      border-radius: 999px;
      background: var(--primary-container);
      color: var(--on-primary-container);
      font-size: 12px;
      font-weight: 600;
    }
    .eyebrow-pill i {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--secondary);
    }

    h1 {
      margin-top: 20px;
      font-family: var(--display);
      font-size: clamp(2.6rem, 6.2vw, 4.4rem);
      font-weight: 800;
      line-height: 0.96;
      letter-spacing: -0.04em;
      max-width: 820px;
      text-wrap: balance;
    }
    h1 span { color: var(--primary); }

    .lede {
      margin-top: 20px;
      max-width: 640px;
      font-size: 15.5px;
      line-height: 1.75;
      color: var(--muted);
    }
    .lede code { font-size: 0.88em; }
    .lede a { font-weight: 600; }

    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }

    .facts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 32px;
      max-width: 760px;
    }
    @media (min-width: 640px) { .facts { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

    .fact { padding: 15px 16px; border-radius: 22px; }
    .fact span {
      display: block;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .fact b {
      display: block;
      margin-top: 3px;
      font-family: var(--display);
      font-size: 14px;
      font-weight: 700;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }
    .f1 { background: var(--primary-container); color: var(--on-primary-container); }
    .f2 { background: var(--secondary-container); color: var(--on-secondary-container); }
    .f3 { background: var(--tertiary-container); color: var(--on-tertiary-container); }
    .f4 { background: var(--surface-3); color: var(--text); }

    /* ── Sections ────────────────────────────────────────────────────── */
    section { padding: 36px 0 8px; scroll-margin-top: 24px; }
    @media (min-width: 720px) { section { padding: 48px 0 12px; } }

    .section-head {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 15px;
      align-items: start;
      margin-bottom: 20px;
    }

    .section-num {
      display: grid;
      width: 48px;
      height: 48px;
      place-items: center;
      border-radius: 16px;
      background: var(--primary-container);
      color: var(--on-primary-container);
      font-family: var(--display);
      font-size: 17px;
      font-weight: 800;
    }

    .kicker {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--primary-soft);
      margin-bottom: 3px;
    }
    h2 {
      font-family: var(--display);
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.15;
    }
    .section-head p { margin-top: 6px; max-width: 68ch; font-size: 14.5px; color: var(--muted); }

    /* ── Cards ───────────────────────────────────────────────────────── */
    .card {
      background: var(--surface-2);
      border-radius: 32px;
      padding: 20px;
    }
    @media (min-width: 720px) { .card { padding: 28px 30px; } }

    .card-title {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }
    .card h3 {
      font-family: var(--display);
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .card p, .card li { font-size: 14px; color: var(--muted); }
    .card p { max-width: 70ch; }
    .card p + p { margin-top: 10px; }
    .card b { color: var(--text); font-weight: 600; }

    .card ol { padding-left: 0; list-style: none; display: grid; gap: 10px; margin-top: 12px; max-width: 72ch; counter-reset: item; }
    .card ol li {
      counter-increment: item;
      position: relative;
      padding-left: 38px;
    }
    .card ol li::before {
      content: counter(item);
      position: absolute;
      left: 0;
      top: 1px;
      display: grid;
      width: 25px;
      height: 25px;
      place-items: center;
      border-radius: 50%;
      background: var(--primary-container);
      color: var(--on-primary-container);
      font-family: var(--display);
      font-size: 11px;
      font-weight: 700;
    }

    /* ── Steps ───────────────────────────────────────────────────────── */
    .steps { display: grid; gap: 10px; margin-top: 16px; }
    @media (min-width: 900px) { .steps { grid-template-columns: repeat(5, minmax(0, 1fr)); } }

    .step { background: var(--surface-3); border-radius: 22px; padding: 16px; }
    .step .n {
      display: inline-grid;
      width: 30px;
      height: 30px;
      place-items: center;
      margin-bottom: 10px;
      border-radius: 50%;
      background: var(--primary-container);
      color: var(--on-primary-container);
      font-family: var(--display);
      font-size: 12px;
      font-weight: 800;
    }
    .step h4 { font-family: var(--display); font-size: 13px; font-weight: 700; margin-bottom: 3px; }
    .step p { font-size: 12.5px; line-height: 1.6; }

    /* ── Endpoints ───────────────────────────────────────────────────── */
    .eps { display: grid; gap: 14px; }
    @media (min-width: 860px) { .eps { grid-template-columns: 1fr 1fr; } }

    .ep {
      display: flex;
      flex-direction: column;
      gap: 11px;
      background: var(--surface-2);
      border-radius: 28px;
      padding: 20px;
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .ep:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28); }
    .ep.full { grid-column: 1 / -1; }

    .ep-head { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
    .method {
      border-radius: 999px;
      padding: 4px 11px;
      background: var(--primary-container);
      color: var(--on-primary-container);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .method.post { background: var(--tertiary-container); color: var(--on-tertiary-container); }
    .path { font-family: var(--mono); font-size: 13px; color: var(--text); overflow-wrap: anywhere; }
    .ep p { font-size: 13.5px; }

    .try { margin-top: auto; padding-top: 3px; }
    .try a {
      display: inline-flex;
      align-items: center;
      padding: 7px 13px;
      border-radius: 999px;
      background: var(--surface-3);
      color: var(--primary-soft);
      font-size: 12px;
      font-weight: 600;
    }
    .try a:hover { background: var(--surface-4); color: var(--tertiary); }

    /* ── Code ────────────────────────────────────────────────────────── */
    code {
      font-family: var(--mono);
      font-size: 0.86em;
      background: rgba(201, 165, 238, 0.12);
      border-radius: 7px;
      padding: 1px 6px;
      color: #ecdcff;
      overflow-wrap: anywhere;
    }

    .codebox { margin-top: 18px; border-radius: 24px; overflow: hidden; background: var(--inset); border: 1px solid var(--outline); }
    .codebar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: var(--surface-2);
      font-size: 11px;
      font-weight: 500;
      color: var(--faint);
    }
    pre { overflow-x: auto; padding: 16px 18px; }
    pre code {
      background: none;
      border-radius: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.7;
      color: #dccdf0;
      white-space: pre;
      overflow-wrap: normal;
    }

    /* ── Tables ──────────────────────────────────────────────────────── */
    .table-wrap { margin-top: 16px; overflow-x: auto; border-radius: 24px; border: 1px solid var(--outline); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 460px; }
    th {
      text-align: left;
      padding: 11px 16px;
      background: var(--surface-3);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--faint);
    }
    td {
      padding: 12px 16px;
      color: var(--muted);
      vertical-align: top;
      border-top: 1px solid var(--outline);
    }
    tr:hover td { background: rgba(139, 85, 201, 0.08); }
    td.key { white-space: nowrap; }

    /* ── Notes ───────────────────────────────────────────────────────── */
    .notes { display: grid; gap: 10px; list-style: none; }
    .notes li {
      border-radius: 20px;
      background: var(--surface-3);
      padding: 14px 16px;
      font-size: 13.5px;
      color: var(--muted);
    }
    .notes b { color: var(--text); font-weight: 600; }

    /* ── Footer ──────────────────────────────────────────────────────── */
    footer {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 40px;
      padding: 24px;
      border-radius: 32px;
      background: var(--surface-2);
    }
    @media (min-width: 720px) {
      footer { flex-direction: row; align-items: center; justify-content: space-between; }
    }
    footer p { font-size: 12px; color: var(--faint); }
    footer nav { display: flex; gap: 8px; flex-wrap: wrap; }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      * { transition: none !important; }
    }
  </style>
</head>
<body>
  <a class="pill pill-tonal pill-small skip" href="#main">Skip to content</a>

  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/spec" aria-label="Toolz Spec Index">
        <span class="brand-mark"><img src="/logo.png" alt=""></span>
        <span class="brand-text">
          <b>Toolz</b>
          <small>Specs API</small>
        </span>
      </a>
      <nav class="top-actions" aria-label="Header">
        <span class="status-pill"><i></i>Engine v${VERSION}</span>
        <a class="pill pill-tonal pill-small" href="/spec">Catalog</a>
      </nav>
    </header>

    <div class="layout">
      <aside class="rail">
        <p class="rail-label">On this page</p>
        <nav class="toc" aria-label="Documentation sections">
          <a href="#example"><span class="n">01</span>Worked example</a>
          <a href="#catalog"><span class="n">02</span>Catalog search</a>
          <a href="#endpoints"><span class="n">03</span>Endpoints</a>
          <a href="#resolution"><span class="n">04</span>Model resolution</a>
          <a href="#storage"><span class="n">05</span>Storage</a>
          <a href="#notes"><span class="n">06</span>Notes &amp; limits</a>
        </nav>
        <div class="rail-card">
          <p class="rail-card-label">Stack</p>
          <p>Vercel serverless<br>Upstash Redis</p>
          <a class="pill pill-outline pill-small" href="/api/info?json=1">JSON version</a>
        </div>
      </aside>

      <main id="main">
        <section class="hero">
          <span class="eyebrow-pill"><i></i>Public API · engine v${VERSION}</span>
          <h1>One request.<br><span>A full datasheet.</span></h1>
          <p class="lede">
            Send a phone name or hardware model code — like Android's <code>Build.MODEL</code> —
            and get a structured spec sheet back. Data is read from GSMArena, normalised, and
            cached in Redis so repeat lookups are effectively instant. The
            <a href="/spec">Device Catalog</a> is the browsing UI built on top of it.
          </p>

          <div class="actions">
            <a class="pill pill-filled" href="/spec">Open the catalog</a>
            <a class="pill pill-tonal" href="/api/spec?json=1&amp;q=Pixel">Try a live query</a>
            <a class="pill pill-outline" href="/api/info?json=1">Read as JSON</a>
          </div>

          <div class="facts">
            <div class="fact f1"><span>Base URL</span><b>toolz-app.vercel.app</b></div>
            <div class="fact f2"><span>Auth</span><b>GET is public</b></div>
            <div class="fact f3"><span>Cache</span><b>Redis · no TTL</b></div>
            <div class="fact f4"><span>Source</span><b>GSMArena</b></div>
          </div>
        </section>

        <section id="example">
          <header class="section-head">
            <span class="section-num">01</span>
            <div>
              <p class="kicker">Worked example</p>
              <h2>Resolving one phone</h2>
              <p>What happens when a client asks for a single Samsung model code.</p>
            </div>
          </header>
          <div class="card">
            <div class="card-title">
              <h3>Resolve a model code</h3>
              <code>GET /api/specs?model=SM-S928B</code>
            </div>
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
              <div class="codebar"><span>200 OK · application/json</span><span>Trimmed response</span></div>
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
          <header class="section-head">
            <span class="section-num">02</span>
            <div>
              <p class="kicker">Catalog search</p>
              <h2>What the catalog page calls</h2>
              <p>The same endpoint powers search, brand filters and the initial grid on <a href="/spec">/spec</a>.</p>
            </div>
          </header>
          <div class="card">
            <div class="card-title">
              <h3>Filter the cached catalog</h3>
              <code>GET /api/spec?json=1&amp;q=pixel%209</code>
            </div>
            <ol>
              <li>Loads cached payloads and keeps entries whose device name or original query contains <code>pixel 9</code>.</li>
              <li>If nothing matches, the query is resolved once through <code>/api/specs</code> and included with <code>"autoEnriched": true</code>. That is how a new search adds itself to the catalog.</li>
              <li>If the cache is empty and no query was given, a few default flagships are resolved so the grid is never blank.</li>
            </ol>

            <div class="codebox">
              <div class="codebar"><span>200 OK · application/json</span><span>Catalog envelope</span></div>
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
          <header class="section-head">
            <span class="section-num">03</span>
            <div>
              <p class="kicker">Endpoints</p>
              <h2>Contracts</h2>
              <p>Five endpoints cover lookups, the catalog feed, this document, and cache maintenance.</p>
            </div>
          </header>

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
          <header class="section-head">
            <span class="section-num">04</span>
            <div>
              <p class="kicker">Model resolution</p>
              <h2>From model code to market name</h2>
              <p>Clients send whatever Android reports. Layers run in order and the first hit wins.</p>
            </div>
          </header>
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
          <header class="section-head">
            <span class="section-num">05</span>
            <div>
              <p class="kicker">Storage</p>
              <h2>Redis schema</h2>
              <p>Every key is written once and reused on subsequent requests.</p>
            </div>
          </header>
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
          <header class="section-head">
            <span class="section-num">06</span>
            <div>
              <p class="kicker">Notes &amp; limits</p>
              <h2>Operational behaviour</h2>
            </div>
          </header>
          <div class="card">
            <ul class="notes">
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
            <a class="pill pill-tonal pill-small" href="/spec">Catalog</a>
            <a class="pill pill-outline pill-small" href="/">Home</a>
            <a class="pill pill-outline pill-small" href="/api/info?json=1">JSON</a>
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
