import { WifiOff, Lock, Terminal, LayoutGrid, Github, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/landing/SectionHeader";
import { totalTools } from "@/lib/tools-catalog";
import { PRESS_SPRING } from "@/lib/motion";

// Grounded in the Toolz README: offline-first, SQLCipher vaults, GPLv3,
// Android 12+, QS tiles / widgets / autofill, ONNX/Tesseract local engines.
const principles = [
  {
    icon: WifiOff,
    title: "Offline-first",
    desc: "Core tools run fully on-device. Network features (AI assistant, web search, catalog, updates) are labelled as such. A full offline mode cuts them all.",
    tone: "primary",
    large: true,
  },
  {
    icon: Lock,
    title: "Encrypted vaults",
    desc: "Passwords and notes live in SQLCipher-encrypted storage with biometric unlock. No ads, no tracking, no telemetry.",
    tone: "secondary",
    large: false,
  },
  {
    icon: LayoutGrid,
    title: "Part of the OS",
    desc: "Quick Settings tiles, homescreen widgets, and autofill put tools where Android already is.",
    tone: "neutral",
    large: false,
  },
  {
    icon: Terminal,
    title: "Open & auditable",
    desc: "Kotlin and Compose, GPLv3 licensed. One APK for Android 12+ instead of dozens of single-purpose apps.",
    tone: "tertiary",
    large: false,
  },
] as const;

const toneStyles = {
  primary: {
    background: "hsl(var(--md-primary-container))",
    color: "hsl(var(--md-on-primary-container))",
    icon: "hsl(var(--md-primary) / 0.20)",
  },
  secondary: {
    background: "hsl(var(--md-secondary-container))",
    color: "hsl(var(--md-on-secondary-container))",
    icon: "hsl(var(--md-secondary) / 0.20)",
  },
  tertiary: {
    background: "hsl(var(--md-tertiary-container))",
    color: "hsl(var(--md-on-tertiary-container))",
    icon: "hsl(var(--md-tertiary) / 0.20)",
  },
  neutral: {
    background: "hsl(var(--md-surface-container))",
    color: "hsl(var(--md-on-surface))",
    icon: "hsl(var(--md-surface-container-highest))",
  },
} as const;

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-16 md:py-24"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          chip="Principles"
          title="Built to stay on your phone."
          description={`An offline-first toolkit: ${totalTools} tools in one APK, vault data that never leaves your device.`}
        />

        {/* Principles grid — no rainbow stagger, unified surface hierarchy */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p) => {
            const tone = toneStyles[p.tone];
            const Icon = p.icon;
            return (
              <motion.article
                key={p.title}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={PRESS_SPRING}
                className={`flex flex-col justify-between gap-6 rounded-[20px] border p-6 md:p-7${
                  p.large ? " sm:col-span-2 lg:col-span-2" : ""
                }`}
                style={{
                  background: tone.background,
                  borderColor: "hsl(var(--md-outline-variant) / 0.35)",
                  minHeight: p.large ? 200 : 180,
                }}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-[14px]"
                  style={{ background: tone.icon, color: tone.color }}
                >
                  <Icon size={20} />
                </span>
                <div>
                  <h3
                    className={
                      p.large
                        ? "m3-display-small font-bold leading-tight"
                        : "m3-title-large font-bold"
                    }
                    style={{ color: tone.color }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`mt-2 leading-relaxed opacity-85 ${
                      p.large ? "m3-body-large max-w-lg" : "m3-body-small"
                    }`}
                    style={{ color: tone.color }}
                  >
                    {p.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}

          {/* GPLv3 fact — fills the grid slot cleanly */}
          <motion.article
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={PRESS_SPRING}
            className="flex flex-col justify-between gap-6 rounded-[20px] border p-6 md:p-7"
            style={{
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              minHeight: 180,
            }}
          >
            <span
              className="grid h-11 w-11 place-items-center rounded-[14px]"
              style={{
                background: "hsl(var(--md-surface-container-highest))",
                color: "hsl(var(--md-primary-ink))",
              }}
            >
              <Github size={20} />
            </span>
            <div>
              <h3 className="m3-title-large font-bold text-on-surface">No fine print</h3>
              <p className="m3-body-small mt-2 text-on-surface-variant leading-relaxed">
                Free, GPLv3, Android 12+. No accounts, no ads, no trackers. Source
                code is 100% public on GitHub.
              </p>
            </div>
          </motion.article>
        </div>

        {/* Community strip — replaces the generic numbered-step list */}
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-5 md:p-6"
          style={{
            background: "hsl(var(--md-surface-container))",
            borderColor: "hsl(var(--md-outline-variant) / 0.4)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-[12px]"
              style={{
                background: "hsl(var(--md-secondary-container))",
                color: "hsl(var(--md-on-secondary-container))",
              }}
            >
              <MessageSquare size={18} />
            </span>
            <div>
              <p className="m3-title-small font-bold text-on-surface">Get involved</p>
              <p className="m3-body-small text-on-surface-variant">
                Discord, GitHub issues, community skins — all welcome.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <motion.a
              href="https://discord.gg/aAswRUerwh"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              transition={PRESS_SPRING}
              className="m3-btn-tonal gap-2 px-5 py-2.5 text-sm"
            >
              <MessageSquare size={15} />
              Discord
            </motion.a>
            <motion.a
              href="https://github.com/freroxx/toolz"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              transition={PRESS_SPRING}
              className="m3-btn-outlined gap-2 px-5 py-2.5 text-sm"
            >
              <Github size={15} />
              GitHub
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
