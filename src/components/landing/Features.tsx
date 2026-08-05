import { Shield, Lock, RefreshCw, HardDrive, Bell, Settings, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Clock,
    title: "Time & Productivity",
    tag: "Essential",
    desc: "Countdown engines, high-resolution stopwatches, and Pomodoro focus cycles with background persistence.",
    color: "primary",
  },
  {
    icon: Lock,
    title: "Security & Privacy",
    tag: "Hardened",
    desc: "SQLCipher-encrypted password vault and notifications. Core tools work 100% offline.",
    color: "secondary",
  },
  {
    icon: RefreshCw,
    title: "Media & PDF",
    tag: "Utility",
    desc: "FFmpeg-powered media conversion and studio-quality recording. Native PDF viewer with extraction.",
    color: "tertiary",
  },
  {
    icon: HardDrive,
    title: "Device & System",
    tag: "Advanced",
    desc: "Deep hardware diagnostics, storage management, and network optimization tools.",
    color: "primary",
  },
  {
    icon: Bell,
    title: "Notification History",
    tag: "Privacy",
    desc: "A searchable local log of all system notifications. Audit privacy and retrieve deleted messages.",
    color: "secondary",
  },
  {
    icon: Sparkles,
    title: "AI Utilities",
    tag: "Smart",
    desc: "Optional conversational agents for document summaries and contextual search guidance.",
    color: "tertiary",
  },
];

const colorMap = {
  primary: {
    icon: "hsl(var(--md-on-primary-container))",
    container: "hsl(var(--md-primary-container))",
    chip: "hsl(var(--md-primary) / 0.12)",
    chipText: "hsl(var(--md-primary))",
  },
  secondary: {
    icon: "hsl(var(--md-on-secondary-container))",
    container: "hsl(var(--md-secondary-container))",
    chip: "hsl(var(--md-secondary) / 0.12)",
    chipText: "hsl(var(--md-secondary))",
  },
  tertiary: {
    icon: "hsl(var(--md-on-tertiary-container))",
    container: "hsl(var(--md-tertiary-container))",
    chip: "hsl(var(--md-tertiary) / 0.12)",
    chipText: "hsl(var(--md-tertiary))",
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

const Features = () => {
  return (
    <section
      id="features"
      className="py-32 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="m3-chip inline-flex mb-6">Precision Modules</div>
          <h2
            className="m3-display-medium text-3xl md:text-5xl lg:text-6xl mb-6"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            Everything you{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--md-primary)), hsl(var(--md-tertiary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              need
            </span>
            ,<br />nothing you don't.
          </h2>
          <p
            className="m3-body-large max-w-xl mx-auto px-4"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            A massive library of 45+ precision instruments. Zero bloat, zero cloud, zero compromise.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((feature, i) => {
            const colors = colorMap[feature.color as keyof typeof colorMap];
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="m3-card-filled p-6 md:p-8 flex flex-col gap-5 md:gap-6 group cursor-default"
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Icon + tag row */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                    style={{ background: colors.container }}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: colors.icon }} />
                  </div>
                  <div
                    className="m3-label-small px-3 py-1 rounded-full text-[10px] md:text-xs"
                    style={{
                      background: colors.chip,
                      color: colors.chipText,
                    }}
                  >
                    {feature.tag}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3
                    className="m3-title-large text-xl md:text-2xl"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="m3-body-medium text-sm md:text-base leading-relaxed opacity-80"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    {feature.desc}
                  </p>
                </div>

                {/* Status indicator */}
                <div
                  className="flex items-center gap-2 mt-auto pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ borderColor: "hsl(var(--md-outline-variant))" }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: colors.chipText }}
                  />
                  <span className="m3-label-small" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                    Active
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
