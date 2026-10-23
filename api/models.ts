import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * ============================================================================
 * Toolz AI Model Catalog — `GET /api/models`
 * ============================================================================
 *
 * WHAT THIS IS
 * -----------
 * The single source of truth for every AI provider the Toolz Android app
 * knows about: provider list, model lists, recommended + fallback models,
 * retired-model replacements, vision/file support, API endpoints, key
 * formats, setup tutorials and descriptions.
 *
 * The app fetches this on launch (cached 24h on-device) and falls back to
 * its bundled snapshot when offline — so this file, not an app release,
 * is what you edit when providers change their lineups.
 *
 * HOW TO UPDATE IT (maintainer cookbook)
 * --------------------------------------
 *  1. RETIRED MODEL (provider 404s a model ID, e.g. Groq kills `foo-1`):
 *       - Remove `foo-1` from that provider's `models` array.
 *       - Add `"foo-1": "<live-replacement-id>"` to `retiredModels`.
 *         The app auto-migrates any stored user selection to the
 *         replacement on next launch — no user action needed.
 *       - If it was the `recommendedModel` or in `fallbackModels`,
 *         point those at a live model too.
 *  2. NEW MODEL: append its ID to `models` (order = display order;
 *     put free/fast defaults FIRST). Add to `freeModels` if $0.
 *     Add a vision substring to `visionSubstrings` if it takes images.
 *  3. NEW PROVIDER: copy a whole provider block, fill every field.
 *     `id` must be lowercase slug; `displayName` is what the app shows.
 *  4. THEN: bump `CATALOG_VERSION` by 1 and set `UPDATED_AT` to today.
 *     The app only accepts payloads with `version >=` its cached one,
 *     so forgetting the bump = users never see your edit.
 *  5. `git push` — Vercel redeploys, CDN cache (1h) expires, done.
 *
 * FIELD REFERENCE
 * ---------------
 *  id                Lowercase slug, stable forever (app stores provider
 *                    display names; `canonicalProvider` maps old strings).
 *  displayName       Exact name shown in the app UI.
 *  chatCompletionUrl OpenAI-compatible `/chat/completions` endpoint.
 *                    `null` for native-SDK providers (Gemini, Claude).
 *  modelsUrl         Live `/models` listing endpoint, or `null` if the
 *                    provider has none (app then trusts this catalog).
 *  openAiCompatible  True when `chatCompletionUrl` speaks the OpenAI
 *                    chat schema (drives the app's request builder).
 *  recommendedModel  Default for new users + post-404 recovery target.
 *  fallbackModels    Tried in order when the selected model 404s/429s
 *                    (max 4 attempts total, then a friendly error).
 *  models            Full picker list, display order. Free/fast first.
 *  freeModels        Subset of `models` costing $0 (FREE badge in UI).
 *                    Rule of thumb: `:free`/`-free` suffix, Big Pickle,
 *                    Groq dev tier, Gemini free-tier Flash/Flash-Lite.
 *  retiredModels     `{ deadId: liveReplacement }`. Applied to stored
 *                    user selections AND to in-flight 404 recovery.
 *  visionSubstrings  Case-insensitive substrings; a model supports image
 *                    input if its ID contains ANY of these. Provider-wide
 *                    support (Claude) = `[""]` (matches all).
 *                    The app ALSO always accepts `vision`/`vl` substrings.
 *  supportsFiles     Whether document attachments are accepted at all.
 *  filesSubstrings   `null` = `supportsFiles` applies to every model.
 *                    Otherwise a model accepts files only if its ID contains
 *                    ANY of these (case-insensitive). E.g. OpenRouter/ChatGPT
 *                    gate files per model family while Zen/Go accept all.
 *  keyPlaceholder    Shown greyed-out in the key field.
 *  keyUrl            "Get key" link (where to create the API key).
 *  keyPrefix         Required key prefix, or `null` = any key ≥8 chars
 *                    (OpenCode keys have no stable prefix).
 *  description       One-liner shown at the top of the model picker.
 *  tutorial          Numbered "how to get a key" steps for the guide dialog.
 *
 * CACHING
 * -------
 * `Cache-Control: public, max-age=3600` — Vercel edge caches 1h, the app
 * caches 24h in DataStore. Worst case after your push: users see the new
 * catalog within ~1h (CDN) or immediately via Settings → Refresh models.
 *
 * v3 AUDIT NOTES (2026-10-23)
 * ---------------------------
 *  - Every ID below was checked against the provider's own docs/changelog
 *    or OpenRouter's live catalog on 2026-10-23. Intelligence ranking
 *    comes from Artificial Analysis Intelligence Index v4.3.x.
 *  - OpenCode Zen/Go now serve each model over ONE protocol family
 *    (chat-completions, Responses, Anthropic Messages or Gemini). This app
 *    only speaks chat-completions for them, so only chat-completions
 *    models are listed. GPT / Claude / Gemini / Grok / Muse / Qwen3.8-Flash
 *    / MiniMax M3 on Go need other protocols and were moved to
 *    `retiredModels` (migrated to a working equivalent).
 *  - Per-provider gotchas are called out in comments next to each block.
 */

const CATALOG_VERSION = 4;
const UPDATED_AT = '2026-10-23';

interface ProviderCatalog {
  id: string;
  displayName: string;
  chatCompletionUrl: string | null;
  modelsUrl: string | null;
  openAiCompatible: boolean;
  recommendedModel: string;
  fallbackModels: string[];
  models: string[];
  freeModels: string[];
  retiredModels: Record<string, string>;
  visionSubstrings: string[];
  supportsFiles: boolean;
  filesSubstrings: string[] | null;
  keyPlaceholder: string;
  keyUrl: string;
  keyPrefix: string | null;
  description: string;
  tutorial: string[];
}

const PROVIDERS: ProviderCatalog[] = [
  // ── Google Gemini (native SDK) ─────────────────────────────────────
  // Free tier (Oct 2026): 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite, 3.1 Flash-Lite
  // and Gemma 4. Gemini 4 Argon + 3.1 Pro are PAID ONLY. Google no longer
  // publishes per-model free limits — they are shown per project in AI Studio.
  // 2.5-series is restricted to projects that already used it (new keys 404/403).
  // NOTE: the Pro model ID is `gemini-3.1-pro-preview` (not `gemini-3.1-pro`).
  {
    id: 'gemini',
    displayName: 'Gemini',
    chatCompletionUrl: null,
    modelsUrl: null,
    openAiCompatible: false,
    recommendedModel: 'gemini-3.5-flash-lite',
    fallbackModels: [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
    ],
    models: [
      // Free tier first
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite',
      'gemma-4-31b-it',
      'gemma-4-26b-a4b-it',
      // Paid
      'gemini-3.1-pro-preview',
      'gemini-4-argon',
    ],
    freeModels: [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite',
      'gemma-4-31b-it',
      'gemma-4-26b-a4b-it',
    ],
    retiredModels: {
      // Google's own replacement guidance for the 2.5 series
      'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
      'gemini-2.5-flash': 'gemini-3.8-flash',
      'gemini-2.5-pro': 'gemini-3.1-pro-preview',
      // IDs that never existed / were mis-typed in earlier catalog versions
      'gemini-3.1-pro': 'gemini-3.1-pro-preview',
      'gemini-3.0-pro': 'gemini-3.1-pro-preview',
      'gemini-3-pro-preview': 'gemini-3.1-pro-preview',
      'gemini-3.0-flash': 'gemini-3.8-flash',
      'gemini-3-flash': 'gemini-3.8-flash',
      'gemini-3.1-flash': 'gemini-3.8-flash',
    },
    visionSubstrings: ['gemini', 'gemma'],
    supportsFiles: true,
    filesSubstrings: ['gemini'], // Gemma accepts images but not document uploads
    keyPlaceholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AIza',
    description:
      "Google's fast multimodal models with a 1M-token context. Gemini 3.8 Flash, Flash-Lite and Gemma 4 are free (no card); Gemini 4 Argon is the paid flagship.",
    tutorial: [
      'Open Google AI Studio (aistudio.google.com) and sign in with your Google account',
      "Click 'Get API key' in the left sidebar",
      "Click 'Create API key', then pick or create a Google Cloud project",
      'Copy the key (starts with AIza...) and paste it here',
      'Free tier needs no credit card but is rate-limited per project; Gemini 4 Argon and 3.1 Pro require a billing account. On 429 errors wait a bit or pick a Flash-Lite model',
    ],
  },

  // ── OpenAI ChatGPT (OpenAI-compatible) ─────────────────────────────
  // GPT-6 family (Sep 2026): Astra = flagship, Sol = balanced, Luna = cheap.
  // GOTCHA: gpt-6-astra and gpt-6.1-sol do NOT accept reasoning_effort "none"
  // (gpt-6-sol / gpt-6-luna do) — if the request builder sends "none" or a
  // custom temperature it must skip those two.
  {
    id: 'chatgpt',
    displayName: 'ChatGPT',
    chatCompletionUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    openAiCompatible: true,
    recommendedModel: 'gpt-6-luna',
    fallbackModels: ['gpt-6-luna', 'gpt-5.6-luna', 'gpt-6-sol'],
    models: [
      'gpt-6-luna', // $0.10 / $0.50
      'gpt-6-sol', // $2 / $10
      'gpt-6.1-sol', // $2 / $10, near-Astra quality (Sep 29)
      'gpt-6-astra', // $10 / $50 flagship
      'gpt-5.6-luna', // $0.20 / $1.20
      'gpt-5.6-terra', // $2 / $12
    ],
    freeModels: [],
    retiredModels: {},
    visionSubstrings: ['gpt-6', 'gpt-5', 'gpt-4'],
    supportsFiles: true,
    filesSubstrings: ['gpt-6', 'gpt-5', 'gpt-4'], // same families as vision
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPrefix: 'sk-',
    description:
      "OpenAI's GPT-6 family: Luna for cheap everyday chat, Sol for balanced smarts, Astra for the hardest reasoning and coding.",
    tutorial: [
      'Open platform.openai.com and sign in (or create an account)',
      'Add billing: Settings → Billing → payment method (API usage is pay-as-you-go, separate from a Plus subscription)',
      "Open the API Keys page (platform.openai.com/api-keys)",
      "Click '+ Create new secret key', name it Toolz",
      'Copy the key NOW (starts with sk-...) — it is never shown again — and paste it here',
      'Optional: cap spending under Billing → Limits',
    ],
  },

  // ── Groq (OpenAI-compatible, free dev tier) ────────────────────────
  // NOTE (Oct 2026): Groq's self-serve catalog is now tiny. Llama 3.1 8B and
  // Llama 3.3 70B are ENTERPRISE-ONLY ("Contact Sales"); llama-4-*, mixtral,
  // deepseek-r1-distill, qwen3-32b, mistral-saba, allam-2-7b and
  // qwen3.6-27b are gone. Never re-add those IDs to `models` without
  // removing them from `retiredModels` — they 404.
  // gpt-oss is TEXT-ONLY. Qwen3.8-27B (preview) is the only vision model.
  {
    id: 'groq',
    displayName: 'Groq',
    chatCompletionUrl: 'https://api.groq.com/openai/v1/chat/completions',
    modelsUrl: 'https://api.groq.com/openai/v1/models',
    openAiCompatible: true,
    recommendedModel: 'openai/gpt-oss-20b',
    fallbackModels: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
    ],
    models: [
      // Production (console.groq.com/docs/models)
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'groq/compound',
      'groq/compound-mini',
      // Preview (may vanish at short notice)
      'qwen/qwen3.8-27b',
    ],
    // Free plan covers these (rate-limited: ~30 RPM, ~1K requests/day)
    freeModels: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'groq/compound',
      'groq/compound-mini',
      'qwen/qwen3.8-27b',
    ],
    retiredModels: {
      'llama-3.1-8b-instant': 'openai/gpt-oss-20b', // shut down 16 Aug 2026 on free/dev tiers
      'llama-3.1-8b-versatile': 'openai/gpt-oss-20b',
      'llama3-8b-8192': 'openai/gpt-oss-20b',
      'allam-2-7b': 'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile': 'openai/gpt-oss-120b', // enterprise-only now
      'meta-llama/llama-4-behemoth-288b': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-maverick-17b': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-scout-17b': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-maverick-17b-128e-instruct': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-scout-17b-16e-instruct': 'openai/gpt-oss-20b',
      'meta-llama/llama-3.3-70b-instruct': 'openai/gpt-oss-120b',
      'meta-llama/llama-3.1-8b-instruct': 'openai/gpt-oss-20b',
      'deepseek/deepseek-r1-distill-70b': 'openai/gpt-oss-120b',
      'deepseek-r1-distill-llama-70b': 'openai/gpt-oss-120b',
      'qwen/qwen3-vl-32b-instruct': 'qwen/qwen3.8-27b',
      'qwen/qwen3-32b': 'qwen/qwen3.8-27b',
      'qwen/qwen3.6-27b': 'qwen/qwen3.8-27b',
      'mistral/mistral-saba-24b': 'openai/gpt-oss-120b',
      'mixtral-8x7b-32768': 'openai/gpt-oss-120b',
      'moonshotai/kimi-k2-instruct': 'openai/gpt-oss-120b',
      'minimaxai/minimax-m2.7': 'openai/gpt-oss-120b', // enterprise-only preview
    },
    visionSubstrings: ['vision', 'vl', 'qwen'],
    supportsFiles: false,
    filesSubstrings: null,
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    keyPrefix: 'gsk_',
    description:
      'Extremely low-latency inference on LPUs with a free tier. GPT-OSS 20B/120B for text, Qwen3.8-27B for images. Llama models are now enterprise-only.',
    tutorial: [
      'Open console.groq.com and sign in (Google or GitHub works)',
      "Open 'API Keys' in the left sidebar",
      "Click 'Create API Key', name it Toolz, Submit",
      'Copy the key (starts with gsk_...) and paste it here — free tier, no card needed',
      'Free tier has per-minute and daily limits that reset automatically; on 429 errors wait a bit or pick gpt-oss-20b',
    ],
  },

  // ── Anthropic Claude (native Messages API, all multimodal) ─────────
  // Current lineup (Oct 2026): Haiku 5.5 ($0.10/$0.50), Sonnet 5.5 ($2/$10),
  // Opus 5.5 ($4/$20, #1 on Artificial Analysis), Fable 5.1 ($10/$50).
  // IDs are dateless and pinned. Older 4.x/5.0 models still work but are
  // intentionally left out of the picker.
  {
    id: 'claude',
    displayName: 'Claude',
    chatCompletionUrl: null,
    modelsUrl: null,
    openAiCompatible: false,
    recommendedModel: 'claude-haiku-5-5',
    fallbackModels: ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-haiku-4-5'],
    models: [
      'claude-haiku-5-5',
      'claude-sonnet-5-5',
      'claude-opus-5-5',
      'claude-fable-5-1',
    ],
    freeModels: [],
    retiredModels: {},
    visionSubstrings: [''], // all Claude 4/5 models natively support vision
    supportsFiles: true,
    filesSubstrings: null,
    keyPlaceholder: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPrefix: 'sk-ant-',
    description:
      "Anthropic's Claude 5.5 family: Haiku for fast, cheap chat, Sonnet for everyday work, Opus for top-tier reasoning and coding, Fable for the hardest jobs. 1M context.",
    tutorial: [
      'Open console.anthropic.com and sign in (or create an account)',
      'Add billing: Settings → Billing → add a card (API is pay-as-you-go)',
      "Go to Settings → API Keys (console.anthropic.com/settings/keys)",
      "Click 'Create Key' and name it Toolz",
      'Copy the key (starts with sk-ant-...) and paste it here',
    ],
  },

  // ── DeepSeek (OpenAI-compatible) ───────────────────────────────────
  // deepseek-chat / deepseek-reasoner retired 2026-07-24. The Flash line is
  // now addressed as `deepseek-flash` (served by DeepSeek-V4.1-Flash-1017,
  // accepts images, thinking togglable). `deepseek-v4-flash` and
  // `deepseek-v4-flash-vision-exp` still resolve but are legacy aliases.
  // Peak/off-peak pricing applies (off-peak = half price).
  {
    id: 'deepseek',
    displayName: 'DeepSeek',
    chatCompletionUrl: 'https://api.deepseek.com/v1/chat/completions',
    modelsUrl: 'https://api.deepseek.com/v1/models',
    openAiCompatible: true,
    recommendedModel: 'deepseek-flash',
    fallbackModels: ['deepseek-flash', 'deepseek-v4-pro'],
    models: ['deepseek-flash', 'deepseek-v4-pro'],
    freeModels: [],
    retiredModels: {
      'deepseek-chat': 'deepseek-flash',
      'deepseek-reasoner': 'deepseek-flash',
      'deepseek-v4-flash': 'deepseek-flash',
      'deepseek-v4-flash-vision-exp': 'deepseek-flash',
      'deepseek-v4.1-flash': 'deepseek-flash',
    },
    visionSubstrings: ['vision', 'vl', 'flash'],
    supportsFiles: false,
    filesSubstrings: null,
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    keyPrefix: 'sk-',
    description:
      'Extremely cost-efficient open-weight V4 models with top-tier coding and math. deepseek-flash is fast and cheap (and sees images); deepseek-v4-pro is stronger. No free tier.',
    tutorial: [
      'Open platform.deepseek.com and sign in (or create an account)',
      'Top up a small balance — usage is pay-per-use and very cheap',
      "Open 'API Keys' in the sidebar (platform.deepseek.com/api_keys)",
      "Click 'Create API Key' and name it Toolz",
      'Copy the key (starts with sk-...) and paste it here',
    ],
  },

  // ── OpenRouter (OpenAI-compatible hub, :free models cost $0) ───────
  // Free catalog verified live 2026-10-23. :free endpoints are limited to
  // 20 req/min and 50 req/day (1,000/day after a one-time $10 credit top-up)
  // and free IDs rotate often. `openrouter/free` is a router that always
  // picks a currently-working free model — it's the last-resort fallback.
  // Prices (per 1M in/out) in comments are from OpenRouter / the lab's own endpoint.
  {
    id: 'openrouter',
    displayName: 'OpenRouter',
    chatCompletionUrl: 'https://openrouter.ai/api/v1/chat/completions',
    modelsUrl: 'https://openrouter.ai/api/v1/models',
    openAiCompatible: true,
    recommendedModel: 'thinkingmachines/inkling:free',
    fallbackModels: [
      'thinkingmachines/inkling:free',
      'nvidia/nemotron-3.5-super-vl:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'openrouter/free',
    ],
    models: [
      // ── Free (:free) — $0 ──
      'thinkingmachines/inkling:free', // 975B MoE, 1M ctx, text+image+audio
      'thinkingmachines/inkling-small:free',
      'nvidia/nemotron-3.5-super-vl:free', // vision, AA 26.5
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'nvidia/nemotron-3.5-lightning:free', // fastest
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'poolside/laguna-s-2.1:free', // coding
      'poolside/laguna-xs-2.1:free', // lighter coding
      'cohere/north-mini-code:free', // coding
      'dots-studio/dots-3-note-preview:free',
      'openrouter/free', // auto-router across whatever is free right now
      // ── Cheap ──
      'openai/gpt-6-luna', // $0.10 / $0.50
      'deepseek/deepseek-v4.1-flash', // $0.15 / $0.60 off-peak
      'xiaomi/mimo-v2.6-flash', // $0.14 / $0.28
      'z-ai/glm-5.3-flash', // $0.15 / $0.50
      'openai/gpt-oss-120b',
      'google/gemini-3.8-flash', // $0.75 / $3.75 (promo)
      'anthropic/claude-haiku-5.5', // $0.10 / $0.50
      // ── Strong value ──
      'xiaomi/mimo-v2.6-pro', // $0.435 / $0.87 — top open-weights on AA (46)
      'deepseek/deepseek-v4-pro-0813', // $0.66 / $1.98 off-peak
      'z-ai/glm-5.3', // $1.40 / $4.40
      'anthropic/claude-sonnet-5.5', // $2 / $10 — AA 56
      'openai/gpt-6.1-sol', // $2 / $10
      'qwen/qwen3.8-max-0902', // $2 / $6
      'x-ai/grok-4.7', // $2 / $6
      'moonshotai/kimi-k3', // $3 / $15
      // ── Flagship ──
      'anthropic/claude-opus-5.5', // $4 / $20 — AA #1 (58)
      'google/gemini-4-argon', // $4 / $20 after Nov 30 promo
      'openai/gpt-6-astra', // $10 / $50
      'anthropic/claude-fable-5.1', // $10 / $50
    ],
    freeModels: [
      'thinkingmachines/inkling:free',
      'thinkingmachines/inkling-small:free',
      'nvidia/nemotron-3.5-super-vl:free',
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'nvidia/nemotron-3.5-lightning:free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'poolside/laguna-s-2.1:free',
      'poolside/laguna-xs-2.1:free',
      'cohere/north-mini-code:free',
      'dots-studio/dots-3-note-preview:free',
      'openrouter/free',
    ],
    retiredModels: {
      // :free endpoints that disappeared from OpenRouter's live free list
      'nvidia/nemotron-3-nano-30b-a3b:free': 'thinkingmachines/inkling:free',
      'google/gemma-3-27b-it:free': 'google/gemma-4-31b-it:free',
      'deepseek/deepseek-chat:free': 'thinkingmachines/inkling:free',
      'deepseek/deepseek-r1:free': 'thinkingmachines/inkling:free',
      'deepseek/deepseek-chat-v3-0324:free': 'thinkingmachines/inkling:free',
      'meta-llama/llama-4-scout:free': 'thinkingmachines/inkling:free',
      'meta-llama/llama-4-maverick:free': 'thinkingmachines/inkling:free',
      'qwen/qwen3-coder:free': 'poolside/laguna-s-2.1:free', // removed July 19, 2026
      'openai/gpt-oss-120b:free': 'openai/gpt-oss-120b',
      'openai/gpt-oss-20b:free': 'openai/gpt-oss-120b',
    },
    visionSubstrings: [
      'vision', 'vl', 'gemini', 'claude', 'gpt-6', 'gpt-5', 'gpt-4', 'qwen',
      'gemma', 'inkling', 'nemotron-3.5-super', 'mimo', 'grok', 'kimi', 'dots',
    ],
    supportsFiles: true,
    filesSubstrings: ['claude', 'gemini', 'gpt-6', 'gpt-5', 'gpt-4'],
    keyPlaceholder: 'sk-or-...',
    keyUrl: 'https://openrouter.ai/keys',
    keyPrefix: 'sk-or-',
    description:
      'One API for almost any model. Models ending in :free cost $0 (rate-limited: 50 requests/day, 1,000 after a one-time $10 top-up). "openrouter/free" auto-picks a working free model.',
    tutorial: [
      'Open openrouter.ai and sign in (Google or GitHub works)',
      'Optional: add credits for paid models — models ending in :free work with zero balance (20 requests/min, 50/day; a one-time $10 top-up raises that to 1,000/day)',
      "Open Keys (openrouter.ai/keys)",
      "Click 'Create Key' and name it Toolz",
      'Copy the key (starts with sk-or-...) and paste it here',
    ],
  },

  // ── OpenCode Zen (OpenAI-compatible gateway, many $0 models) ───────
  // Docs: https://opencode.ai/v2/docs/console/models — live list at
  // /inference/v1/models. Free models are limited-time promos; keep
  // `freeModels` in sync. Only chat-completions models are listed: GPT /
  // Claude / Gemini / Grok / Muse / Qwen3.8-Flash / Qwen3.6-Plus on Zen use the
  // Responses, Messages or Gemini protocols and can't be called from here.
  // CAVEAT: Zen's docs contradict themselves on whether free models can be
  // called from non-OpenCode clients ("free chat models can be called without
  // [a key]" vs "free-tier chat models require OpenCode"). Test a free model
  // from the app once before shipping; if it 401/403s, drop the free IDs and
  // set recommendedModel to `glm-5.3-flash`.
  // Privacy: Big Pickle and MiMo free may train on prompts; NVIDIA free
  // endpoints are trial-only and logged.
  {
    id: 'opencode-zen',
    displayName: 'OpenCode Zen',
    chatCompletionUrl: 'https://opencode.ai/inference/openai/v1/chat/completions',
    modelsUrl: 'https://opencode.ai/inference/v1/models',
    openAiCompatible: true,
    recommendedModel: 'glm-5.3-flash-free',
    fallbackModels: [
      'glm-5.3-flash-free',
      'deepseek-v4.1-flash-free',
      'mimo-v2.6-flash-free',
      'big-pickle',
    ],
    models: [
      // FREE ($0, limited time)
      'glm-5.3-flash-free',
      'deepseek-v4.1-flash-free',
      'nemotron-3.5-super-vl-free',
      'mimo-v2.6-flash-free',
      'nemotron-3-ultra-free',
      'nemotron-3.5-lightning-free',
      'big-pickle',
      'beam-free',
      'longcat-2.5-preview-free',
      // Cheap
      'glm-5.3-flash', // $0.15 / $0.50
      'deepseek-v4.1-flash', // $0.30 / $1.20
      'minimax-m3', // $0.30 / $1.20
      // Strong value
      'deepseek-v4-pro', // $1.74 / $3.48
      'glm-5.3', // $1.40 / $4.40
      'kimi-k2.7-code', // $0.95 / $4.00
      'qwen3.8-max', // $2 / $6
      'mistral-large-4', // $0.68 / $2.09 (50% off)
      'kimi-k3', // $3 / $15
    ],
    freeModels: [
      'glm-5.3-flash-free',
      'deepseek-v4.1-flash-free',
      'nemotron-3.5-super-vl-free',
      'mimo-v2.6-flash-free',
      'nemotron-3-ultra-free',
      'nemotron-3.5-lightning-free',
      'big-pickle',
      'beam-free',
      'longcat-2.5-preview-free',
    ],
    retiredModels: {
      // Free models that left Zen
      'muse-spark-1.3-contributor-free': 'glm-5.3-flash-free',
      'muse-spark-1.2-contributor-free': 'glm-5.3-flash-free',
      'mimo-v2.5-free': 'mimo-v2.6-flash-free',
      'ling-3.0-flash-fin-free': 'glm-5.3-flash-free',
      'deepseek-v4-flash-free': 'deepseek-v4.1-flash-free',
      // Renamed / deprecated
      'deepseek-v4-flash': 'deepseek-v4.1-flash',
      'minimax-m2.7': 'minimax-m3',
      'kimi-k2.6': 'kimi-k2.7-code',
      'glm-5.1': 'glm-5.3',
      'glm-5.2': 'glm-5.3',
      // Now Responses / Messages / Gemini protocol only → not callable via chat-completions
      'qwen3.6-plus': 'qwen3.8-max',
      'qwen3.7-plus': 'qwen3.8-max',
      'gpt-5.6-luna': 'glm-5.3-flash',
      'gpt-6-luna': 'glm-5.3-flash',
      'gemini-3.5-flash': 'deepseek-v4.1-flash',
      'gemini-3-flash': 'deepseek-v4.1-flash',
      'claude-haiku-4-5': 'glm-5.3-flash',
      'claude-sonnet-5': 'qwen3.8-max',
      'claude-sonnet-5-5': 'qwen3.8-max',
      'grok-4.5': 'kimi-k3',
      'muse-spark-1.3': 'glm-5.3',
    },
    visionSubstrings: [
      'vision', 'vl', 'kimi', 'qwen', 'mimo', 'deepseek-v4.1-flash', 'beam',
    ],
    supportsFiles: true, // gateway accepts attachments; model may ignore
    filesSubstrings: null,
    keyPlaceholder: 'Paste key from opencode.ai/auth',
    keyUrl: 'https://opencode.ai/auth',
    keyPrefix: null,
    description:
      'Curated gateway by the OpenCode team (opencode.ai). Pay-as-you-go plus many FREE models (GLM-5.3 Flash, DeepSeek V4.1 Flash, MiMo, Nemotron, Big Pickle). OpenAI-compatible chat models only.',
    tutorial: [
      'Open opencode.ai/auth and sign in',
      'Add billing details / buy credits (pay-as-you-go; the FREE models cost $0)',
      'Copy your API key from the dashboard and paste it here',
      'Pick a FREE model to start: glm-5.3-flash-free, deepseek-v4.1-flash-free or mimo-v2.6-flash-free',
      'Free models are limited-time promos and may change; track paid usage in the same dashboard',
    ],
  },

  // ── OpenCode Go (OpenAI-compatible, subscription) ──────────────────
  // Docs: https://opencode.ai/v2/docs/console/go — Go $10/mo, Go Plus $40/mo.
  // Only chat-completions models are listed. On Go, these now need other
  // protocols and are NOT callable here: grok-4.7, gpt-6-luna, gpt-5.6-luna,
  // claude-haiku-5-5, gemini-4-argon-contributor, muse-spark-*,
  // minimax-m3 (Messages), qwen3.8-max/flash + qwen3.7-plus (Messages).
  // DeepSeek models need "Global" region enabled in the workspace's Privacy
  // settings. Go is meant for coding-agent traffic; users must be on a
  // single-member workspace.
  {
    id: 'opencode-go',
    displayName: 'OpenCode Go',
    chatCompletionUrl: 'https://opencode.ai/inference/go/openai/v1/chat/completions',
    modelsUrl: 'https://opencode.ai/inference/go/v1/models',
    openAiCompatible: true,
    recommendedModel: 'glm-5.3-flash',
    fallbackModels: [
      'glm-5.3-flash',
      'deepseek-v4.1-flash',
      'mimo-v2.6-flash',
      'longcat-2.5-preview-free',
    ],
    models: [
      // Free (unlimited, limited time) + fast/cheap first
      'glm-5.3-flash',
      'longcat-2.5-preview-free',
      'beam-free',
      'deepseek-v4.1-flash',
      'mimo-v2.6-flash',
      'minimax-m3.1-flash',
      // Strong value
      'glm-5.2',
      'glm-5.3',
      'kimi-k2.7-code',
      'mimo-v2.6-pro', // top open-weights model on Artificial Analysis
      'deepseek-v4-pro',
      'hy4-preview',
      'kimi-k3',
      'kimi-k3.1-pro',
    ],
    freeModels: ['longcat-2.5-preview-free', 'beam-free'],
    retiredModels: {
      // Renamed / dropped from Go
      'glm-5.1': 'glm-5.2',
      'kimi-k2.6': 'kimi-k2.7-code',
      'deepseek-v4-flash': 'deepseek-v4.1-flash',
      'deepseek-v4-flash-vision-exp': 'deepseek-v4.1-flash',
      'minimax-m2.7': 'minimax-m3.1-flash',
      // Now Messages / Responses protocol only → not callable via chat-completions
      'minimax-m3': 'minimax-m3.1-flash',
      'qwen3.6-plus': 'glm-5.3',
      'qwen3.7-plus': 'glm-5.3',
      'qwen3.7-max': 'glm-5.3',
      'qwen3.8-max': 'glm-5.3',
      'qwen3.8-flash': 'glm-5.3-flash',
      'muse-spark-1.3-contributor': 'glm-5.3-flash',
      'muse-spark-1.2-contributor': 'glm-5.3-flash',
      'grok-4.6': 'glm-5.3',
      'gpt-5.6-luna': 'glm-5.3-flash',
    },
    visionSubstrings: ['vision', 'vl', 'kimi', 'mimo', 'deepseek-v4.1-flash', 'beam'],
    supportsFiles: true, // gateway accepts attachments; model may ignore
    filesSubstrings: null,
    keyPlaceholder: 'Paste key from opencode.ai/auth',
    keyUrl: 'https://opencode.ai/auth',
    keyPrefix: null,
    description:
      'Low-cost subscription ($10/mo Go, $40/mo Go Plus) for strong open models: GLM-5.3, Kimi K3, DeepSeek V4, MiMo-V2.6, MiniMax. OpenAI-compatible chat models only.',
    tutorial: [
      'Open opencode.ai/auth and sign in',
      'Subscribe to OpenCode Go ($10/month) or Go Plus ($40/month) — single-member workspace only',
      'Copy your Go API key from the dashboard and paste it here',
      'Pick a Go model (e.g. glm-5.3-flash) and chat. DeepSeek models need "Global" enabled under Settings → Privacy → Regions',
      'Watch the 5-hour / weekly / monthly usage meters in the console; free models keep working after you hit the limit',
    ],
  },
];

const DISCLAIMER_TEXT =
  'Higher-tier models are smarter but consume more tokens. Flash, Haiku, Luna, and Mini models are usually best for everyday mobile use.';

const API_KEY_SUGGESTION =
  'Using your own API key gives you the best availability and the most predictable experience.';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Edge-cached 1h; the app additionally caches 24h and offers manual refresh.
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  return res.status(200).json({
    version: CATALOG_VERSION,
    updatedAt: UPDATED_AT,
    providers: PROVIDERS,
    disclaimerText: DISCLAIMER_TEXT,
    apiKeySuggestion: API_KEY_SUGGESTION,
  });
}
