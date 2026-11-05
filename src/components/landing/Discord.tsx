import { Github, MessageSquare, ExternalLink, Star, GitPullRequest } from "lucide-react";
import { motion } from "framer-motion";
import { PRESS_SPRING } from "@/lib/motion";

const links = [
  {
    icon: MessageSquare,
    title: "Discord server",
    desc: "Bug reports, feature requests, community skins",
    href: "https://discord.gg/aAswRUerwh",
    tone: "secondary" as const,
  },
  {
    icon: Star,
    title: "Star on GitHub",
    desc: "Follow the repository and track new releases",
    href: "https://github.com/freroxx/toolz",
    tone: "tertiary" as const,
  },
  {
    icon: GitPullRequest,
    title: "Contribute",
    desc: "Open an issue or submit a pull request — GPLv3",
    href: "https://github.com/freroxx/toolz/issues",
    tone: "primary" as const,
  },
];

const toneMap = {
  primary: {
    bg: "hsl(var(--md-primary-container))",
    icon: "hsl(var(--md-primary) / 0.20)",
    color: "hsl(var(--md-on-primary-container))",
  },
  secondary: {
    bg: "hsl(var(--md-secondary-container))",
    icon: "hsl(var(--md-secondary) / 0.20)",
    color: "hsl(var(--md-on-secondary-container))",
  },
  tertiary: {
    bg: "hsl(var(--md-tertiary-container))",
    icon: "hsl(var(--md-tertiary) / 0.20)",
    color: "hsl(var(--md-on-tertiary-container))",
  },
};

const Discord = () => {
  return (
    <section id="discord" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Left — editorial copy */}
          <div
            className="flex flex-col justify-between gap-8 rounded-[24px] border p-6 md:p-9"
            style={{
              background: "hsl(var(--md-secondary-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.35)",
            }}
          >
            <div>
              <span
                className="m3-chip border-transparent"
                style={{
                  background: "hsl(var(--md-secondary) / 0.18)",
                  color: "hsl(var(--md-on-secondary-container))",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "hsl(var(--md-secondary))" }}
                />
                Community
              </span>
              <h2
                className="m3-display-small mt-5 font-bold text-balance"
                style={{ color: "hsl(var(--md-on-secondary-container))" }}
              >
                Join the conversation.
              </h2>
              <p
                className="m3-body-large mt-3 max-w-md leading-relaxed"
                style={{ color: "hsl(var(--md-on-secondary-container) / 0.85)" }}
              >
                Ask for help, share your skins, report bugs, and track what is coming
                next — directly with the developers on Discord and GitHub.
              </p>
            </div>

            <motion.a
              href="https://discord.gg/aAswRUerwh"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              transition={PRESS_SPRING}
              className="m3-btn-filled w-full justify-center gap-3 py-4 font-semibold shadow-md sm:w-auto sm:self-start"
            >
              <MessageSquare size={18} />
              Join Discord
              <ExternalLink size={13} className="opacity-70" />
            </motion.a>
          </div>

          {/* Right — link cards */}
          <div className="flex flex-col gap-3">
            {links.map(({ icon: Icon, title, desc, href, tone }) => {
              const t = toneMap[tone];
              return (
                <motion.a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                  className="group flex items-center gap-4 rounded-[18px] border p-5 transition-colors"
                  style={{
                    background: t.bg,
                    borderColor: "hsl(var(--md-outline-variant) / 0.35)",
                    color: t.color,
                  }}
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px]"
                    style={{ background: t.icon }}
                  >
                    <Icon size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m3-title-small font-bold leading-tight">{title}</p>
                    <p className="m3-body-small mt-0.5 opacity-80">{desc}</p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="shrink-0 opacity-50 transition-opacity group-hover:opacity-80"
                  />
                </motion.a>
              );
            })}

            {/* GitHub stats strip */}
            <div
              className="mt-1 flex flex-wrap items-center gap-4 rounded-[16px] border p-4"
              style={{
                background: "hsl(var(--md-surface-container))",
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              }}
            >
              <Github size={16} style={{ color: "hsl(var(--md-on-surface-variant))" }} />
              <span className="m3-label-medium text-on-surface-variant">
                freroxx / toolz
              </span>
              <span
                className="m3-label-small ml-auto rounded-full px-2.5 py-1 font-semibold"
                style={{
                  background: "hsl(var(--md-secondary-container))",
                  color: "hsl(var(--md-on-secondary-container))",
                }}
              >
                GPLv3
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Discord;
