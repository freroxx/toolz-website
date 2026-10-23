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
 *                    allam-2-7b, Groq dev tier, Gemini flash-lite.
 *  retiredModels     `{ deadId: liveReplacement }`. Applied to stored
 *                    user selections AND to in-flight 404 recovery.
 *  visionSubstrings  Case-insensitive substrings; a model supports image
 *                    input if its ID contains ANY of these. Provider-wide
 *                    support (Gemini, Claude) = `[""]` (matches all).
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
 */

const CATALOG_VERSION = 2;
const UPDATED_AT = '2026-09-13';

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
  // ── Google Gemini (native SDK, all models multimodal) ──────────────
  {
    id: 'gemini',
    displayName: 'Gemini',
    chatCompletionUrl: null,
    modelsUrl: null,
    openAiCompatible: false,
    recommendedModel: 'gemini-2.5-flash-lite',
    fallbackModels: ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3-flash'],
    models: [
      // Free-tier friendly first, then capable tiers (verified 2026 lineup)
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-3-flash',
      'gemini-3.1-pro',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.0-pro',
      'gemini-3.0-flash',
    ],
    freeModels: ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'],
    retiredModels: {},
    visionSubstrings: [''], // every Gemini model takes images
    supportsFiles: true,
    filesSubstrings: null, // every Gemini model takes files
    keyPlaceholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AIza',
    description:
      "Google's fast multimodal assistant. Class-leading context window lengths and strong speed. Flash-Lite is free-tier friendly.",
    tutorial: [
      'Open Google AI Studio (aistudio.google.com) and sign in with your Google account',
      "Click 'Get API key' in the left sidebar",
      "Click 'Create API key', then pick or create a Google Cloud project",
      'Copy the key (starts with AIza...) and paste it here',
      'Free tier is generous and needs no credit card; if a key stops working, just create a fresh one',
    ],
  },

  // ── OpenAI ChatGPT (OpenAI-compatible) ─────────────────────────────
  {
    id: 'chatgpt',
    displayName: 'ChatGPT',
    chatCompletionUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    openAiCompatible: true,
    recommendedModel: 'gpt-5-mini',
    fallbackModels: ['gpt-5-mini', 'gpt-5-nano', 'gpt-4o-mini'],
    models: [
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-5',
      'gpt-5.6-luna',
      'gpt-5.6-sol',
      'gpt-5.6-terra',
      'gpt-5.5',
      'gpt-5.4',
      'gpt-5.4-mini',
      'gpt-5.4-nano',
      'o4-mini',
      'o3',
      'gpt-4o',
      'gpt-4o-mini',
    ],
    freeModels: [],
    retiredModels: {},
    visionSubstrings: ['gpt-5', 'gpt-4', 'o'],
    supportsFiles: true,
    filesSubstrings: ['gpt-5', 'gpt-4', 'o'], // same families as vision
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPrefix: 'sk-',
    description:
      "OpenAI's latest GPT-5 and o-series models, providing industry-leading reasoning and generation.",
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
  // NOTE (Sep 2026): Groq retired llama-4-*, mixtral-8x7b-32768,
  // deepseek-r1-distill-*, qwen3-32b, mistral-saba AND llama-3.1-8b-instant
  // (replaced by openai/gpt-oss-20b). Never re-add those IDs to `models`
  // without removing them from `retiredModels` — they 404.
  {
    id: 'groq',
    displayName: 'Groq',
    chatCompletionUrl: 'https://api.groq.com/openai/v1/chat/completions',
    modelsUrl: 'https://api.groq.com/openai/v1/models',
    openAiCompatible: true,
    recommendedModel: 'openai/gpt-oss-20b',
    fallbackModels: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile'],
    models: [
      // Production models only (console.groq.com/docs/models)
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.3-70b-versatile',
      'groq/compound',
      'groq/compound-mini',
      'allam-2-7b',
      // Preview / eval models (may be gated per account)
      'qwen/qwen3.6-27b',
      'qwen/qwen3.8-27b',
      'minimaxai/minimax-m2.7',
      'openai/gpt-oss-safeguard-20b',
    ],
    // Free dev tier covers all production models (rate-limited)
    freeModels: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.3-70b-versatile',
      'groq/compound',
      'groq/compound-mini',
      'allam-2-7b',
    ],
    retiredModels: {
      'llama-3.1-8b-instant': 'openai/gpt-oss-20b',
      'llama-3.1-8b-versatile': 'openai/gpt-oss-20b',
      'llama3-8b-8192': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-behemoth-288b': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-maverick-17b': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-scout-17b': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-maverick-17b-128e-instruct': 'openai/gpt-oss-20b',
      'meta-llama/llama-4-scout-17b-16e-instruct': 'openai/gpt-oss-20b',
      'meta-llama/llama-3.3-70b-instruct': 'openai/gpt-oss-20b',
      'meta-llama/llama-3.1-8b-instruct': 'openai/gpt-oss-20b',
      'deepseek/deepseek-r1-distill-70b': 'openai/gpt-oss-20b',
      'deepseek-r1-distill-llama-70b': 'openai/gpt-oss-20b',
      'qwen/qwen3-vl-32b-instruct': 'qwen/qwen3.6-27b',
      'qwen/qwen3-32b': 'qwen/qwen3.6-27b',
      'mistral/mistral-saba-24b': 'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768': 'llama-3.3-70b-versatile',
      'moonshotai/kimi-k2-instruct': 'openai/gpt-oss-120b',
    },
    visionSubstrings: ['vision', 'vl', 'gpt-oss', 'qwen', 'compound'],
    supportsFiles: false,
    filesSubstrings: null,
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    keyPrefix: 'gsk_',
    description:
      'Extremely low-latency inference using LPUs. Free dev tier. NOTE: llama-4 / mixtral / llama-3.1-instant IDs were retired — use openai/gpt-oss-20b.',
    tutorial: [
      'Open console.groq.com and sign in (Google or GitHub works)',
      "Open 'API Keys' in the left sidebar",
      "Click 'Create API Key', name it Toolz, Submit",
      'Copy the key (starts with gsk_...) and paste it here — free tier, no card needed',
      'Free tier has daily request limits that reset automatically; on 429 errors wait a bit or pick a lighter model',
    ],
  },

  // ── Anthropic Claude (native Messages API, all multimodal) ─────────
  {
    id: 'claude',
    displayName: 'Claude',
    chatCompletionUrl: null,
    modelsUrl: null,
    openAiCompatible: false,
    recommendedModel: 'claude-haiku-4-5',
    fallbackModels: ['claude-haiku-4-5', 'claude-sonnet-4-5'],
    models: [
      'claude-haiku-4-5',
      'claude-sonnet-4-5',
      'claude-sonnet-4-6',
      'claude-sonnet-5',
      'claude-opus-4-5',
      'claude-opus-4-6',
      'claude-opus-4-7',
      'claude-opus-4-8',
      'claude-opus-5',
      'claude-fable-5',
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
      "Anthropic's 4/5-series models offering top-tier writing, coding, reasoning, and enormous context.",
    tutorial: [
      'Open console.anthropic.com and sign in (or create an account)',
      'Add billing: Settings → Billing → add a card (API is pay-as-you-go)',
      "Go to Settings → API Keys (console.anthropic.com/settings/keys)",
      "Click 'Create Key' and name it Toolz",
      'Copy the key (starts with sk-ant-...) and paste it here',
    ],
  },

  // ── DeepSeek (OpenAI-compatible) ───────────────────────────────────
  {
    id: 'deepseek',
    displayName: 'DeepSeek',
    chatCompletionUrl: 'https://api.deepseek.com/v1/chat/completions',
    modelsUrl: 'https://api.deepseek.com/v1/models',
    openAiCompatible: true,
    recommendedModel: 'deepseek-chat',
    fallbackModels: ['deepseek-chat', 'deepseek-reasoner'],
    models: [
      'deepseek-chat',
      'deepseek-reasoner',
      'deepseek-v4-flash',
      'deepseek-v4-pro',
      'deepseek-v4.1-flash',
    ],
    freeModels: [],
    retiredModels: {},
    visionSubstrings: ['vision', 'vl', 'v4-flash'],
    supportsFiles: false,
    filesSubstrings: null,
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    keyPrefix: 'sk-',
    description:
      'Powerful and extremely cost-efficient open-source models with top-tier math and coding. deepseek-chat is free to start.',
    tutorial: [
      'Open platform.deepseek.com and sign in (or create an account)',
      'Top up a small balance — usage is pay-per-use and very cheap',
      "Open 'API Keys' in the sidebar (platform.deepseek.com/api_keys)",
      "Click 'Create API Key' and name it Toolz",
      'Copy the key (starts with sk-...) and paste it here',
    ],
  },

  // ── OpenRouter (OpenAI-compatible hub, :free models cost $0) ───────
  {
    id: 'openrouter',
    displayName: 'OpenRouter',
    chatCompletionUrl: 'https://openrouter.ai/api/v1/chat/completions',
    modelsUrl: 'https://openrouter.ai/api/v1/models',
    openAiCompatible: true,
    recommendedModel: 'nvidia/nemotron-3-nano-30b-a3b:free',
    fallbackModels: [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'google/gemma-3-27b-it:free',
      'deepseek/deepseek-chat:free',
    ],
    models: [
      // Free (:free) models first — $0 on OpenRouter (Sep 2026)
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'nvidia/nemotron-3.5-lightning:free',
      'google/gemma-3-27b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'deepseek/deepseek-chat:free',
      'dots-studio/dots-3-note-preview:free',
      'liquid/lfm-2.5-2.6b:free',
      // Paid / pay-as-you-go fallbacks
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'anthropic/claude-sonnet-5',
      'anthropic/claude-fable-5',
      'anthropic/claude-opus-4-8',
      'openai/gpt-5.6-sol',
      'openai/gpt-5.6-terra',
      'openai/gpt-5.6-luna',
      'openai/gpt-5.4-mini',
      'google/gemini-3.5-flash',
      'google/gemini-3.1-pro',
      'deepseek/deepseek-v4-pro',
      'deepseek/deepseek-v4-flash',
      'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
    ],
    freeModels: [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'nvidia/nemotron-3.5-lightning:free',
      'google/gemma-3-27b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'deepseek/deepseek-chat:free',
      'dots-studio/dots-3-note-preview:free',
      'liquid/lfm-2.5-2.6b:free',
    ],
    retiredModels: {},
    visionSubstrings: ['vision', 'vl', 'gemini', 'claude', 'gpt-5', 'gpt-4', 'qwen', 'gemma', 'nemotron'],
    supportsFiles: true,
    filesSubstrings: ['claude', 'gemini', 'gpt-5', 'gpt-4'],
    keyPlaceholder: 'sk-or-...',
    keyUrl: 'https://openrouter.ai/keys',
    keyPrefix: 'sk-or-',
    description:
      'A universal API hub that gives you a single place to access almost any model. Models ending in :free cost $0.',
    tutorial: [
      'Open openrouter.ai and sign in (Google or GitHub works)',
      'Optional: add credits for paid models — models ending in :free work with zero balance',
      "Open Keys (openrouter.ai/keys)",
      "Click 'Create Key' and name it Toolz",
      'Copy the key (starts with sk-or-...) and paste it here',
    ],
  },

  // ── OpenCode Zen (OpenAI-compatible gateway, several $0 models) ────
  // Docs: https://opencode.ai/docs/zen — live list at /zen/v1/models.
  // Free models are rate-limited promos; keep `freeModels` in sync.
  {
    id: 'opencode-zen',
    displayName: 'OpenCode Zen',
    chatCompletionUrl: 'https://opencode.ai/zen/v1/chat/completions',
    modelsUrl: 'https://opencode.ai/zen/v1/models',
    openAiCompatible: true,
    recommendedModel: 'muse-spark-1.3-contributor-free',
    fallbackModels: [
      'muse-spark-1.3-contributor-free',
      'mimo-v2.5-free',
      'big-pickle',
      'deepseek-v4-flash',
    ],
    models: [
      // FREE (pay-as-you-go $0) — live /v1/models Sep 2026
      'muse-spark-1.3-contributor-free',
      'muse-spark-1.2-contributor-free',
      'mimo-v2.5-free',
      'big-pickle',
      'ling-3.0-flash-fin-free',
      'nemotron-3-ultra-free',
      'nemotron-3.5-lightning-free',
      'deepseek-v4-flash-free',
      // Cheap + strong open coding models (chat/completions compatible)
      'deepseek-v4-flash',
      'deepseek-v4-pro',
      'glm-5.3-flash',
      'glm-5.3',
      'glm-5.2',
      'glm-5.1',
      'kimi-k2.6',
      'kimi-k2.7-code',
      'kimi-k3',
      'qwen3.6-plus',
      'qwen3.7-plus',
      'minimax-m3',
      'minimax-m2.7',
      'gpt-5.6-luna',
      'gemini-3.5-flash',
      'gemini-3-flash',
      'claude-sonnet-5',
      'claude-haiku-4-5',
      'grok-4.5',
      'muse-spark-1.3',
    ],
    freeModels: [
      'muse-spark-1.3-contributor-free',
      'muse-spark-1.2-contributor-free',
      'mimo-v2.5-free',
      'big-pickle',
      'ling-3.0-flash-fin-free',
      'nemotron-3-ultra-free',
      'nemotron-3.5-lightning-free',
      'deepseek-v4-flash-free',
    ],
    retiredModels: {},
    visionSubstrings: [
      'vision', 'vl', 'claude', 'gemini', 'gpt', 'grok', 'kimi',
      'qwen', 'glm', 'minimax', 'muse-spark', 'deepseek-v4-flash',
    ],
    supportsFiles: true, // gateway accepts attachments; model may ignore
    filesSubstrings: null,
    keyPlaceholder: 'Paste key from opencode.ai/auth',
    keyUrl: 'https://opencode.ai/auth',
    keyPrefix: null,
    description:
      'Curated gateway by the OpenCode team (opencode.ai/zen). Pay-as-you-go + several FREE models (Big Pickle, MiMo-V2.5 Free, Muse Spark Contributor Free). OpenAI-compatible: https://opencode.ai/zen/v1/chat/completions',
    tutorial: [
      'Open opencode.ai/auth and sign in',
      'Add billing details / buy credits (pay-as-you-go; the FREE models cost $0)',
      'Copy your API key from the dashboard and paste it here',
      'Pick a FREE model to start: muse-spark-1.3-contributor-free, mimo-v2.5-free or big-pickle',
      'Track usage in the same dashboard; enable balance fallback to keep going past Go limits',
    ],
  },

  // ── OpenCode Go (OpenAI-compatible, $10/mo subscription) ───────────
  // Docs: https://opencode.ai/docs/go — chat/completions-compatible subset.
  {
    id: 'opencode-go',
    displayName: 'OpenCode Go',
    chatCompletionUrl: 'https://opencode.ai/zen/go/v1/chat/completions',
    modelsUrl: 'https://opencode.ai/zen/go/v1/models',
    openAiCompatible: true,
    recommendedModel: 'glm-5.3-flash',
    fallbackModels: ['glm-5.3-flash', 'deepseek-v4-flash', 'mimo-v2.5'],
    models: [
      'glm-5.3-flash',
      'glm-5.3',
      'glm-5.2',
      'glm-5.1',
      'kimi-k3',
      'kimi-k2.7-code',
      'kimi-k2.6',
      'longcat-2.0',
      'deepseek-v4.1-flash',
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'deepseek-v4-flash-vision-exp',
      'mimo-v2.5',
      'mimo-v2.5-pro',
      'minimax-m3',
      'minimax-m2.7',
      'muse-spark-1.3-contributor',
      'muse-spark-1.2-contributor',
      'qwen3.8-max',
      'qwen3.8-flash',
      'qwen3.7-max',
      'qwen3.7-plus',
      'qwen3.6-plus',
      'hy3',
      'hy4-preview',
      'grok-4.6',
      'gpt-5.6-luna',
    ],
    freeModels: [],
    retiredModels: {},
    visionSubstrings: [
      'vision', 'vl', 'glm', 'kimi', 'qwen',
      'deepseek-v4-flash', 'mimo', 'muse-spark',
    ],
    supportsFiles: true, // gateway accepts attachments; model may ignore
    filesSubstrings: null,
    keyPlaceholder: 'Paste key from opencode.ai/auth',
    keyUrl: 'https://opencode.ai/auth',
    keyPrefix: null,
    description:
      'Low-cost $10/mo subscription for reliable open coding models (GLM, Kimi, DeepSeek V4, Qwen, Muse Spark). OpenAI-compatible: https://opencode.ai/zen/go/v1/chat/completions',
    tutorial: [
      'Open opencode.ai/auth and sign in',
      'Subscribe to OpenCode Go ($10/month) — one subscription per workspace',
      'Copy your Go API key from the dashboard and paste it here',
      'Pick a Go model (e.g. glm-5.3-flash) and chat',
      'Watch the 5-hour / weekly / monthly usage meters in the console so caps never surprise you',
    ],
  },
];

const DISCLAIMER_TEXT =
  'Higher-tier models are smarter but consume more tokens. Flash, Haiku, and Mini models are usually best for everyday mobile use.';

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
