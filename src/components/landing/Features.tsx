import { Shield, Lock, RefreshCw, HardDrive, Bell, Settings } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Privacy Hub",
    tag: "Core",
    desc: "100% offline utilities. No trackers, no telemetry. Sensitive data is stored with SQLCipher encryption.",
    color: "primary",
  },
  {
    icon: Lock,
    title: "Security Vault",
    tag: "Hardened",
    desc: "Encrypted storage for passwords, notes, and system notifications with biometric authentication.",
    color: "secondary",
  },
  {
    icon: RefreshCw,
    title: "FFmpeg Media",
    tag: "Precision",
    desc: "Studio-quality audio/video conversion and studio recording powered by system-native binaries.",
    color: "tertiary",
  },
  {
    icon: HardDrive,
    title: "System Suite",
    tag: "Deep Ops",
    desc: "Advanced file cleaning, hardware diagnostics, and network optimization for power users.",
    color: "primary",
  },
  {
    icon: Bell,
    title: "Notify Vault",
    tag: "Archival",
    desc: "A searchable local log of all system notifications. Auditing privacy and capturing deleted history.",
    color: "secondary",
  },
  {
    icon: Settings,
    title: "45+ Instruments",
    tag: "Toolkit",
    desc: "From AI document summaries to GPS sensors — every tool you need in one polished APK.",
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
          className="text-center mb-20"
        >
          <div className="m3-chip inline-flex mb-6">Precision Modules</div>
          <h2
            className="m3-display-medium mb-6"
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
            className="m3-body-large max-w-xl mx-auto"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            A massive library of 45+ precision instruments. Zero bloat, zero cloud, zero compromise.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                className="m3-card-filled p-8 flex flex-col gap-6 group cursor-default"
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Icon + tag row */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: colors.container }}
                  >
                    <Icon size={24} style={{ color: colors.icon }} />
                  </div>
                  <div
                    className="m3-label-small px-3 py-1 rounded-full"
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
                    className="m3-title-large"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="m3-body-medium leading-relaxed"
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
