import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

/**
 * Material 3 Expressive Phone Catalog & Interactive Viewer — /spec & /api/spec
 *
 * Features:
 *  - Displays all devices stored in Upstash Redis (`specs:*` keys)
 *  - Live search bar with instant query matching
 *  - Auto-enrichment: Searching an unindexed phone triggers server-side extraction & saves it to Redis
 *  - GSMArena-grade 100% complete technical specifications (Network, Body, Display, Platform, etc.)
 *  - Architecture Info Button linking to /info (/api/info)
 *  - Pure 100% Material 3 Expressive Design System (32px cards, Plus Jakarta Sans, slate & indigo palette)
 */

const DEFAULT_SEED_MODELS = [
  'Samsung Galaxy S24 Ultra',
  'Google Pixel 9 Pro XL',
  'Apple iPhone 15 Pro Max',
  'Xiaomi 14T Pro',
  'OnePlus 12',
  'Nothing Phone (2a)',
];

interface SpecPayload {
  search_query: string;
  search_name: string;
  matched_device: string;
  source_url: string;
  image: string;
  specifications: Record<string, Record<string, string>>;
  timing_ms?: number;
  cached?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Render Material 3 Expressive HTML Page
// ──────────────────────────────────────────────────────────────────────────────
function renderSpecCatalogHtml(options: {
  devices: SpecPayload[];
  query: string;
  totalInRedis: number;
  autoEnriched?: boolean;
  searchedModel?: string;
}): string {
  const { devices, query, totalInRedis, autoEnriched, searchedModel } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Phone Catalog — Toolz Material 3</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Explore complete, GSMArena-grade phone specifications powered by Toolz Server-Side Engine & Upstash Redis.">
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
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
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
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }
    .info-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 100px;
      padding: 0.6rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .info-btn:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #ffffff;
      transform: translateY(-1px);
    }
    .hero-section {
      max-width: 1280px;
      margin: 3rem auto 2rem;
      padding: 0 1.5rem;
      text-align: center;
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
      line-height: 1.15;
    }
    .hero-desc {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 640px;
      margin: 0 auto 2.5rem;
      line-height: 1.6;
    }
    .search-container {
      max-width: 680px;
      margin: 0 auto 2rem;
      position: relative;
    }
    .search-input {
      width: 100%;
      background: #161e2e;
      border: 2px solid #2d3748;
      border-radius: 100px;
      padding: 1.1rem 1.75rem 1.1rem 3.5rem;
      font-size: 1.05rem;
      font-family: inherit;
      color: #ffffff;
      outline: none;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .search-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .search-icon {
      position: absolute;
      left: 1.35rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      color: #64748b;
      pointer-events: none;
    }
    .search-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: #6366f1;
      color: #ffffff;
      border: none;
      border-radius: 100px;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.2s;
    }
    .search-btn:hover {
      background: #4f46e5;
    }
    .filter-chips {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      max-width: 800px;
      margin: 0 auto 3rem;
    }
    .chip {
      background: #161e2e;
      color: #cbd5e1;
      border: 1px solid #2d3748;
      border-radius: 100px;
      padding: 8px 18px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .chip:hover, .chip.active {
      background: #6366f1;
      color: #ffffff;
      border-color: #6366f1;
    }
    .alert-banner {
      max-width: 1280px;
      margin: 0 auto 2rem;
      padding: 1rem 1.5rem;
      border-radius: 20px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #86efac;
      font-size: 0.95rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .catalog-grid {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }
    .m3-phone-card {
      background: #161e2e;
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .m3-phone-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 35px -5px rgba(0, 0, 0, 0.6);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .card-top {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .phone-img-box {
      width: 110px;
      height: 140px;
      background: #090d16;
      border-radius: 20px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .phone-img-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .phone-meta {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand-pill {
      display: inline-block;
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border-radius: 100px;
      padding: 4px 10px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
      align-self: flex-start;
    }
    .phone-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.3;
      margin-bottom: 6px;
    }
    .quick-specs-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 1.5rem;
      background: rgba(0, 0, 0, 0.25);
      padding: 1rem;
      border-radius: 20px;
    }
    .spec-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.825rem;
      color: #cbd5e1;
    }
    .spec-icon {
      color: #818cf8;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .spec-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-actions {
      display: flex;
      gap: 10px;
    }
    .view-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 100px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .view-btn:hover {
      background: #6366f1;
      border-color: #6366f1;
    }
    .empty-state {
      max-width: 600px;
      margin: 4rem auto;
      text-align: center;
      padding: 3rem 2rem;
      background: #161e2e;
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .modal-overlay.active {
      display: flex;
    }
    .modal-content {
      background: #161e2e;
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      width: 100%;
      max-width: 860px;
      max-height: 88vh;
      overflow-y: auto;
      padding: 2.5rem;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
    }
    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 100px;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .modal-close:hover {
      background: #ef4444;
    }
    .spec-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
    }
    .spec-table th {
      text-align: left;
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .spec-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.875rem;
      vertical-align: top;
    }
    .spec-table td.key-col {
      width: 32%;
      font-weight: 700;
      color: #818cf8;
    }
    .spec-table td.val-col {
      color: #f1f5f9;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <!-- Sticky Header Bar -->
  <header class="header-bar">
    <div class="header-container">
      <div class="brand-group">
        <div class="logo-badge">📱</div>
        <div>
          <div class="brand-title">Toolz Spec Catalog</div>
          <div class="brand-subtitle">${totalInRedis} Devices Indexed in Redis</div>
        </div>
      </div>
      <a href="/info" class="info-btn">
        <span>ℹ️</span> Architecture Info
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="m3-pill">⚡ Material 3 Expressive Catalog</div>
    <h1 class="hero-title">Phone Specification Database</h1>
    <p class="hero-desc">Explore technical specifications for mobile devices. Search any phone to auto-fetch and index it into our Redis cache!</p>

    <!-- Search Form -->
    <form class="search-container" action="/spec" method="GET">
      <span class="search-icon">🔍</span>
      <input type="text" name="q" class="search-input" placeholder="Search phone name or model (e.g. Galaxy S24 Ultra, Pixel 9 Pro)..." value="${query}" required>
      <button type="submit" class="search-btn">Search &amp; Fetch</button>
    </form>

    <!-- Filter Chips -->
    <div class="filter-chips">
      <a href="/spec" class="chip ${!query ? 'active' : ''}">All Phones</a>
      <a href="/spec?q=Samsung" class="chip ${query === 'Samsung' ? 'active' : ''}">Samsung</a>
      <a href="/spec?q=Apple" class="chip ${query === 'Apple' ? 'active' : ''}">Apple</a>
      <a href="/spec?q=Google" class="chip ${query === 'Google' ? 'active' : ''}">Google Pixel</a>
      <a href="/spec?q=Xiaomi" class="chip ${query === 'Xiaomi' ? 'active' : ''}">Xiaomi / Poco</a>
      <a href="/spec?q=OnePlus" class="chip ${query === 'OnePlus' ? 'active' : ''}">OnePlus</a>
      <a href="/spec?q=Nothing" class="chip ${query === 'Nothing' ? 'active' : ''}">Nothing</a>
    </div>
  </section>

  ${autoEnriched ? `
    <div class="alert-banner">
      ✨ <strong>Auto-Enriched Catalog:</strong> Extracted specifications for <strong>"${searchedModel}"</strong> from GSMArena and indexed into Upstash Redis!
    </div>
  ` : ''}

  <!-- Catalog Grid -->
  ${devices.length > 0 ? `
    <div class="catalog-grid">
      ${devices.map(dev => {
        const specs = dev.specifications || {};
        const display = specs['Display']?.['Size'] || specs['Display']?.['Type'] || 'OLED Display';
        const chip = specs['Platform']?.['Chipset'] || specs['Platform']?.['OS'] || 'Mobile Platform';
        const cam = specs['Main Camera']?.['Single'] || specs['Main Camera']?.['Dual'] || specs['Main Camera']?.['Triple'] || specs['Main Camera']?.['Quad'] || 'Camera System';
        const bat = specs['Battery']?.['Type'] || specs['Battery']?.['Charging'] || 'Li-Ion Battery';
        const mem = specs['Memory']?.['Internal'] || 'Internal Memory';

        // Extract Brand
        const brandMatch = dev.matched_device.match(/^(Samsung|Apple|Google|Xiaomi|Poco|Redmi|OnePlus|Nothing|Motorola|Realme|Sony|Asus|Honor|vivo|Oppo)/i);
        const brand = brandMatch ? brandMatch[1] : 'Smartphone';

        const jsonSpecString = JSON.stringify(dev).replace(/'/g, "&apos;");

        return `
          <div class="m3-phone-card">
            <div>
              <div class="card-top">
                <div class="phone-img-box">
                  <img src="${dev.image || 'https://www.gsmarena.com/vv/bigpic/smartphone.jpg'}" alt="${dev.matched_device}" loading="lazy" onerror="this.src='https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg'">
                </div>
                <div class="phone-meta">
                  <span class="brand-pill">${brand}</span>
                  <h3 class="phone-name">${dev.matched_device}</h3>
                </div>
              </div>

              <div class="quick-specs-list">
                <div class="spec-item"><span class="spec-icon">📱</span><span class="spec-text">${display}</span></div>
                <div class="spec-item"><span class="spec-icon">⚡</span><span class="spec-text">${chip}</span></div>
                <div class="spec-item"><span class="spec-icon">📷</span><span class="spec-text">${cam}</span></div>
                <div class="spec-item"><span class="spec-icon">🔋</span><span class="spec-text">${bat}</span></div>
                <div class="spec-item"><span class="spec-icon">💾</span><span class="spec-text">${mem}</span></div>
              </div>
            </div>

            <div class="card-actions">
              <button class="view-btn" onclick='openSpecModal(${jsonSpecString})'>View Full Specs</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : `
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2>No Devices Found</h2>
      <p style="color:#94a3b8;margin-top:0.5rem">Use the search bar above to fetch specifications for any device model!</p>
    </div>
  `}

  <!-- Modal Specs Drawer -->
  <div id="specModal" class="modal-overlay" onclick="closeSpecModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeSpecModal()">✕</button>
      <div id="modalBody"></div>
    </div>
  </div>

  <script>
    function openSpecModal(dev) {
      const modal = document.getElementById('specModal');
      const body = document.getElementById('modalBody');

      let html = '<div style="display:flex;gap:1.5rem;align-items:center;margin-bottom:2rem">';
      html += '<img src="' + (dev.image || '') + '" style="max-height:140px;object-fit:contain;background:#090d16;padding:12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1)">';
      html += '<div><span class="brand-pill">Full Specifications</span><h2 style="font-size:1.8rem;font-weight:800;color:#fff;margin-top:4px">' + dev.matched_device + '</h2>';
      if (dev.source_url) {
        html += '<a href="' + dev.source_url + '" target="_blank" style="color:#818cf8;font-size:0.85rem;font-weight:700;text-decoration:none;display:inline-block;margin-top:8px">View on GSMArena ↗</a>';
      }
      html += '</div></div>';

      const specs = dev.specifications || {};
      for (const [section, data] of Object.entries(specs)) {
        html += '<table class="spec-table">';
        html += '<thead><tr><th colspan="2">' + section + '</th></tr></thead><tbody>';
        for (const [k, v] of Object.entries(data)) {
          html += '<tr><td class="key-col">' + k + '</td><td class="val-col">' + v + '</td></tr>';
        }
        html += '</tbody></table>';
      }

      body.innerHTML = html;
      modal.classList.add('active');
    }

    function closeSpecModal(e) {
      document.getElementById('specModal').classList.remove('active');
    }
  </script>
</body>
</html>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Serverless Handler
// ──────────────────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const searchQuery = (req.query.q || req.query.model || req.query.search || '') as string;
  const isJson = req.query.json === '1' || req.headers['accept']?.includes('application/json');

  let redis: Redis | null = null;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }

  let devices: SpecPayload[] = [];
  let totalInRedis = 0;
  let autoEnriched = false;
  let searchedModel = searchQuery.trim();

  try {
    // ── 1. Fetch all cached specs keys from Upstash Redis ───────────────────
    if (redis) {
      const keys = await redis.keys('specs:url:*');
      if (Array.isArray(keys) && keys.length > 0) {
        totalInRedis = keys.length;
        // Batch get in chunks
        const rawPayloads = await redis.mget<any[]>(...keys);
        devices = rawPayloads
          .filter(Boolean)
          .map(p => (typeof p === 'string' ? JSON.parse(p) : p))
          .filter(p => p && p.matched_device && p.specifications);
      }
    }

    // ── 2. Handle Search & Auto-Enrichment ──────────────────────────────────
    if (searchedModel.length >= 2) {
      const cleanQ = searchedModel.toLowerCase();
      let matched = devices.filter(dev => {
        const title = (dev.matched_device || '').toLowerCase();
        const queryStr = (dev.search_query || '').toLowerCase();
        return title.includes(cleanQ) || queryStr.includes(cleanQ);
      });

      // If NOT in Redis cache, trigger backend extraction to auto-enrich the catalog!
      if (matched.length === 0) {
        console.info(`[Catalog] Phone "${searchedModel}" not in Redis. Auto-fetching...`);
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'] || 'toolz-app.vercel.app';
        const specsApiUrl = `${protocol}://${host}/api/specs?model=${encodeURIComponent(searchedModel)}`;

        try {
          const fetchResp = await fetch(specsApiUrl);
          if (fetchResp.ok) {
            const newSpec: SpecPayload = await fetchResp.json();
            if (newSpec && newSpec.specifications) {
              devices.unshift(newSpec);
              autoEnriched = true;
              totalInRedis += 1;
              matched = [newSpec];
            }
          }
        } catch (e) {
          console.error('[Catalog] Auto-enrichment fetch failed:', e);
        }
      }

      if (matched.length > 0) {
        devices = matched;
      }
    }

    // ── 3. Auto-Seed Default Devices if Redis is Empty ──────────────────────
    if (devices.length === 0 && searchedModel.length === 0) {
      console.info('[Catalog] Redis catalog empty. Auto-seeding default flagships...');
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['host'] || 'toolz-app.vercel.app';

      for (const model of DEFAULT_SEED_MODELS) {
        try {
          const fetchResp = await fetch(`${protocol}://${host}/api/specs?model=${encodeURIComponent(model)}`);
          if (fetchResp.ok) {
            const seedSpec: SpecPayload = await fetchResp.json();
            if (seedSpec && seedSpec.specifications) {
              devices.push(seedSpec);
            }
          }
        } catch {}
      }
      totalInRedis = devices.length;
    }

    // ── 4. JSON or HTML Output ──────────────────────────────────────────────
    if (isJson) {
      return res.status(200).json({
        totalInRedis,
        count: devices.length,
        query: searchedModel,
        autoEnriched,
        devices,
      });
    }

    const html = renderSpecCatalogHtml({
      devices,
      query: searchedModel,
      totalInRedis,
      autoEnriched,
      searchedModel,
    });

    return res.status(200).send(html);

  } catch (error: any) {
    console.error('[Catalog Handler] Error:', error);
    return res.status(500).json({ error: 'Catalog loading error', details: error?.message });
  }
}
