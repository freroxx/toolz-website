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
  { id: "youtube" as PlatformKey, icon: Youtube, label: "YouTube · In app", placeholder: "https://youtube.com/watch?v=..." },
];

const highlights = [
  {
    icon: Zap,
    title: "Direct extraction",
    desc: "Fetches the original video and audio files from public posts, without re-encoding.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    desc: "No cookies, no sign-up, no telemetry and no server-side storage.",
  },
  {
    icon: ExternalLink,
    title: "Works in any browser",
    desc: "Handy on desktop or anywhere the APK isn't installed.",
  },
];

const DownloadzSection = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("tiktok");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [showYoutubeNotice, setShowYoutubeNotice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detectPlatform = (text: string) => {
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
  };

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
        detectPlatform(text);
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

  const currentPlaceholder =
    platforms.find((p) => p.id === selectedPlatform)?.placeholder ?? "Paste video or reel URL...";

  return (
    <section
      id="downloadz"
      className="scroll-mt-20 py-20 md:py-28"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          align="center"
          chip="Web companion"
          title="Paste a link. Save the media."
          description="Download public TikTok and Instagram posts from your browser. No install, no sign-in."
        />

        <div className="mx-auto max-w-3xl">
          <div
            className="border p-6 sm:p-9"
            style={{
              borderRadius: SHAPES.extraLarge,
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
          >
            {/* Platform chips */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Platform">
              {platforms.map(({ id, icon: Icon, label }) => {
                const isActive = selectedPlatform === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => handlePlatformClick(id)}
                    whileTap={{ scale: 0.95 }}
                    transition={PRESS_SPRING}
                    aria-pressed={isActive}
                    className="m3-label-large inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold transition-colors"
                    style={{
                      background: isActive
                        ? "hsl(var(--md-secondary-container))"
                        : "transparent",
                      borderColor: isActive ? "transparent" : "hsl(var(--md-outline-variant))",
                      color: isActive
                        ? "hsl(var(--md-on-secondary-container))"
                        : "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </motion.button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={submit} noValidate className="mt-6">
              <label
                htmlFor="downloadz-url"
                className="m3-label-large mb-2 block font-semibold text-on-surface"
              >
                Post or reel link
              </label>

              <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-container-high p-1.5 pl-5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
                <Link2 size={18} className="shrink-0 text-on-surface-variant" />
                <input
                  ref={inputRef}
                  id="downloadz-url"
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                    if (YOUTUBE_RE.test(e.target.value)) detectPlatform(e.target.value);
                  }}
                  placeholder={currentPlaceholder}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "downloadz-error" : "downloadz-help"}
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
                />

                {url && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrl("");
                      setError("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear input"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  aria-label="Paste from clipboard"
                  className="hidden h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest sm:grid"
                >
                  <Clipboard size={16} />
                </button>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.96 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled shrink-0 gap-2 px-6 py-3 font-semibold"
                >
                  Open
                  <ArrowUpRight size={17} />
                </motion.button>
              </div>

              {error ? (
                <p
                  id="downloadz-error"
                  role="alert"
                  className="m3-body-small mt-2.5 px-2 font-medium"
                  style={{ color: "hsl(var(--md-error))" }}
                >
                  {error}
                </p>
              ) : (
                <p id="downloadz-help" className="m3-body-small mt-2.5 px-2 text-on-surface-variant">
                  Opens Toolz Downloadz with your link pre-filled.
                </p>
              )}
            </form>

            {/* YouTube notice */}
            <AnimatePresence initial={false}>
              {showYoutubeNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-start gap-3.5 rounded-[20px] p-5"
                    style={{
                      background: "hsl(var(--md-secondary-container))",
                      color: "hsl(var(--md-on-secondary-container))",
                    }}
                    role="note"
                  >
                    <Info size={20} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="m3-title-small font-bold">YouTube downloads run in the app</p>
                      <p className="m3-body-small mt-1 leading-relaxed opacity-90">
                        YouTube blocks browser-based downloaders. Use the on-device Media Downloader in
                        the Toolz Android app for up to 1080p/4K video or MP3 audio.
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={onDownloadClick}
                          className="m3-btn-filled h-9 px-5 text-[13px] font-semibold"
                        >
                          Get the app
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowYoutubeNotice(false)}
                          className="m3-label-large font-semibold underline-offset-2 hover:underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Highlights */}
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex flex-col gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-[14px]"
                  style={{
                    background: "hsl(var(--md-secondary-container))",
                    color: "hsl(var(--md-on-secondary-container))",
                  }}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className="m3-title-small font-bold text-on-surface">{title}</p>
                  <p className="m3-body-small mt-1 leading-relaxed text-on-surface-variant">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DownloadzSection;
