import { MessageSquare, ExternalLink, Star, GitPullRequest, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PRESS_SPRING } from "@/lib/motion";
import { ExpressiveCard } from "@/components/expressive/ExpressiveCard";
import { SHAPES } from "@/components/expressive/shapes";

const links = [
  {
    icon: MessageSquare,
    title: "Discord server",
    desc: "Bug reports, feature requests, community skins",
    href: "https://discord.gg/aAswRUerwh",
  },
  {
    icon: Star,
    title: "Star on GitHub",
    desc: "Follow the repository and track new releases",
    href: "https://github.com/freroxx/toolz",
  },
  {
    icon: GitPullRequest,
    title: "Contribute",
    desc: "Open an issue or submit a pull request — GPLv3",
    href: "https://github.com/freroxx/toolz/issues",
  },
];

const Discord = () => {
  return (
    <section
      id="discord"
      className="scroll-mt-20 py-16 md:py-24"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Left — editorial copy */}
          <div
            className="flex flex-col justify-between gap-8 border p-6 md:p-9"
            style={{
              borderRadius: SHAPES.bouncy,
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

          {/* Right — single card with 3 divider rows */}
          <ExpressiveCard
            shape={SHAPES.extraLarge}
            style={{
              background: "hsl(var(--md-surface-container))",
              border: "1px solid hsl(var(--md-outline-variant) / 0.35)",
              padding: 0,
            }}
          >
            {links.map(({ icon: Icon, title, desc, href }, i) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 2 }}
                transition={PRESS_SPRING}
                className="group flex items-center gap-4 p-5 transition-colors"
                style={{
                  color: "hsl(var(--md-on-surface))",
                  borderBottom:
                    i < links.length - 1
                      ? "1px solid hsl(var(--md-outline-variant) / 0.3)"
                      : "none",
                }}
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px]"
                  style={{
                    background: "hsl(var(--md-surface-container-high))",
                    color: "hsl(var(--md-on-surface-variant))",
                  }}
                >
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m3-title-small font-bold leading-tight text-on-surface">{title}</p>
                  <p className="m3-body-small mt-0.5 text-on-surface-variant opacity-80">{desc}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 opacity-40 transition-opacity group-hover:opacity-70"
                />
              </motion.a>
            ))}
          </ExpressiveCard>
        </div>
      </div>
    </section>
  );
};

export default Discord;
