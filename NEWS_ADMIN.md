# Toolz News — admin guide

Manage remote announcements for the Toolz Android app at `/admin/news`.

## Setup (Vercel)

Required env vars:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (already used by specs backend)
- `NEWS_ADMIN_PASSWORD` — admin-only password (separate from `SYNC_PASSWORD`)
- `IMGBB_API_KEY` — imgbb API key for the editor Upload button (server-side only, never exposed; get one at https://api.imgbb.com)

Vercel picks up `api/news.ts` (public feed, 10s), `api/news-version.ts` (generation counter, 10s), `api/news-rss.ts` (RSS 2.0, 10s), `api/news-admin.ts` (authed JSON, 15s) and `api/news-image.ts` (imgbb upload proxy, 30s) automatically via `vercel.json`.

## Endpoints

- `GET /api/news?appVersion=1.1.6` — public feed (CORS `*`, CDN-cached ~1 min + `ETag`/`304`, `nextTransitionAt` for scheduled flips, fail-open 120 req/min/IP throttle, degraded `{news:[]}` on Redis outage).
- `GET /api/news-version` — feed generation counter `{v, nextTransitionAt}` (CDN-cached 60 s + `ETag`); devices sync when it changes or the transition becomes due.
- `GET /api/news-rss` — RSS 2.0 with the same visibility rules (CDN 5 min), per-item `/news#news-<id>` links.
- `POST /api/news-admin?action=login` `{password}` — sets HttpOnly `news_admin_session` cookie (`Secure` only on https; localhost works), returns `{csrf}` (send as `X-CSRF-Token` on every later call).
- `GET ?action=list` (optional `?limit=&offset=`, defaults to all) / `POST ?action=create|update|publish|unpublish|archive|delete` (delete → 7-day trash) / `POST ?action=restore|bulk|import` / `GET ?action=export|audit|feed-health|feed-history` / `POST ?action=simulate|repair-index`.
- `bulk` takes `{ops:[{action,id}]}` (1–50, one round-trip, per-op results); `restore` undoes a delete within 7 days; `export` dumps `{items,count,v}`; `import` validates 1–200 items (cap-aware); `feed-history` returns the last 50 feed changes; `simulate` dry-runs `{item,appVersion}` with no writes.
- Saves return a `visibility` verdict (`live` vs reason) so the panel can confirm immediately whether the item is on `/news`.
- `GET /api/news?all=1` — unfiltered public feed behind `/news` and the home teaser (status + time window only).
- `?action=feed-health` — `{ indexSize, payloadCount, liveCount, feedVersion, nextTransitionAt, orphanIds, items: [{ id, title, status, liveOnPublicFeed, reason }] }`; also powers the admin "Feed check" section (auto-runs on mount).

## Security

- SHA-256 `timingSafeEqual` password check, password never in URL, generic "Invalid password." (no attempt-count oracle).
- 5 failed logins → IP locked 15 min (`newsban:<ip>`).
- HMAC session cookie (6h, sliding refresh on use) + per-session CSRF token.
- Rotate `NEWS_ADMIN_PASSWORD` in Vercel env + redeploy to rotate all sessions (old HMACs stop verifying).
- Same-origin admin API (no wildcard CORS), strict security headers.
- Server-side zod-style validation: 8KB/item cap, https/toolz URLs + host allowlist, semver checks, audit log (`news:audit:*`, 90d, IP-hashed).

## Editor guide

The New/Edit dialog is tabbed: Content (templates, counters, markdown toolbar,
thumbnail check), Targeting (Everyone reset, Latest-version shortcut, "who sees
this" + version simulator), Behavior (recurrence presets, plain-language
toggles, schedule quick chips in your local time with UTC storage note and a live verdict line "~1 min"), Preview (popup +
website article). Footer: Cancel / Save draft / Publish now (Update/Unpublish
when editing). "Publish now" forces `published` with immediate visibility.
Every save then re-checks the live public feed (CDN bypassed) and reports
"verified live" or the exact mismatch (e.g. image differs, not in feed yet).
Cloning opens a "(copy)" draft. Multi-select + bulk bar publishes/unpublishes/archives/deletes in one round-trip; single deletes show an Undo toast (7-day trash). `n` = new, `/` = search. Sort by updated/publish/title; Critical/Scheduled tabs; duplicate-title warning. Unsaved changes ask before discarding. List rows
show LIVE-on-/news vs reason badges with local-time tooltips; the "Feed check" section auto-runs on mount and answers
"will /news show anything?" with generation, next-transition, per-item reasons and orphan detection. "Test lab" dry-runs any item × version (local + server `simulate`, no writes). "Status + backups" shows the last 50 feed changes plus Export/Import (UTC filenames, confirm before overwrite).

## Troubleshooting: published but not on /news

1. Open `/api/news?all=1` raw: `degraded: true` = backend/Redis/env problem
   (check Vercel function logs + env vars, then redeploy); 404 = not deployed.
   `429` = per-IP throttle tripped (fail-open retry after 60 s).
2. Run admin "Feed check" (auto-runs on mount): `draft` = never published (use Publish now or
   "Publish all drafts");
   `scheduled at …` = future `publishAt` (see `next:` badge for the exact flip; apps/website wake on it);
   `expired at …` = past `expiresAt`;
   orphans = index/data mismatch (one-click "Repair index", or delete +
   recreate the item).
3. Remember caching: browsers cap at 60s, CDN at ~60s — propagation needs no
   manual action; the site fetches with `no-store` and polls `news-version` every 60 s,
   and the app syncs on feed
   generation change (forced refresh bypasses everything);
   version-targeted items only reach matching app versions (the public page
   ignores versions via `all=1`).

## Targeting cheat sheet

- Leave version fields empty = all versions.
- `onlyVersions` = allowlist (`1.1.6, 1.2.0`); `excludedVersions` wins over it.
- `delaySeconds` = accepted on the wire for back-compat but ignored: popups show immediately on the dashboard, no foreground dwell.
- `once` = one popup ever per device; `daily/weekly/interval` + `maxImpressions` for repeats.
- `notify=false` = no system notification (popups and history are unaffected).
- `disappearing` + `expiresAt` ("Disappear after" chips) = auto-deleted from devices at expiry, history included.
- Images: Upload button (imgbb, auto-downscaled) or any allowlisted `https://` URL.
- `critical` bypasses the user's news + notification toggles (popup shows an (i) explainer).
- `/news` extras: search + newest/oldest sort + 10-at-a-time pagination, per-item `#news-<id>` anchors + Copy link + active highlight + per-anchor OG/title, RSS at `/api/news-rss` (autodiscovery + sitemap, admin disallowed in robots), `toolz://` CTAs show as "in-app only" on web; in-app history has search + priority filters + Share + syncing/error states.
