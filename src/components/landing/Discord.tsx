import { MessageSquare, Users, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const Discord = () => {
  return (
    <section
      id="discord"
      className="py-32 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      {/* Background blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10 pointer-events-none blur-3xl rounded-full"
        style={{ background: "hsl(var(--md-secondary))" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left card */}
          <div
            className="rounded-3xl p-10 flex flex-col justify-between gap-10"
            style={{ background: "hsl(var(--md-surface-container-high))" }}
          >
            <div>
              <div className="m3-chip inline-flex mb-8 gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "hsl(var(--md-secondary))" }}
                />
                Community
              </div>
              <h2
                className="m3-display-small mb-6"
                style={{ color: "hsl(var(--md-on-surface))" }}
              >
                Join the{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--md-secondary)), hsl(var(--md-primary)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  network.
                </span>
              </h2>
              <p
                className="m3-body-large"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
              >
                Connect with other operators, share module configs, report bugs,
                and get direct support from the dev team. Always free.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-6">
              <div
                className="flex-1 flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: "hsl(var(--md-secondary-container))" }}
              >
                <Users size={20} style={{ color: "hsl(var(--md-on-secondary-container))" }} />
                <div>
                  <div className="m3-label-small" style={{ color: "hsl(var(--md-on-secondary-container))" }}>
                    Members
                  </div>
                  <div className="m3-title-medium font-bold" style={{ color: "hsl(var(--md-on-secondary-container))" }}>
                    Online
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://discord.gg/aAswRUerwh"
                target="_blank"
                rel="noopener noreferrer"
                className="m3-fab-extended py-4 flex-1 justify-center gap-3"
              >
                <MessageSquare size={20} />
                Join Discord
                <ExternalLink size={14} style={{ opacity: 0.7 }} />
              </a>
            </div>
          </div>

          {/* Right: Discord widget */}
          <div
            className="rounded-3xl overflow-hidden relative min-h-[480px]"
            style={{
              background: "hsl(var(--md-surface-container))",
              border: "1px solid hsl(var(--md-outline-variant))",
            }}
          >
            {/* Widget header */}
            <div
              className="px-6 py-4 flex items-center gap-3 border-b"
              style={{ borderColor: "hsl(var(--md-outline-variant))" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(var(--md-secondary-container))" }}
              >
                <MessageSquare size={16} style={{ color: "hsl(var(--md-on-secondary-container))" }} />
              </div>
              <span className="m3-label-large" style={{ color: "hsl(var(--md-on-surface))" }}>
                Toolz Discord
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "hsl(var(--md-secondary))" }}
                />
                <span className="m3-label-small" style={{ color: "hsl(var(--md-secondary))" }}>
                  Live
                </span>
              </div>
            </div>

            <div className="absolute inset-0 top-[57px]">
              <iframe
                src="https://discord.com/widget?id=1483976991261724692&theme=dark"
                width="100%"
                height="100%"
                allowTransparency={true}
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                title="Toolz Discord Server"
                className="w-full h-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Discord;
