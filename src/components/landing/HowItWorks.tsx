import { WifiOff, Lock, LayoutGrid, Terminal } from "lucide-react";
import SectionHeader from "@/components/landing/SectionHeader";
import { totalTools } from "@/lib/tools-catalog";
import { SHAPES } from "@/components/expressive/shapes";

const principles = [
  {
    icon: WifiOff,
    title: "Offline-first",
    desc: "Core tools run fully on-device. Anything that uses the network is labelled, and offline mode switches it all off.",
  },
  {
    icon: Lock,
    title: "Encrypted vault",
    desc: "Passwords and notes live in SQLCipher storage with biometric unlock. Your data never leaves the device.",
  },
  {
    icon: LayoutGrid,
    title: "Part of Android",
    desc: "Quick Settings tiles, homescreen widgets and autofill put tools where you already are.",
  },
  {
    icon: Terminal,
    title: "Open source",
    desc: "Kotlin and Compose under GPLv3. No accounts, no ads, no trackers, and the full source is on GitHub.",
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

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map(({ icon: Icon, title, desc }) => (
          <li
            key={title}
            className="flex flex-col gap-10 p-7"
            style={{
              borderRadius: SHAPES.extraLarge,
              background: "hsl(var(--md-surface-container))",
            }}
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-full"
              style={{
                background: "hsl(var(--md-secondary-container))",
                color: "hsl(var(--md-on-secondary-container))",
              }}
            >
              <Icon size={22} />
            </span>
            <div>
              <h3 className="m3-title-large font-bold text-on-surface">{title}</h3>
              <p className="m3-body-medium mt-2 leading-relaxed text-on-surface-variant">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default HowItWorks;
