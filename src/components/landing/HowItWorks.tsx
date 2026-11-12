import { WifiOff, Lock, LayoutGrid, Terminal } from "lucide-react";
import SectionHeader from "@/components/landing/SectionHeader";
import { totalTools } from "@/lib/tools-catalog";
import { SHAPES } from "@/components/expressive/shapes";

const tones = {
  primary: {
    bg: "hsl(var(--md-primary-container))",
    fg: "hsl(var(--md-on-primary-container))",
  },
  secondary: {
    bg: "hsl(var(--md-secondary-container))",
    fg: "hsl(var(--md-on-secondary-container))",
  },
  tertiary: {
    bg: "hsl(var(--md-tertiary-container))",
    fg: "hsl(var(--md-on-tertiary-container))",
  },
  neutral: {
    bg: "hsl(var(--md-surface-container))",
    fg: "hsl(var(--md-on-surface))",
  },
} as const;

type Tone = keyof typeof tones;

const principles: {
  icon: typeof WifiOff;
  title: string;
  desc: string;
  tone: Tone;
  span: string;
  large?: boolean;
}[] = [
  {
    icon: WifiOff,
    title: "Offline-first",
    desc: "Core tools run fully on-device. Anything that uses the network is clearly labelled, and offline mode switches it all off.",
    tone: "primary",
    span: "lg:col-span-2",
    large: true,
  },
  {
    icon: Lock,
    title: "Encrypted vault",
    desc: "Passwords and notes live in SQLCipher storage with biometric unlock. They never leave your device.",
    tone: "secondary",
    span: "",
  },
  {
    icon: LayoutGrid,
    title: "Part of Android",
    desc: "Quick Settings tiles, homescreen widgets and autofill put tools where you already are.",
    tone: "tertiary",
    span: "",
  },
  {
    icon: Terminal,
    title: "Open source",
    desc: "Kotlin and Compose under GPLv3. No accounts, no ads and no trackers, with the full source public on GitHub.",
    tone: "neutral",
    span: "lg:col-span-2",
    large: true,
  },
];

const HowItWorks = () => (
  <section
    id="how-it-works"
    className="scroll-mt-20 py-20 md:py-28"
    style={{ background: "hsl(var(--md-surface))" }}
  >
    <div className="container mx-auto px-4">
      <SectionHeader
        chip="Principles"
        title="Private by default."
        description={`${totalTools} tools in one APK, built to work without an account, a server or a connection.`}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map(({ icon: Icon, title, desc, tone, span, large }) => {
          const t = tones[tone];
          return (
            <li
              key={title}
              className={`flex flex-col justify-between gap-12 p-7 md:p-9 ${span}`}
              style={{
                borderRadius: SHAPES.extraLarge,
                background: t.bg,
                color: t.fg,
                minHeight: large ? 280 : 260,
              }}
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-full"
                style={{ background: "hsl(var(--md-surface) / 0.55)", color: t.fg }}
              >
                <Icon size={24} />
              </span>
              <div>
                <h3
                  className={`font-bold ${large ? "m3-headline-medium" : "m3-title-large"}`}
                >
                  {title}
                </h3>
                <p
                  className={`mt-2 max-w-md text-pretty leading-relaxed opacity-85 ${
                    large ? "m3-body-large" : "m3-body-medium"
                  }`}
                >
                  {desc}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default HowItWorks;
