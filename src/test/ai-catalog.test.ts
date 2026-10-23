import { describe, expect, it } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler, { buildCatalog } from "../../api/models";

const catalog = buildCatalog();
const providers = catalog.providers;

/** Minimal VercelResponse double — enough to observe headers + payload. */
function createResponseDouble() {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let payload: unknown;
  let ended = false;

  const res = {
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: unknown) {
      payload = body;
      return res;
    },
    end() {
      ended = true;
      return res;
    },
  } as unknown as VercelResponse;

  return {
    res,
    headers,
    getStatus: () => statusCode,
    getPayload: () => payload,
    isEnded: () => ended,
  };
}

const request = (method: string) => ({ method }) as unknown as VercelRequest;

describe("AI catalog payload", () => {
  it("reports the bumped version and update date", () => {
    expect(catalog.version).toBe(3);
    expect(catalog.updatedAt).toBe("2026-10-23");
  });

  it("ships at least 12 providers with unique ids and display names", () => {
    expect(providers.length).toBeGreaterThanOrEqual(12);
    const ids = providers.map((p) => p.id);
    const names = providers.map((p) => p.displayName);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe.each(providers.map((p) => [p.id, p] as const))("provider %s", (id, provider) => {
  it("has a non-empty picker list without duplicates", () => {
    expect(provider.models.length).toBeGreaterThan(0);
    expect(new Set(provider.models).size).toBe(provider.models.length);
  });

  it("keeps modelDetails in exact 1:1 order with models", () => {
    expect(provider.modelDetails.map((detail) => detail.id)).toEqual(provider.models);
  });

  it("has a live recommended model and fallbacks inside the catalog", () => {
    expect(provider.models).toContain(provider.recommendedModel);
    expect(provider.fallbackModels.length).toBeGreaterThanOrEqual(2);
    expect(provider.fallbackModels.length).toBeLessThanOrEqual(4);
    for (const fallback of provider.fallbackModels) {
      const reachable =
        provider.models.includes(fallback) ||
        Object.values(provider.retiredModels).includes(fallback);
      expect(reachable, `${id}: fallback ${fallback}`).toBe(true);
    }
  });

  it("never lists a retired model id as live", () => {
    for (const retiredId of Object.keys(provider.retiredModels)) {
      expect(provider.models, `${id}: retired ${retiredId}`).not.toContain(retiredId);
    }
  });

  it("derives freeModels exactly from modelDetails free flags", () => {
    const flagged = provider.modelDetails.filter((detail) => detail.free).map((detail) => detail.id);
    expect(provider.freeModels).toEqual(flagged);
    for (const freeId of provider.freeModels) {
      expect(provider.models).toContain(freeId);
    }
  });

  it("has complete provider metadata", () => {
    expect(provider.displayName.trim().length).toBeGreaterThan(0);
    expect(provider.description.trim().length).toBeGreaterThan(0);
    expect(provider.freeTierNotes.trim().length).toBeGreaterThan(0);
    expect(provider.docsUrl.startsWith("https://")).toBe(true);
    expect(provider.keyUrl.startsWith("https://")).toBe(true);
    expect(provider.tutorial.length).toBeGreaterThanOrEqual(4);
    expect(provider.tutorial.length).toBeLessThanOrEqual(6);
    for (const step of provider.tutorial) {
      expect(step.trim().length).toBeGreaterThan(0);
    }
    for (const substring of provider.visionSubstrings) {
      // "" is only valid as the single provider-wide wildcard (Gemini/Claude/
      // ChatGPT list only vision-capable models).
      if (substring.length === 0) {
        expect(provider.visionSubstrings).toEqual([""]);
      }
    }
    if (provider.filesSubstrings) {
      for (const substring of provider.filesSubstrings) {
        expect(substring.length).toBeGreaterThan(0);
      }
    }
  });

  it("uses the supported transport", () => {
    if (id === "gemini" || id === "claude") {
      expect(provider.chatCompletionUrl).toBeNull();
      expect(provider.openAiCompatible).toBe(false);
    } else {
      expect(provider.openAiCompatible).toBe(true);
      expect(provider.chatCompletionUrl?.startsWith("https://")).toBe(true);
    }
    if (provider.modelsUrl !== null) {
      expect(provider.modelsUrl.startsWith("https://")).toBe(true);
    }
    if (provider.keyPrefix !== null) {
      expect(provider.keyPlaceholder.toLowerCase().startsWith(provider.keyPrefix.toLowerCase())).toBe(true);
    }
  });

  it("has valid per-model metadata", () => {
    for (const detail of provider.modelDetails) {
      expect(detail.label.trim().length, `${id}/${detail.id} label`).toBeGreaterThan(0);
      if (detail.tagline !== undefined) {
        expect(detail.tagline.length, `${id}/${detail.id} tagline`).toBeLessThanOrEqual(60);
        expect(detail.tagline.trim().length).toBeGreaterThan(0);
      }
      if (detail.speed !== undefined) {
        expect(["fast", "balanced", "deep"]).toContain(detail.speed);
      }
      for (const price of [detail.inputPrice, detail.outputPrice]) {
        if (price !== undefined) expect(price).toBeGreaterThanOrEqual(0);
      }
      for (const limit of [detail.contextTokens, detail.maxOutputTokens]) {
        if (limit !== undefined) expect(limit).toBeGreaterThan(0);
      }
    }
  });
});

describe("provider-specific sanity checks", () => {
  it("Gemini's free list matches its free-tier text models", () => {
    const gemini = providers.find((p) => p.id === "gemini");
    expect(gemini).toBeDefined();
    expect(gemini?.freeModels).toContain("gemini-3.5-flash-lite");
    expect(gemini?.freeModels).toContain("gemini-3.8-flash");
    expect(gemini?.freeModels).not.toContain("gemini-4-argon");
    expect(gemini?.freeModels).not.toContain("gemini-3.1-pro-preview");
  });

  it("Groq excludes retired Llama/Compound ids and keeps a free GPT-OSS default", () => {
    const groq = providers.find((p) => p.id === "groq");
    expect(groq).toBeDefined();
    expect(groq?.models).not.toContain("llama-3.3-70b-versatile");
    expect(groq?.models).not.toContain("groq/compound");
    expect(groq?.retiredModels["llama-3.3-70b-versatile"]).toBeDefined();
    expect(groq?.retiredModels["groq/compound"]).toBeDefined();
    expect(groq?.freeModels).toContain("openai/gpt-oss-20b");
    expect(groq?.recommendedModel).toBe("openai/gpt-oss-20b");
  });

  it("OpenRouter only marks real :free variants as free", () => {
    const openrouter = providers.find((p) => p.id === "openrouter");
    expect(openrouter).toBeDefined();
    expect(openrouter?.freeModels.length).toBeGreaterThanOrEqual(5);
    for (const id of openrouter?.freeModels ?? []) {
      expect(id.endsWith(":free")).toBe(true);
    }
  });

  it("OpenCode providers use the current Console inference paths", () => {
    const consoleProvider = providers.find((p) => p.id === "opencode-zen");
    const goProvider = providers.find((p) => p.id === "opencode-go");
    expect(consoleProvider?.chatCompletionUrl).toBe(
      "https://opencode.ai/inference/openai/v1/chat/completions",
    );
    expect(goProvider?.chatCompletionUrl).toBe(
      "https://opencode.ai/inference/go/openai/v1/chat/completions",
    );
  });
});

describe("GET /api/models handler", () => {
  it("returns CORS + cache headers and the catalog payload", async () => {
    const fake = createResponseDouble();
    await handler(request("GET"), fake.res);
    expect(fake.getStatus()).toBe(200);
    expect(fake.headers["access-control-allow-origin"]).toBe("*");
    expect(fake.headers["access-control-allow-methods"]).toBe("GET, OPTIONS");
    expect(fake.headers["cache-control"]).toBe("public, max-age=3600");
    const payload = fake.getPayload() as { version: number; providers: unknown[] };
    expect(payload.version).toBe(3);
    expect(payload.providers.length).toBe(providers.length);
  });

  it("answers OPTIONS with 200 and no body", async () => {
    const fake = createResponseDouble();
    await handler(request("OPTIONS"), fake.res);
    expect(fake.getStatus()).toBe(200);
    expect(fake.isEnded()).toBe(true);
  });

  it("rejects non-GET methods with 405", async () => {
    const fake = createResponseDouble();
    await handler(request("POST"), fake.res);
    expect(fake.getStatus()).toBe(405);
    expect(fake.getPayload()).toEqual({ error: "Method Not Allowed" });
  });
});
