# Toolz News — admin guide

Manage remote announcements for the Toolz Android app at `/admin/news`.

## Setup (Vercel)

Required env vars:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (already used by specs backend)
- `NEWS_ADMIN_PASSWORD` — admin-only password (separate from `SYNC_PASSWORD`)
- `IMGBB_API_KEY` — imgbb API key for the editor Upload button (server-side only, never exposed; get one at https://api.imgbb.com)

Vercel picks up `api/news.ts` (public feed + generation counter, 10s), `api/news-rss.ts` (RSS 2.0, 10s), `api/news-admin.ts` (authed JSON + imgbb upload proxy, 30s) and `api/skins.ts` (public feed + admin ops, 15s) automatically via `vercel.json` — 11 functions total, under the Hobby-plan limit of 12.

## Endpoints

- `GET /api/news?appVersion=1.1.6` — public feed (CORS `*`, CDN-cached ~1 min + `ETag`/`304`, `nextTransitionAt` for scheduled flips, fail-open 120 req/min/IP throttle, degraded `{news:[]}` on Redis outage).
- `GET /api/news?action=version` — feed generation counter `{v, nextTransitionAt}` (CDN-cached 60 s + `ETag`); devices sync when it changes or the transition becomes due. (Old `/api/news-version` URL still works via rewrite.)
- `GET /api/news-rss` — RSS 2.0 with the same visibility rules (CDN 5 min), per-item `/news#news-<id>` links.
- `POST /api/news-admin?action=login` `{password}` — sets HttpOnly `news_admin_session` cookie (`Secure` only on https; localhost works), returns `{csrf}` (send as `X-CSRF-Token` on every later call).
- `GET ?action=list` (optional `?limit=&offset=`, defaults to all) / `POST ?action=create|update|publish|unpublish|archive|delete` (delete → 7-day trash) / `POST ?action=restore|bulk|import` / `GET ?action=export|audit|feed-health|feed-history` / `POST ?action=simulate|repair-index`.
- `bulk` takes `{ops:[{action,id}]}` (1–50, one round-trip, per-op results); `restore` undoes a delete within 7 days; `export` dumps `{items,count,v}`; `import` validates 1–200 items (cap-aware); `feed-history` returns the last 50 feed changes; `simulate` dry-runs `{item,appVersion}` with no writes.
- `POST /api/news-admin?action=image` `{image (base64|data-URL), name?}` — imgbb upload proxy, same session+CSRF auth (old `/api/news-image` URL still works via rewrite).
- Skins: `GET/POST /api/skins` (public feed + community submit) and `?action=` admin ops (`list/create/update/publish/unpublish/archive/delete`, same session+CSRF auth; old `/api/skins-admin` URL still works via rewrite).
- Saves return a `visibility` verdict (`live` vs reason) so the panel can confirm immediately whether the item is on `/news`.
- `GET /api/news?all=1` — unfiltered public feed behind `/news` and the home teaser (status + time window only).
- `?action=feed-health` — `{ indexSize, payloadCount, liveCount, feedVersion, nextTransitionAt, orphanIds, items: [{ id, title, status, liveOnPublicFeed, reason }] }`; also powers the admin "Feed check" section (auto-runs whenever the section is expanded).

## Security

- SHA-256 `timingSafeEqual` password check, password never in URL, generic "Invalid password." (no attempt-count oracle).
- 5 failed logins → IP locked 15 min (`newsban:<ip>`).
- HMAC session cookie (6h, sliding refresh on use) + per-session CSRF token.
- Rotate `NEWS_ADMIN_PASSWORD` in Vercel env + redeploy to rotate all sessions (old HMACs stop verifying).
- Same-origin admin API (no wildcard CORS), strict security headers.
- Server-side zod-style validation: 8KB/item cap, https/toolz URLs + host allowlist, semver checks, audit log (`news:audit:*`, 90d, IP-hashed).

## Editor guide

The New/Edit dialog is a two-pane layout: Content (templates, counters, markdown
toolbar, thumbnail check), Targeting (Everyone reset, Latest-version shortcut,
"who sees this" + version simulator), Behavior (recurrence presets,
plain-language toggles, schedule quick chips in your local time with UTC
storage note). The live preview is pinned beside the form on desktop and stacks
under it on phones — no preview tab; it updates while you type and shows a
live/not-live verdict line ("~1 min") plus the app-popup and /news-article
previews. The preview mirrors the app: exactly one filled button — the CTA
labelled by Action label when an Action URL is set, otherwise "Got it"; there
is no "Later" button anywhere (snoozing is a gesture in the app: scrim tap,
system back or pull-down). The dialog body is the only scrollable region:
header, status/priority strip and footer stay pinned, save errors and the
discard warning render above the action bar where they are always visible.
Rule: a custom Action label requires an Action URL —
the editor warns inline and blocks the save if the label is set without one
(the server would silently drop the label otherwise, and the app would show no
CTA at all). Footer: Cancel / Save draft / Publish now (Update/Unpublish
when editing). "Publish now" forces `published` with immediate visibility.
Every save then re-checks the live public feed (CDN bypassed) and reports
"verified live" or the exact mismatch (e.g. image differs, not in feed yet).
Cloning opens a "(copy)" draft. Multi-select + bulk actions publish/unpublish/archive/delete in one round-trip; single deletes show an Undo toast (7-day trash). `n` = new, `/` = search. Sort by updated/publish/title; eight filter tiles
(All · Live on /news · Published · Drafts · Scheduled · Critical · Expired ·
Archived) are the overview AND the filter — one click switches the list, the
active tile fills with its Material container color, and a 2px category accent
bar keeps the palette legible. Search + sort + refresh + the selection counter
sit in a sticky command bar; the bulk bar slides in beneath it, so selections
made deep in the list stay actionable while scrolling. Unsaved changes ask
before discarding. Tool cards (Feed check / Test lab / Status + backups) live
in a sticky right rail on desktop and stack under the list on mobile; Audit log
is a collapsible section under the list. The design uses the site's Material 3
token scheme throughout: tonal surface containers for cards (16px) and chips
(12px), priority chips speaking the same container colors as the public /news
page, notice banners colored by meaning (teal = live/success, amber = warning,
red = error), and one soft spring for entrances — no gradients, no decoration. List rows
show LIVE-on-/news vs reason badges with local-time tooltips, an `↗ action
label` chip for Action-URL items and a title tooltip when the title truncates;
row actions split by frequency — Edit + Publish/Unpublish as buttons, Copy
public link / Clone / Archive / Delete behind the `⋯` menu ("Copy public link"
copies the same `/news#news-<id>` anchor the app's Share button hands out and
flashes "Link copied ✓"). Selected rows highlight in place; the first load
after login shows skeleton rows instead of a fake "No news yet", and empty
tabs/searches say why ("No drafts…", "No matches for …"). A failed row/bulk
action surfaces the page-top error banner by scrolling it into view. The "Feed check" card
sits in the tools rail, auto-runs on dashboard load and answers
"will /news show anything?" with generation, next-transition, per-item reasons and orphan detection. "Test lab" dry-runs any item × version (local + server `simulate`, no writes). "Status + backups" shows the last 50 feed changes plus Export/Import (UTC filenames, confirm before overwrite). Body markdown links: `https://`/`mailto:` open in a new tab, `toolz://` deep links render as inert text ("Opens inside the Toolz app") on the website and live in the app, and any other scheme renders as plain text (XSS hardening — a `javascript:` href is never emitted).

## Troubleshooting: published but not on /news

1. Open `/api/news?all=1` raw: `degraded: true` = backend/Redis/env problem
   (check Vercel function logs + env vars, then redeploy); 404 = not deployed.
   `429` = per-IP throttle tripped (fail-open retry after 60 s).
2. The admin "Feed check" card (tools rail, auto-runs on load): `draft` = never published (use Publish now or
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
