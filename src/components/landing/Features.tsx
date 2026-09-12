import {
  Clock,
  Music,
  Shield,
  Compass,
  Flashlight,
  Calculator,
  Cpu,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  icon: typeof Clock;
  name: string;
  tools: string[];
  color: "primary" | "secondary" | "tertiary";
}

// Real groups from the Toolz app: 48+ tools in 9 categories.
const categories: Category[] = [
  {
    id: "time",
    icon: Clock,
    name: "Time & Productivity",
    tools: ["Timer", "Stopwatch", "Pomodoro", "World Clock", "Calendar", "Todo List", "Caffeinate", "Focus Flow"],
    color: "primary",
  },
  {
    id: "media",
    icon: Music,
    name: "Media & PDF",
    tools: ["Music Player", "Voice Recorder", "File Converter", "PDF Reader", "Background Remover", "File Cleaner", "Sound Meter"],
    color: "secondary",
  },
  {
    id: "security",
    icon: Shield,
    name: "Security & Privacy",
    tools: ["Password Vault", "Password Generator", "Clipboard History", "Notification Vault", "Smart Encrypter", "Purge Shot"],
    color: "tertiary",
  },
  {
    id: "sensors",
    icon: Compass,
    name: "Sensors & Navigation",
    tools: ["Compass", "Bubble Level", "Speedometer", "Altimeter", "Step Counter", "Ruler", "Color Picker"],
    color: "primary",
  },
  {
    id: "light",
    icon: Flashlight,
    name: "Light & Optics",
    tools: ["Flashlight", "Screen Light", "Magnifier", "Scanner", "QR Generator", "Light Meter"],
    color: "secondary",
  },
  {
    id: "math",
    icon: Calculator,
    name: "Math & Conversion",
    tools: ["Calculator", "Unit Converter", "Tip Calculator", "BMI Calculator", "Equation Solver"],
    color: "tertiary",
  },
  {
    id: "device",
    icon: Cpu,
    name: "Device & System",
    tools: ["Device Info", "Battery Info", "Periodic Table", "Flip Coin", "Network Tweaks", "Network Power Suite"],
    color: "primary",
  },
  {
    id: "ai",
    icon: Sparkles,
    name: "AI & Utilities",
    tools: ["AI Assistant", "Smart Search", "Web Search", "Notepad"],
    color: "secondary",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    name: "Messaging",
    tools: ["Whisper (beta)"],
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
} as const;

const openInExplorer = (id: string) => {
  window.dispatchEvent(new CustomEvent("toolz:select-category", { detail: id }));
  document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Features = () => {
  return (
    <section
      id="features"
      className="py-20 md:py-32 relative overflow-hidden"
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
          className="text-center mb-10 md:mb-16"
        >
          <div className="m3-chip inline-flex mb-5 md:mb-6">Inside the app</div>
          <h2
            className="m3-display-medium text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            48+ tools. 9 groups. One app.
          </h2>
          <p
            className="m3-body-large max-w-xl mx-auto px-2 text-[15px] md:text-lg"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            One APK for Android 12 and up. Core tools run offline, and vault
            data stays encrypted on your device. No ads, no tracking.
          </p>
        </motion.div>

        {/* Category cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 160, damping: 26 }}
        >
          {categories.map((cat) => {
            const colors = colorMap[cat.color];
            const Icon = cat.icon;
            return (
              <article
                key={cat.id}
                className="m3-card-filled p-5 md:p-7 flex flex-col gap-4 md:gap-5"
              >
                {/* Icon + count row */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg p-3"
                    style={{ background: colors.container }}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: colors.icon }} />
                  </div>
                  <span
                    className="m3-label-small px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold tabular-nums"
                    style={{ background: colors.chip, color: colors.chipText }}
                  >
                    {cat.tools.length} tool{cat.tools.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Name */}
                <h3
                  className="m3-title-large text-lg md:text-xl"
                  style={{ color: "hsl(var(--md-on-surface))" }}
                >
                  {cat.name}
                </h3>

                {/* Tool names */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {cat.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-medium"
                      style={{
                        background: "hsl(var(--md-surface-container-highest))",
                        color: "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                {/* Jump to explorer */}
                <button
                  onClick={() => openInExplorer(cat.id)}
                  className="mt-auto pt-1 inline-flex items-center gap-1.5 text-[13px] md:text-sm font-bold self-start active:scale-95 transition-transform"
                  style={{ color: colors.chipText }}
                >
                  What each one does
                  <ArrowRight size={15} />
                </button>
              </article>
            );
          })}
        </motion.div>

        <p
          className="text-center mt-8 md:mt-10 text-[13px] md:text-sm"
          style={{ color: "hsl(var(--md-on-surface-variant) / 0.7)" }}
        >
          Plus homescreen widgets and Quick Settings tiles for flashlight, notes, steps, music and more.
        </p>
      </div>
    </section>
  );
};

export default Features;
