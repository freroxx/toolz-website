import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  name: string;
  desc: string;
}

interface Category {
  id: string;
  icon: typeof Clock;
  name: string;
  intro: string;
  tools: Tool[];
  color: "primary" | "secondary" | "tertiary";
}

// Mirrors the real Toolz tool list. Descriptions state what each tool does.
const categories: Category[] = [
  {
    id: "time",
    icon: Clock,
    name: "Time & Productivity",
    intro: "Timers that survive in the background, and focus tools that track real sessions.",
    tools: [
      { name: "Timer", desc: "Countdown with background persistence and alarms." },
      { name: "Stopwatch", desc: "Millisecond timing with lap tracking." },
      { name: "Pomodoro", desc: "25/5/15 focus cycles with session history." },
      { name: "World Clock", desc: "Timezones side by side for distributed teams." },
      { name: "Calendar", desc: "Events and scheduling in one view." },
      { name: "Todo List", desc: "Priority tasks with due-date filters." },
      { name: "Caffeinate", desc: "Keeps the screen awake; toggle from Quick Settings." },
      { name: "Focus Flow", desc: "App-usage tracking with a daily flow score." },
    ],
    color: "primary",
  },
  {
    id: "media",
    icon: Music,
    name: "Media & PDF",
    intro: "Local-first audio, recording, conversion and documents. Files stay on your phone.",
    tools: [
      { name: "Music Player", desc: "Local library, playlists and background playback." },
      { name: "Voice Recorder", desc: "Pause/resume capture with a searchable library." },
      { name: "File Converter", desc: "FFmpeg conversion for video, audio and images." },
      { name: "PDF Reader", desc: "Viewer with text extraction." },
      { name: "Background Remover", desc: "Cutouts computed fully on-device, four quality tiers." },
      { name: "File Cleaner", desc: "Reclaims storage by clearing redundant cache." },
      { name: "Sound Meter", desc: "Live decibel readings of your surroundings." },
    ],
    color: "secondary",
  },
  {
    id: "security",
    icon: Shield,
    name: "Security & Privacy",
    intro: "Encrypted vaults and local archives. Nothing here needs an account.",
    tools: [
      { name: "Password Vault", desc: "SQLCipher storage, biometric unlock, autofill." },
      { name: "Password Generator", desc: "High-entropy keys with adjustable rules." },
      { name: "Clipboard History", desc: "Local archive of everything you copied." },
      { name: "Notification Vault", desc: "Searchable log of notifications, kept on-device." },
      { name: "Smart Encrypter", desc: "AES-256 encryption for text and files." },
      { name: "Purge Shot", desc: "Screenshots that auto-expire after 30s to a month." },
    ],
    color: "tertiary",
  },
  {
    id: "sensors",
    icon: Compass,
    name: "Sensors & Navigation",
    intro: "Reads your phone's GPS, barometer, magnetometer and camera sensors.",
    tools: [
      { name: "Compass", desc: "Magnetic bearing with heading visualization." },
      { name: "Bubble Level", desc: "Dual-axis level for alignment jobs." },
      { name: "Speedometer", desc: "GPS velocity with peak speed and distance." },
      { name: "Altimeter", desc: "Elevation from barometric pressure and GPS." },
      { name: "Step Counter", desc: "Daily goals, trends and distance estimates." },
      { name: "Ruler", desc: "Calibrated on-screen measurement." },
      { name: "Color Picker", desc: "HEX/RGB values sampled through the camera." },
    ],
    color: "primary",
  },
  {
    id: "light",
    icon: Flashlight,
    name: "Light & Optics",
    intro: "LED, display and camera utilities for seeing and scanning.",
    tools: [
      { name: "Flashlight", desc: "Steady, strobe, SOS and disco LED modes." },
      { name: "Screen Light", desc: "Display as a lamp with adjustable warmth." },
      { name: "Magnifier", desc: "Digital zoom for micro-text and small parts." },
      { name: "Scanner", desc: "Fast QR and barcode recognition." },
      { name: "QR Generator", desc: "Codes from text, credentials or Wi-Fi configs." },
      { name: "Light Meter", desc: "Ambient brightness in lux." },
    ],
    color: "secondary",
  },
  {
    id: "math",
    icon: Calculator,
    name: "Math & Conversion",
    intro: "Calculation and reference tools with history where it matters.",
    tools: [
      { name: "Calculator", desc: "Scientific engine with expression history." },
      { name: "Unit Converter", desc: "Hundreds of units across distance, weight, energy." },
      { name: "Tip Calculator", desc: "Bill splitting and tips for groups." },
      { name: "BMI Calculator", desc: "Health metrics with TDEE guidance." },
      { name: "Equation Solver", desc: "Linear, quadratic and complex equations." },
    ],
    color: "tertiary",
  },
  {
    id: "device",
    icon: Cpu,
    name: "Device & System",
    intro: "Inspect and tune the phone itself: hardware, battery and network.",
    tools: [
      { name: "Device Info", desc: "Hardware diagnostics and system properties." },
      { name: "Battery Info", desc: "Health, charge cycles and temperature." },
      { name: "Periodic Table", desc: "Element properties reference." },
      { name: "Flip Coin", desc: "Physics-simulated coin flip." },
      { name: "Network Tweaks", desc: "Wi-Fi diagnostics and connectivity fixes." },
      { name: "Network Power Suite", desc: "DNS configuration, ad-blocking and monitoring." },
    ],
    color: "primary",
  },
  {
    id: "ai",
    icon: Sparkles,
    name: "AI & Utilities",
    intro: "Optional helpers. The rest of the app works without touching these.",
    tools: [
      { name: "AI Assistant", desc: "Document summaries and contextual guidance (opt-in)." },
      { name: "Smart Search", desc: "Plain-language search that opens the right tool." },
      { name: "Web Search", desc: "Private browser with ad-blocking and custom DNS." },
      { name: "Notepad", desc: "Notes and reminders with audio-linked memos." },
    ],
    color: "secondary",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    name: "Messaging",
    intro: "Built-in chat, currently in beta and under active development.",
    tools: [
      { name: "Whisper (beta)", desc: "End-to-end encrypted, friends-only messaging. No email sign-in." },
    ],
    color: "tertiary",
  },
];

const colorMap = {
  primary: {
    active: "hsl(var(--md-primary-container))",
    activeText: "hsl(var(--md-on-primary-container))",
    icon: "hsl(var(--md-primary))",
    soft: "hsl(var(--md-primary) / 0.12)",
  },
  secondary: {
    active: "hsl(var(--md-secondary-container))",
    activeText: "hsl(var(--md-on-secondary-container))",
    icon: "hsl(var(--md-secondary))",
    soft: "hsl(var(--md-secondary) / 0.12)",
  },
  tertiary: {
    active: "hsl(var(--md-tertiary-container))",
    activeText: "hsl(var(--md-on-tertiary-container))",
    icon: "hsl(var(--md-tertiary))",
    soft: "hsl(var(--md-tertiary) / 0.12)",
  },
} as const;

const Showcase = () => {
  const [activeId, setActiveId] = useState(categories[0].id);
  const activeIndex = Math.max(0, categories.findIndex((c) => c.id === activeId));
  const active = categories[activeIndex];
  const colors = colorMap[active.color];

  // Lets the Features cards above jump straight to a category.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (categories.some((c) => c.id === id)) setActiveId(id);
    };
    window.addEventListener("toolz:select-category", handler);
    return () => window.removeEventListener("toolz:select-category", handler);
  }, []);

  const step = (dir: 1 | -1) => {
    const next = (activeIndex + dir + categories.length) % categories.length;
    setActiveId(categories[next].id);
  };

  return (
    <section
      id="showcase"
      className="py-20 md:py-32 relative overflow-hidden scroll-mt-20"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      {/* Soft glow that follows the active category color */}
      <motion.div
        className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.07] pointer-events-none blur-[120px]"
        animate={{ backgroundColor: colors.icon }}
        transition={{ duration: 0.6 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="m3-chip inline-flex mb-5 md:mb-6">Tool explorer</div>
          <h2
            className="m3-display-medium text-3xl md:text-5xl mb-4"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            Browse every tool.
          </h2>
          <p
            className="m3-body-large max-w-xl mx-auto px-2 text-[15px] md:text-lg"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            Pick a group to see the tools inside and what each one does.
          </p>
        </motion.div>

        {/* Category rail: swipeable row on mobile, wrapped grid on desktop */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 md:mb-6 snap-x [scrollbar-width:none] lg:flex-wrap lg:justify-center lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => {
            const isActive = c.id === activeId;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 border",
                  !isActive && "border-outline-variant/25 bg-surface-container-high text-on-surface-variant"
                )}
                style={
                  isActive
                    ? {
                        background: colorMap[c.color].active,
                        color: colorMap[c.color].activeText,
                        borderColor: "transparent",
                      }
                    : undefined
                }
              >
                <Icon size={15} />
                {c.name}
                <span className={cn("text-[11px] tabular-nums opacity-70")}>{c.tools.length}</span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="max-w-3xl mx-auto rounded-[24px] md:rounded-[32px] border p-5 md:p-8"
          style={{
            background: "hsl(var(--md-surface-container))",
            borderColor: "hsl(var(--md-outline-variant) / 0.4)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 md:gap-4 mb-2">
                <div
                  className="w-11 h-11 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 p-3"
                  style={{ background: colors.soft }}
                >
                  <active.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: colors.icon }} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="m3-title-large text-lg md:text-2xl leading-tight"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    {active.name}
                  </h3>
                  <p
                    className="text-[12.5px] md:text-sm truncate sm:whitespace-normal"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    {active.intro}
                  </p>
                </div>
                {/* Prev / next */}
                <div className="ml-auto flex gap-1.5 shrink-0">
                  <button
                    onClick={() => step(-1)}
                    aria-label="Previous group"
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                      color: "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    onClick={() => step(1)}
                    aria-label="Next group"
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                      color: "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              {/* Tools */}
              <ul className="divide-y" style={{ borderColor: "hsl(var(--md-outline-variant) / 0.3)" }}>
                {active.tools.map((tool, i) => (
                  <li
                    key={tool.name}
                    className="flex items-baseline gap-3 md:gap-4 py-3 md:py-3.5"
                    style={{ borderColor: "inherit" }}
                  >
                    <span
                      className="text-[11px] md:text-xs font-bold tabular-nums shrink-0 w-6"
                      style={{ color: colors.icon }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div
                        className="text-[14px] md:text-[15px] font-bold leading-snug"
                        style={{ color: "hsl(var(--md-on-surface))" }}
                      >
                        {tool.name}
                      </div>
                      <div
                        className="text-[12.5px] md:text-sm leading-relaxed"
                        style={{ color: "hsl(var(--md-on-surface-variant))" }}
                      >
                        {tool.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <p
                className="mt-3 text-[11.5px] md:text-xs tabular-nums"
                style={{ color: "hsl(var(--md-on-surface-variant) / 0.6)" }}
              >
                Group {activeIndex + 1} of {categories.length} · {active.tools.length} tool
                {active.tools.length === 1 ? "" : "s"}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Showcase;
