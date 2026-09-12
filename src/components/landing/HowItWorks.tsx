import { WifiOff, Lock, Terminal, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

// Grounded in the Toolz README: offline-first (not offline-only), SQLCipher
// vaults, GPLv3, Android 12+, QS tiles / widgets / autofill.
const principles = [
  {
    icon: WifiOff,
    title: "Offline-first",
    desc: "Core tools run fully on-device. Network features (assistant, web search, catalog, updates) are labeled as such, and a full offline mode cuts them all.",
    color: "primary",
  },
  {
    icon: Lock,
    title: "Encrypted by default",
    desc: "Passwords, notes and notifications live in SQLCipher-encrypted storage with biometric unlock. No ads, no tracking.",
    color: "secondary",
  },
  {
    icon: Terminal,
    title: "Auditable",
    desc: "Kotlin and Compose, GPLv3 licensed. One APK for Android 12 and up instead of dozens of single-purpose apps.",
    color: "tertiary",
  },
  {
    icon: LayoutGrid,
    title: "Part of the OS",
    desc: "Quick Settings tiles, homescreen widgets and autofill put tools where Android already is.",
    color: "primary",
  },
];

// From the README's Quick Start tips.
const steps = [
  { num: "01", label: "Pin your favorites", sub: "Long-press tools on the dashboard to keep them front and center" },
  { num: "02", label: "Search in plain words", sub: "Describe what you want; Smart Search opens the right tool" },
  { num: "03", label: "Lock the vault", sub: "Set up the password vault with biometric unlock for autofill" },
  { num: "04", label: "Back up your data", sub: "Export notes, passwords and settings so nothing is lost" },
];

const colorMap = {
  primary: {
    container: "hsl(var(--md-primary-container))",
    on: "hsl(var(--md-on-primary-container))",
    accent: "hsl(var(--md-primary))",
  },
  secondary: {
    container: "hsl(var(--md-secondary-container))",
    on: "hsl(var(--md-on-secondary-container))",
    accent: "hsl(var(--md-secondary))",
  },
  tertiary: {
    container: "hsl(var(--md-tertiary-container))",
    on: "hsl(var(--md-on-tertiary-container))",
    accent: "hsl(var(--md-tertiary))",
  },
};

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      {/* Background accent */}
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[400px] opacity-10 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(ellipse, hsl(var(--md-secondary)), transparent 70%)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center mb-10 md:mb-16"
        >
          <div className="m3-chip inline-flex mb-5 md:mb-6">Philosophy</div>
          <h2
            className="m3-display-medium text-3xl md:text-5xl mb-4 md:mb-6"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            Built to stay on your phone.
          </h2>
          <p
            className="m3-body-large max-w-xl mx-auto px-2 text-[15px] md:text-lg"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            Toolz is an offline-first toolkit: 48+ tools in one APK, and vault
            data that never leaves your device.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 150, damping: 25 }}
          >
            <h3
              className="m3-headline-medium text-xl md:text-2xl mb-5 md:mb-8"
              style={{ color: "hsl(var(--md-on-surface))" }}
            >
              Start in minutes
            </h3>
            <div className="flex flex-col gap-2.5 md:gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + (i * 0.08), type: "spring", stiffness: 200, damping: 25 }}
                  className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[20px] md:rounded-[28px]"
                  style={{
                    background: i === 0
                      ? "hsl(var(--md-primary-container))"
                      : "hsl(var(--md-surface-container))",
                  }}
                >
                  <div
                    className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-base md:text-xl shadow-lg shadow-black/10"
                    style={{
                      background: i === 0
                        ? "hsl(var(--md-primary))"
                        : "hsl(var(--md-surface-container-high))",
                      color: i === 0
                        ? "hsl(var(--md-on-primary))"
                        : "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    {step.num}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="m3-title-large text-[15px] md:text-lg mb-0.5 md:mb-1"
                      style={{
                        color: i === 0
                          ? "hsl(var(--md-on-primary-container))"
                          : "hsl(var(--md-on-surface))",
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      className="m3-body-medium text-[13px] md:text-base"
                      style={{
                        color: i === 0
                          ? "hsl(var(--md-on-primary-container) / 0.8)"
                          : "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {step.sub}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Principles grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {principles.map((p, i) => {
              const colors = colorMap[p.color as keyof typeof colorMap];
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.2 + (i * 0.08), type: "spring", stiffness: 200, damping: 25 }}
                  className="rounded-[20px] md:rounded-[28px] border p-5 md:p-7 flex flex-col gap-4 md:gap-6 h-full"
                  style={{
                    background: "hsl(var(--md-surface-container))",
                    borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                  }}
                >
                  <div
                    className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-black/5"
                    style={{ background: colors.container }}
                  >
                    <Icon size={22} style={{ color: colors.on }} />
                  </div>
                  <div>
                    <h4
                      className="m3-title-large text-[16px] md:text-lg mb-1.5 md:mb-2"
                      style={{ color: "hsl(var(--md-on-surface))" }}
                    >
                      {p.title}
                    </h4>
                    <p
                      className="m3-body-medium text-[13px] md:text-[15px] leading-relaxed"
                      style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
