import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Info,
  Instagram,
  Link2,
  Music2,
  ShieldCheck,
  Youtube,
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

const steps = [
  { n: "01", title: "Copy the post link", copy: "Use Share → Copy link in TikTok or Instagram." },
  { n: "02", title: "Paste it here", copy: "Downloadz reads the public post and lists the available files." },
  { n: "03", title: "Pick a quality", copy: "Choose video, audio-only or a photo, then save it." },
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
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          {/* ── Copy ── */}
          <div>
            <SectionHeader
              className="mb-6 md:mb-8"
              chip="Toolz Downloadz"
              title={
                <>
                  Paste a link.
                  <br />
                  <span className="text-primary-ink">Keep the video.</span>
                </>
              }
              description="A companion web tool for public TikTok and Instagram posts. It runs outside the app, needs no account, and hands you the file directly."
            />

            <div className="flex flex-wrap gap-2">
              {platforms.map(({ icon: Icon, label }) => (
                <span key={label} className="m3-chip gap-2">
                  <Icon size={15} className="text-primary-ink" />
                  {label}
                </span>
              ))}
            </div>

            <div
              className="mt-6 flex items-start gap-3 rounded-[20px] p-4"
              style={{ background: "hsl(var(--md-surface-container))" }}
            >
              <Info
                size={18}
                className="mt-0.5 shrink-0"
                style={{ color: "hsl(var(--md-primary-ink))" }}
              />
              <p className="m3-body-small text-on-surface-variant">
                YouTube links are rejected on the web — YouTube blocks web
                downloaders. The app&apos;s Media Downloader handles YouTube
                on-device instead.{" "}
                <button
                  type="button"
                  onClick={onDownloadClick}
                  className="font-semibold text-primary-ink hover:underline"
                >
                  Get the app
                </button>
                .
              </p>
            </div>
          </div>

          {/* ── Paste panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="overflow-hidden rounded-[28px] border p-6 sm:p-8"
            style={{
              background: "hsl(var(--md-tertiary-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-[14px]"
                  style={{ background: "hsl(var(--md-tertiary) / 0.18)" }}
                >
                  <Link2
                    size={20}
                    style={{ color: "hsl(var(--md-on-tertiary-container))" }}
                  />
                </span>
                <div>
                  <p
                    className="m3-title-medium font-bold leading-tight"
                    style={{ color: "hsl(var(--md-on-tertiary-container))" }}
                  >
                    Open Downloadz
                  </p>
                  <p
                    className="m3-label-small opacity-85"
                    style={{ color: "hsl(var(--md-on-tertiary-container))" }}
                  >
                    Web app · zero install
                  </p>
                </div>
              </div>
              <span
                className="m3-label-small inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
                style={{
                  background: "hsl(var(--md-tertiary) / 0.18)",
                  color: "hsl(var(--md-on-tertiary-container))",
                }}
              >
                <ShieldCheck size={13} />
                No account
              </span>
            </div>

            <form onSubmit={submit} className="mt-6" noValidate>
              <label
                htmlFor="downloadz-url"
                className="m3-label-medium mb-2 block font-semibold"
                style={{ color: "hsl(var(--md-on-tertiary-container))" }}
              >
                Public post link
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
                  className="m3-body-medium min-w-0 flex-1 rounded-full border border-outline-variant/60 px-5 py-3.5 text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-tertiary focus:ring-2 focus:ring-tertiary/30"
                  style={{
                    background: "hsl(var(--md-surface))",
                  }}
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -1 }}
                  transition={PRESS_SPRING}
                  className="m3-label-large inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold shadow-sm"
                  style={{
                    background: "hsl(var(--md-tertiary))",
                    color: "hsl(var(--md-on-tertiary))",
                  }}
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
                  className="m3-label-small mt-2.5 opacity-90"
                  style={{ color: "hsl(var(--md-on-tertiary-container))" }}
                >
                  Opens toolz-downloadz.vercel.app in a new tab with the link filled in.
                </p>
              )}
            </form>

            <div
              className="my-6 h-px"
              style={{ background: "hsl(var(--md-on-tertiary-container) / 0.15)" }}
            />

            <ol className="flex flex-col gap-3">
              {steps.map(({ n, title, copy }) => (
                <li key={n} className="flex items-start gap-3">
                  <span
                    className="m3-label-small mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full tabular-nums"
                    style={{
                      background: "hsl(var(--md-tertiary) / 0.16)",
                      color: "hsl(var(--md-on-tertiary-container))",
                    }}
                  >
                    {n}
                  </span>
                  <p
                    className="m3-body-small"
                    style={{ color: "hsl(var(--md-on-tertiary-container))" }}
                  >
                    <span className="m3-title-small">{title}.</span>{" "}
                    <span className="opacity-75">{copy}</span>
                  </p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DownloadzSection;
