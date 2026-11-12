import { WifiOff, Lock, Terminal, LayoutGrid, Github, Shield } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/landing/SectionHeader";
import { totalTools } from "@/lib/tools-catalog";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES } from "@/components/expressive/shapes";

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

type ToneKey = keyof typeof toneStyles;

interface Principle {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  desc: string;
  tone: ToneKey;
}

const principles: Principle[] = [
  {
    icon: WifiOff,
    title: "Offline-first",
    desc: "Core tools run fully on-device. Network features are labelled as such. A full offline mode cuts them all.",
    tone: "primary",
  },
  {
    icon: Lock,
    title: "Encrypted vaults",
    desc: "Passwords and notes live in SQLCipher-encrypted storage with biometric unlock. No ads, no tracking, no telemetry.",
    tone: "secondary",
  },
  {
    icon: LayoutGrid,
    title: "Part of the OS",
    desc: "Quick Settings tiles, homescreen widgets, and autofill put tools where Android already is.",
    tone: "neutral",
  },
  {
    icon: Terminal,
    title: "Open & auditable",
    desc: "Kotlin and Compose, GPLv3 licensed. One APK for Android 12+ instead of dozens of single-purpose apps.",
    tone: "tertiary",
  },
  {
    icon: Github,
    title: "No fine print",
    desc: "Free, GPLv3, Android 12+. No accounts, no ads, no trackers. Source code is 100% public on GitHub.",
    tone: "neutral",
  },
  {
    icon: Shield,
    title: "Zero compromise",
    desc: `${totalTools} tools in one APK. Vault data never leaves your device.`,
    tone: "primary",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-16 md:py-24"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          chip="Principles"
          title="Privacy by default. Zero compromise."
          description={`An offline-first toolkit: ${totalTools} tools in one APK, vault data that never leaves your device.`}
        />

        {/* Bento grid top row: big card left, 2 stacked right */}
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr] mb-3">
          {/* Big card — Offline-first */}
          {(() => {
            const p = principles[0];
            const tone = toneStyles[p.tone];
            const Icon = p.icon;
            return (
              <motion.article
                key={p.title}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={PRESS_SPRING}
                className="flex flex-col justify-between gap-6 border p-6 md:p-8"
                style={{
                  borderRadius: SHAPES.bouncy,
                  background: tone.background,
                  borderColor: "hsl(var(--md-outline-variant) / 0.35)",
                  minHeight: 240,
                }}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-[16px]"
                  style={{ background: tone.icon, color: tone.color }}
                >
                  <Icon size={22} />
                </span>
                <div>
                  <h3
                    className="m3-display-small font-bold leading-tight"
                    style={{ color: tone.color }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="mt-3 m3-body-large max-w-lg leading-relaxed opacity-85"
                    style={{ color: tone.color }}
                  >
                    {p.desc}
                  </p>
                </div>
              </motion.article>
            );
          })()}

          {/* Right column — 2 stacked cards */}
          <div className="flex flex-col gap-3">
            {principles.slice(1, 3).map((p) => {
              const tone = toneStyles[p.tone];
              const Icon = p.icon;
              return (
                <motion.article
                  key={p.title}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={PRESS_SPRING}
                  className="flex flex-col justify-between gap-5 border p-6 flex-1"
                  style={{
                    borderRadius: SHAPES.pebble,
                    background: tone.background,
                    borderColor: "hsl(var(--md-outline-variant) / 0.35)",
                    minHeight: 160,
                  }}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-[12px]"
                    style={{ background: tone.icon, color: tone.color }}
                  >
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3
                      className="m3-title-large font-bold"
                      style={{ color: tone.color }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="mt-1.5 m3-body-small leading-relaxed opacity-85"
                      style={{ color: tone.color }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* Bottom row: 3 equal cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {principles.slice(3).map((p) => {
            const tone = toneStyles[p.tone];
            const Icon = p.icon;
            return (
              <motion.article
                key={p.title}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={PRESS_SPRING}
                className="flex flex-col justify-between gap-5 border p-6"
                style={{
                  borderRadius: SHAPES.medium,
                  background: tone.background,
                  borderColor: "hsl(var(--md-outline-variant) / 0.35)",
                  minHeight: 180,
                }}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-[12px]"
                  style={{ background: tone.icon, color: tone.color }}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <h3
                    className="m3-title-large font-bold"
                    style={{ color: tone.color }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="mt-1.5 m3-body-small leading-relaxed opacity-85"
                    style={{ color: tone.color }}
                  >
                    {p.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
