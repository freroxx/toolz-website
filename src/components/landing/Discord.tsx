import { MessageSquare, ExternalLink, Star, GitPullRequest, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES } from "@/components/expressive/shapes";

const links = [
  {
    icon: MessageSquare,
    title: "Discord server",
    desc: "Bug reports, feature requests and community skins",
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
    desc: "Open an issue or submit a pull request",
    href: "https://github.com/freroxx/toolz/issues",
  },
];

const Discord = () => (
  <section
    id="discord"
    className="scroll-mt-20 py-20 md:py-28"
    style={{ background: "hsl(var(--md-surface-container-low))" }}
  >
    <div className="container mx-auto px-4">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p
            className="m3-label-large font-semibold uppercase tracking-[0.14em]"
            style={{ color: "hsl(var(--md-primary-ink))" }}
          >
            Community
          </p>
          <h2 className="m3-display-small mt-3 text-balance font-bold text-on-surface">
            Join the conversation.
          </h2>
          <p className="m3-body-large mt-4 max-w-md text-pretty text-on-surface-variant">
            Ask for help, share skins, report bugs and follow what's coming next, directly with the
            developers on Discord and GitHub.
          </p>

          <motion.a
            href="https://discord.gg/aAswRUerwh"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.96 }}
            transition={PRESS_SPRING}
            className="m3-btn-filled mt-8 inline-flex gap-2.5 px-7 py-4 font-semibold"
          >
            <MessageSquare size={18} />
            Join Discord
            <ExternalLink size={13} className="opacity-70" />
          </motion.a>
        </div>

        <div
          className="overflow-hidden"
          style={{
            borderRadius: SHAPES.extraLarge,
            background: "hsl(var(--md-surface-container))",
          }}
        >
          {links.map(({ icon: Icon, title, desc, href }, i) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 transition-colors hover:bg-surface-container-high"
              style={{
                color: "hsl(var(--md-on-surface))",
                borderTop: i > 0 ? "1px solid hsl(var(--md-outline-variant) / 0.4)" : "none",
              }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{
                  background: "hsl(var(--md-secondary-container))",
                  color: "hsl(var(--md-on-secondary-container))",
                }}
              >
                <Icon size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m3-title-small font-bold text-on-surface">{title}</p>
                <p className="m3-body-small mt-0.5 text-on-surface-variant">{desc}</p>
              </div>
              <ChevronRight
                size={18}
                className="shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Discord;
