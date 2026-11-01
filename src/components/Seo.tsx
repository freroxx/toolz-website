import { useEffect } from "react";

export const SITE_URL = "https://toolz-app.vercel.app";
export const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  /** Set to true for admin/utility routes that must stay out of search results. */
  noindex?: boolean;
  type?: "website" | "article";
  image?: string;
  jsonLd?: JsonLd;
}

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean}`;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Small, dependency-free head manager for the SPA.
 *
 * Vercel rewrites every route to index.html, so route-specific metadata has to
 * be applied after hydration. Search engines that execute JavaScript (Google,
 * Bing) pick these up; the static tags in index.html remain the fallback.
 */
const Seo = ({
  title,
  description,
  path,
  noindex = false,
  type = "website",
  image = DEFAULT_IMAGE,
  jsonLd,
}: SeoProps) => {
  const json = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const url = absoluteUrl(path);

    document.title = title;
    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "Toolz");
    setMeta("property", "og:locale", "en_US");
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", "Toolz — one home for all your Android tools");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", "Toolz — one home for all your Android tools");

    setLink("canonical", url);

    let script: HTMLScriptElement | null = null;
    if (json) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "route-json-ld";
      script.text = json;
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
    };
  }, [title, description, path, noindex, type, image, json]);

  return null;
};

export default Seo;
