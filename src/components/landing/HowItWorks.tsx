import { Shield, Zap, Terminal, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const principles = [
  {
    icon: Shield,
    title: "100% Local",
    desc: "Your data never leaves your device. No cloud, no tracking, no exceptions.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Zero Bloat",
    desc: "Minimal battery drain, maximum performance. Precision code, no filler.",
    color: "secondary",
  },
  {
    icon: Terminal,
    title: "Open Source",
    desc: "Fully auditable. Built by the community, for the community, forever.",
    color: "tertiary",
  },
  {
    icon: Cpu,
    title: "Pro-Level Tools",
    desc: "Real controls for real users. No simplified menus, no hand-holding.",
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
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
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
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 250, damping: 28 }}
                  className="flex items-center gap-5 p-5 rounded-2xl"
                  style={{
                    background: i === 0
                      ? "hsl(var(--md-primary-container))"
                      : "hsl(var(--md-surface-container))",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-lg"
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
                      className="m3-title-medium font-semibold"
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
                          ? "hsl(var(--md-on-primary-container) / 0.7)"
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
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="m3-card-outlined p-6 flex flex-col gap-4 group cursor-default"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: colors.container }}
                  >
                    <Icon size={22} style={{ color: colors.on }} />
                  </div>
                  <div>
                    <h4
                      className="m3-title-medium font-semibold mb-1"
                      style={{ color: "hsl(var(--md-on-surface))" }}
                    >
                      {p.title}
                    </h4>
                    <p
                      className="m3-body-medium"
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
