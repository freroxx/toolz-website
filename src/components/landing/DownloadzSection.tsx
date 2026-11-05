import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Info,
  Instagram,
  Link2,
  Music2,
  ShieldCheck,
  Sparkles,
  Youtube,
  Zap,
} from "lucide-react";
import SectionHeader from "@/components/landing/SectionHeader";
import { PRESS_SPRING } from "@/lib/motion";

const DOWNLOADZ_URL = "https://toolz-downloadz.vercel.app";
const YOUTUBE_RE = /(?:youtube\.com|youtu\.be)/i;

const platforms = [
  { icon: Music2, label: "TikTok" },
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube · in app" },
];

const highlights = [
  {
    icon: Zap,
    title: "Direct extraction",
    desc: "Inspects public media posts and provides direct links to original video and audio files.",
  },
  {
    icon: ShieldCheck,
    title: "Private & tracker-free",
    desc: "Runs completely stateless without cookies, registrations, or user telemetry.",
  },
];

const DownloadzSection = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a TikTok or Instagram link first.");
      inputRef.current?.focus();
      return;
    }
    if (YOUTUBE_RE.test(trimmed)) {
      setError("YouTube blocks web downloaders. Use Media Downloader in the Toolz app instead.");
      return;
    }
    setError("");
    window.open(
      `${DOWNLOADZ_URL}/?url=${encodeURIComponent(trimmed)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section id="downloadz" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* ── Left Column: Editorial Info ── */}
          <div>
            <SectionHeader
              className="mb-6 md:mb-8"
              chip="Web Companion"
              title={
                <>
                  Paste a link.
                  <br />
                  <span style={{ color: "hsl(var(--md-primary))" }}>Save the media.</span>
                </>
              }
              description="A lightweight web companion for downloading public TikTok and Instagram posts without installing the app. Zero setup, no sign-in required."
            />

            <div className="flex flex-wrap gap-2">
              {platforms.map(({ icon: Icon, label }) => (
                <span key={label} className="m3-chip gap-2">
                  <Icon size={15} style={{ color: "hsl(var(--md-primary))" }} />
                  {label}
                </span>
              ))}
            </div>

            <div
              className="mt-6 flex items-start gap-3 rounded-[16px] border p-4"
              style={{
                background: "hsl(var(--md-surface-container))",
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              }}
            >
              <Info
                size={18}
                className="mt-0.5 shrink-0"
                style={{ color: "hsl(var(--md-primary-ink))" }}
              />
              <p className="m3-body-small text-on-surface-variant">
                YouTube restricts browser-based downloaders. To download YouTube videos and audio at full quality,
                use the on-device Media Downloader inside the Toolz Android app.{" "}
                <button
                  type="button"
                  onClick={onDownloadClick}
                  className="font-semibold underline hover:no-underline"
                  style={{ color: "hsl(var(--md-primary-ink))" }}
                >
                  Get the APK
                </button>
                .
              </p>
            </div>
          </div>

          {/* ── Right Column: Interactive URL Tool Card ── */}
          <div
            className="overflow-hidden rounded-[24px] border p-6 sm:p-8 shadow-xs"
            style={{
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-[12px]"
                  style={{
                    background: "hsl(var(--md-secondary-container))",
                    color: "hsl(var(--md-on-secondary-container))",
                  }}
                >
                  <Link2 size={20} />
                </span>
                <div>
                  <p className="m3-title-medium font-bold leading-tight text-on-surface">
                    Toolz Downloadz
                  </p>
                  <p className="m3-label-small text-on-surface-variant">
                    Web utility · toolz-downloadz.vercel.app
                  </p>
                </div>
              </div>
              <span
                className="m3-label-small inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
                style={{
                  background: "hsl(var(--md-secondary-container))",
                  color: "hsl(var(--md-on-secondary-container))",
                }}
              >
                <Sparkles size={12} />
                Instant
              </span>
            </div>

            <form onSubmit={submit} className="mt-6" noValidate>
              <label
                htmlFor="downloadz-url"
                className="m3-label-medium mb-2 block font-semibold text-on-surface"
              >
                Post or reel link
              </label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  ref={inputRef}
                  id="downloadz-url"
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="https://www.tiktok.com/@…/video/…"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "downloadz-error" : "downloadz-help"}
                  className="m3-body-medium min-w-0 flex-1 rounded-full border border-outline-variant/60 px-5 py-3 text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/25"
                  style={{ background: "hsl(var(--md-surface-container-high))" }}
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -1 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled shrink-0 gap-2 px-6 py-3 font-semibold shadow-xs"
                >
                  Open
                  <ArrowUpRight size={17} />
                </motion.button>
              </div>
              {error ? (
                <p
                  id="downloadz-error"
                  role="alert"
                  className="m3-body-small mt-2.5"
                  style={{ color: "hsl(var(--md-error))" }}
                >
                  {error}
                </p>
              ) : (
                <p
                  id="downloadz-help"
                  className="m3-label-small mt-2.5 text-on-surface-variant"
                >
                  Launches Downloadz with your link pre-loaded.
                </p>
              )}
            </form>

            <div
              className="my-6 h-px"
              style={{ background: "hsl(var(--md-outline-variant) / 0.3)" }}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-[16px] border p-3.5"
                  style={{
                    background: "hsl(var(--md-surface-container-low))",
                    borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                  }}
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px]"
                    style={{
                      background: "hsl(var(--md-secondary-container))",
                      color: "hsl(var(--md-on-secondary-container))",
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="m3-title-small text-on-surface">{title}</p>
                    <p className="m3-body-small mt-0.5 text-on-surface-variant leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadzSection;
