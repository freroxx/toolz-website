import { WifiOff, Lock, Terminal, LayoutGrid, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/landing/SectionHeader";
import { totalTools } from "@/lib/tools-catalog";

// Grounded in the Toolz README: offline-first (not offline-only), SQLCipher
// vaults, GPLv3, Android 12+, QS tiles / widgets / autofill.
const principles = [
  {
    icon: WifiOff,
    title: "Offline-first",
    desc: "Core tools run fully on-device. Network features (assistant, web search, catalog, updates) are labelled as such, and a full offline mode cuts them all.",
    tone: "primary",
  },
  {
    icon: Lock,
    title: "Encrypted by default",
    desc: "Passwords, notes and notifications live in SQLCipher-encrypted storage with biometric unlock. No ads, no tracking.",
    tone: "secondary",
  },
  {
    icon: Terminal,
    title: "Auditable",
    desc: "Kotlin and Compose, GPLv3 licensed. One APK for Android 12 and up instead of dozens of single-purpose apps.",
    tone: "tertiary",
  },
  {
    icon: LayoutGrid,
    title: "Part of the OS",
    desc: "Quick Settings tiles, homescreen widgets and autofill put tools where Android already is.",
    tone: "neutral",
  },
] as const;

// From the README's Quick Start tips.
const steps = [
  {
    num: "01",
    label: "Pin your favorites",
    sub: "Long-press tools on the dashboard to keep them front and center.",
  },
  {
    num: "02",
    label: "Search in plain words",
    sub: "Describe what you want; Smart Search opens the right tool.",
  },
  {
    num: "03",
    label: "Lock the vault",
    sub: "Set up the password vault with biometric unlock for autofill.",
  },
  {
    num: "04",
    label: "Back up your data",
    sub: "Export notes, passwords and settings so nothing is lost.",
  },
];

const toneStyles = {
  primary: {
    background: "hsl(var(--md-primary-container))",
    color: "hsl(var(--md-on-primary-container))",
    icon: "hsl(var(--md-primary) / 0.18)",
  },
  secondary: {
    background: "hsl(var(--md-secondary-container))",
    color: "hsl(var(--md-on-secondary-container))",
    icon: "hsl(var(--md-secondary) / 0.18)",
  },
  tertiary: {
    background: "hsl(var(--md-tertiary-container))",
    color: "hsl(var(--md-on-tertiary-container))",
    icon: "hsl(var(--md-tertiary) / 0.18)",
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
          description={`An offline-first toolkit: ${totalTools} tools in one APK, with vault data that never leaves your device.`}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => {
            const tone = toneStyles[p.tone];
            const Icon = p.icon;
            const large = i === 0;
            return (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 200,
                  damping: 26,
                }}
                className={`flex flex-col justify-between gap-6 rounded-[28px] p-6 md:rounded-[32px] md:p-7 ${
                  large ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
                style={{ background: tone.background, minHeight: large ? 236 : 200 }}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-[16px]"
                  style={{ background: tone.icon, color: tone.color }}
                >
                  <Icon size={22} />
                </span>
                <div>
                  <h3
                    className={
                      large
                        ? "m3-display-small leading-tight"
                        : "m3-title-large"
                    }
                    style={{ color: tone.color }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`mt-2 leading-relaxed opacity-80 ${
                      large ? "m3-body-large max-w-lg" : "m3-body-small"
                    }`}
                    style={{ color: tone.color }}
                  >
                    {p.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}

          {/* Filling the bento: a compact facts tile */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.28, type: "spring", stiffness: 200, damping: 26 }}
            className="flex flex-col justify-between gap-6 rounded-[28px] p-6 md:rounded-[32px] md:p-7"
            style={{ background: "hsl(var(--md-surface-container))", minHeight: 200 }}
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-[16px]"
              style={{
                background: "hsl(var(--md-surface-container-highest))",
                color: "hsl(var(--md-primary-ink))",
              }}
            >
              <Sparkles size={22} />
            </span>
            <div>
              <h3 className="m3-title-large text-on-surface">No fine print</h3>
              <p className="m3-body-small mt-2 text-on-surface-variant">
                Free, GPLv3, Android 12+, no account and no ads. The source is
                public, so you can check every claim.
              </p>
            </div>
          </motion.article>
        </div>

        {/* Getting started */}
        <div className="mt-10 md:mt-14">
          <h3 className="m3-headline-small text-on-surface">Start in minutes</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 26 }}
                className="rounded-[22px] p-5"
                style={{ background: "hsl(var(--md-surface-container))" }}
              >
                <span className="m3-label-large tabular-nums text-primary-ink">
                  {step.num}
                </span>
                <p className="m3-title-small mt-2 text-on-surface">{step.label}</p>
                <p className="m3-body-small mt-1 text-on-surface-variant">
                  {step.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
