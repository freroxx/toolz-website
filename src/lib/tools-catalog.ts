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
} from "lucide-react";

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
export const categories: Category[] = [
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
    intro: "Local-first audio, downloads, conversion and documents. Files stay on your phone.",
    tools: [
      { name: "Music Player", desc: "Local library, playlists and background playback." },
      { name: "Media Downloader", desc: "Saves YouTube, TikTok and Reels with quality picker and audio-only mode." },
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

export const totalTools = categories.reduce((sum, c) => sum + c.tools.length, 0);
