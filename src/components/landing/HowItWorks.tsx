import { Shield, Zap, Terminal, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const principles = [
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Core tools work 100% offline. Sensitive data is stored locally using industrial-grade SQLCipher encryption.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Zero Bloat",
    desc: "One optimized APK replaces dozens of single-purpose apps. Minimal footprint, maximum precision.",
    color: "secondary",
  },
  {
    icon: Cpu,
    title: "Deep Integration",
    desc: "Native Quick Settings tiles, Homescreen Widgets, and Autofill support for a seamless system experience.",
    color: "tertiary",
  },
  {
    icon: Terminal,
    title: "Open Source",
    desc: "Fully auditable. Built for transparency and performance, with zero tracking or data collection.",
    color: "primary",
  },
];

const steps = [
  { num: "01", label: "Download the Beta", sub: "Available for all major ABIs" },
  { num: "02", label: "Enable the Modules", sub: "Pick what you need, skip what you don't" },
  { num: "03", label: "Own Your Device", sub: "Full control, zero compromise" },
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

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 200, damping: 25 },
  }),
};

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-32 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      {/* Background gradient */}
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
          className="text-center mb-20"
        >
          <div className="m3-chip inline-flex mb-6">Philosophy</div>
          <h2
            className="m3-display-medium mb-6"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            Built for{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--md-primary)), hsl(var(--md-secondary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              operators.
            </span>
          </h2>
          <p
            className="m3-body-large max-w-xl mx-auto"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            Toolz isn't another utility app. It's an orchestrated toolkit of 45+ precision instruments for those
            who want absolute control of their Android environment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 150, damping: 25 }}
          >
            <h3
              className="m3-headline-medium mb-8"
              style={{ color: "hsl(var(--md-on-surface))" }}
            >
              Get started in minutes
            </h3>
            <div className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1), type: "spring", stiffness: 200, damping: 25 }}
                  className="flex items-center gap-6 p-6 rounded-[28px] transition-transform hover:scale-[1.02]"
                  style={{
                    background: i === 0
                      ? "hsl(var(--md-primary-container))"
                      : "hsl(var(--md-surface-container))",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-display font-bold text-xl shadow-lg shadow-black/10"
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
                  <div>
                    <div
                      className="m3-title-large mb-1"
                      style={{
                        color: i === 0
                          ? "hsl(var(--md-on-primary-container))"
                          : "hsl(var(--md-on-surface))",
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      className="m3-body-medium"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((p, i) => {
              const colors = colorMap[p.color as keyof typeof colorMap];
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.3 + (i * 0.1), type: "spring", stiffness: 200, damping: 25 }}
                  className="m3-card-outlined p-7 flex flex-col gap-6 group cursor-default h-full border-outline-variant/50"
                  whileHover={{ y: -8, scale: 1.02, borderColor: colors.accent }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-black/5"
                    style={{ background: colors.container }}
                  >
                    <Icon size={26} style={{ color: colors.on }} />
                  </div>
                  <div>
                    <h4
                      className="m3-title-large mb-2"
                      style={{ color: "hsl(var(--md-on-surface))" }}
                    >
                      {p.title}
                    </h4>
                    <p
                      className="m3-body-medium leading-relaxed"
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
