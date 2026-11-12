import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Clipboard,
  ExternalLink,
  Info,
  Instagram,
  Link2,
  Music2,
  ShieldCheck,
  Sparkles,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import SectionHeader from "@/components/landing/SectionHeader";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES } from "@/components/expressive/shapes";

const DOWNLOADZ_URL = "https://toolz-downloadz.vercel.app";
const YOUTUBE_RE = /(?:youtube\.com|youtu\.be)/i;

type PlatformKey = "tiktok" | "instagram" | "youtube";

const platforms = [
  { id: "tiktok" as PlatformKey, icon: Music2, label: "TikTok", placeholder: "https://www.tiktok.com/@creator/video/..." },
  { id: "instagram" as PlatformKey, icon: Instagram, label: "Instagram", placeholder: "https://www.instagram.com/reel/..." },
  { id: "youtube" as PlatformKey, icon: Youtube, label: "YouTube · In App", placeholder: "https://youtube.com/watch?v=..." },
];

const highlights = [
  {
    icon: Zap,
    title: "Direct extraction",
    desc: "Inspects public media posts to extract original video and audio CDN files without quality loss.",
  },
  {
    icon: ShieldCheck,
    title: "Private & tracker-free",
    desc: "Runs completely stateless without cookies, registrations, user telemetry, or server storage.",
  },
  {
    icon: ExternalLink,
    title: "Web companion",
    desc: "Companion web utility for quick downloads on desktop or browsers where the APK isn't installed.",
  },
];

const DownloadzSection = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("tiktok");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [showYoutubeNotice, setShowYoutubeNotice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePlatformClick = (p: PlatformKey) => {
    setSelectedPlatform(p);
    if (p === "youtube") {
      setShowYoutubeNotice(true);
    } else {
      setShowYoutubeNotice(false);
      inputRef.current?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError("");
        if (YOUTUBE_RE.test(text)) {
          setSelectedPlatform("youtube");
          setShowYoutubeNotice(true);
        } else if (text.includes("instagram.com")) {
          setSelectedPlatform("instagram");
          setShowYoutubeNotice(false);
        } else if (text.includes("tiktok.com")) {
          setSelectedPlatform("tiktok");
          setShowYoutubeNotice(false);
        }
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste a link first.");
      inputRef.current?.focus();
      return;
    }
    if (YOUTUBE_RE.test(trimmed)) {
      setError("YouTube restricts web downloaders. Use the Media Downloader in the Toolz Android app.");
      setShowYoutubeNotice(true);
      return;
    }
    setError("");
    window.open(
      `${DOWNLOADZ_URL}/?url=${encodeURIComponent(trimmed)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const currentPlaceholder = platforms.find((p) => p.id === selectedPlatform)?.placeholder ?? "Paste video or reel URL...";

  return (
    <section
      id="downloadz"
      className="scroll-mt-20 py-16 md:py-24"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <SectionHeader
            className="mb-0 max-w-2xl text-center"
            align="center"
            chip="Web Companion"
            title="Paste a link. Save the media."
            description="A lightweight web companion for downloading public TikTok and Instagram posts without installing the app. Zero setup, no sign-in required."
          />
        </div>

        {/* Main Interactive Station */}
        <div className="max-w-3xl mx-auto">
          <div
            className="overflow-hidden border p-6 sm:p-9 shadow-md transition-all"
            style={{
              borderRadius: SHAPES.extraLarge,
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.45)",
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-[16px] shadow-xs"
                  style={{
                    background: "hsl(var(--md-secondary-container))",
                    color: "hsl(var(--md-on-secondary-container))",
                  }}
                >
                  <Link2 size={22} />
                </span>
                <div>
                  <p className="m3-title-medium font-bold text-on-surface">
                    Toolz Downloadz
                  </p>
                  <p className="m3-label-small text-on-surface-variant">
                    Web Companion · toolz-downloadz.vercel.app
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
                <Sparkles size={13} />
                Instant Web Tool
              </span>
            </div>

            {/* Platform Selection Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="m3-label-small mr-1 font-semibold text-on-surface-variant">
                Platform:
              </span>
              {platforms.map(({ id, icon: Icon, label }) => {
                const isActive = selectedPlatform === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => handlePlatformClick(id)}
                    whileTap={{ scale: 0.94 }}
                    transition={PRESS_SPRING}
                    className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all"
                    style={{
                      background: isActive
                        ? "hsl(var(--md-secondary-container))"
                        : "hsl(var(--md-surface-container-high))",
                      borderColor: isActive
                        ? "transparent"
                        : "hsl(var(--md-outline-variant) / 0.4)",
                      color: isActive
                        ? "hsl(var(--md-on-secondary-container))"
                        : "hsl(var(--md-on-surface-variant))",
                      boxShadow: isActive ? "0 2px 8px hsl(var(--md-shadow) / 0.15)" : "none",
                    }}
                  >
                    <Icon size={14} style={{ color: isActive ? "hsl(var(--md-primary))" : "inherit" }} />
                    {label}
                  </motion.button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={submit} noValidate>
              <label
                htmlFor="downloadz-url"
                className="m3-label-medium mb-2.5 block font-semibold text-on-surface"
              >
                Post or reel link
              </label>

              <div
                className="flex items-center gap-2 rounded-[20px] border border-outline-variant/60 bg-surface-container-high p-1.5 pl-4 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 shadow-xs"
              >
                <Link2 size={19} className="shrink-0 text-on-surface-variant" />
                <input
                  ref={inputRef}
                  id="downloadz-url"
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                    if (YOUTUBE_RE.test(e.target.value)) {
                      setSelectedPlatform("youtube");
                      setShowYoutubeNotice(true);
                    }
                  }}
                  placeholder={currentPlaceholder}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "downloadz-error" : "downloadz-help"}
                  className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                />

                {url && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrl("");
                      setError("");
                    }}
                    aria-label="Clear input"
                    className="grid h-8 w-8 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-transform active:scale-90"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  aria-label="Paste from clipboard"
                  className="hidden sm:grid h-9 w-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-transform active:scale-90"
                >
                  <Clipboard size={16} />
                </button>

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
                  className="m3-body-small mt-2.5 font-medium"
                  style={{ color: "hsl(var(--md-error))" }}
                >
                  {error}
                </p>
              ) : (
                <p id="downloadz-help" className="m3-label-small mt-2.5 text-on-surface-variant">
                  Launches Toolz Downloadz web viewer with your media stream pre-loaded.
                </p>
              )}
            </form>

            {/* Smart YouTube / In-App Callout */}
            <AnimatePresence>
              {showYoutubeNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-start gap-3.5 rounded-[18px] border p-4.5"
                    style={{
                      background: "hsl(var(--md-secondary-container))",
                      borderColor: "hsl(var(--md-secondary) / 0.4)",
                      color: "hsl(var(--md-on-secondary-container))",
                    }}
                  >
                    <Info size={20} className="mt-0.5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="m3-title-small font-bold">
                        YouTube Extraction Runs Inside the App
                      </p>
                      <p className="m3-body-small mt-1 leading-relaxed opacity-90">
                        YouTube restricts browser-based downloaders. To download YouTube videos at full 1080p/4K
                        or extract MP3 audio directly, use the on-device Media Downloader inside the Toolz Android app.
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={onDownloadClick}
                          className="m3-btn-filled h-8 px-4 text-[12px] font-semibold"
                        >
                          Get Toolz APK
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowYoutubeNotice(false)}
                          className="text-[12px] font-semibold underline hover:no-underline opacity-80"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="my-7 h-px" style={{ background: "hsl(var(--md-outline-variant) / 0.3)" }} />

            {/* Feature Cards Grid */}
            <div className="grid gap-3.5 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col justify-between gap-3 rounded-[20px] border p-4"
                  style={{
                    background: "hsl(var(--md-surface-container-low))",
                    borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                  }}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-[12px]"
                    style={{
                      background: "hsl(var(--md-secondary-container))",
                      color: "hsl(var(--md-on-secondary-container))",
                    }}
                  >
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="m3-title-small font-bold text-on-surface">{title}</p>
                    <p className="m3-body-small mt-1 text-on-surface-variant leading-relaxed">{desc}</p>
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
