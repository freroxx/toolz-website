import { useEffect, useState } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { PRESS_SPRING } from "@/lib/motion";

const Discord = () => {
  const [widgetTheme, setWidgetTheme] = useState("dark");

  useEffect(() => {
    const read = () =>
      setWidgetTheme(
        document.documentElement.dataset.theme === "light" ? "light" : "dark"
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="discord" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* Left card */}
          <div
            className="flex flex-col justify-between gap-8 rounded-[28px] border p-6 md:p-9 shadow-xs"
            style={{
              background: "hsl(var(--md-secondary-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.4)",
            }}
          >
            <div>
              <span
                className="m3-chip border-transparent shadow-xs"
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
                Join the Discord.
              </h2>
              <p
                className="m3-body-large mt-3 max-w-md leading-relaxed"
                style={{ color: "hsl(var(--md-on-secondary-container) / 0.85)" }}
              >
                Direct access to contributors: get help, report bugs, share skins, and track
                upcoming releases.
              </p>
            </div>

            <div
              className="flex items-center gap-3.5 rounded-[18px] border p-4"
              style={{
                background: "hsl(var(--md-secondary) / 0.12)",
                borderColor: "hsl(var(--md-on-secondary-container) / 0.15)",
              }}
            >
              <MessageSquare
                size={22}
                style={{ color: "hsl(var(--md-on-secondary-container))" }}
              />
              <div>
                <p
                  className="m3-label-small font-medium opacity-85"
                  style={{ color: "hsl(var(--md-on-secondary-container))" }}
                >
                  Direct Support
                </p>
                <p
                  className="m3-title-small font-bold"
                  style={{ color: "hsl(var(--md-on-secondary-container))" }}
                >
                  From developers & power users
                </p>
              </div>
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
              <MessageSquare size={19} />
              Join Discord
              <ExternalLink size={14} className="opacity-80" />
            </motion.a>
          </div>

          {/* Right: live widget */}
          <div
            className="relative min-h-[420px] overflow-hidden rounded-[28px] border shadow-xs"
            style={{
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
          >
            <div
              className="flex items-center gap-3 border-b px-5 py-4"
              style={{ borderColor: "hsl(var(--md-outline-variant) / 0.5)" }}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-[10px]"
                style={{ background: "hsl(var(--md-secondary-container))" }}
              >
                <MessageSquare
                  size={15}
                  style={{ color: "hsl(var(--md-on-secondary-container))" }}
                />
              </span>
              <span className="m3-label-large text-on-surface">Toolz Discord</span>
              <span className="m3-label-small ml-auto inline-flex items-center gap-1.5 text-on-surface-variant">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "hsl(var(--md-secondary))" }}
                />
                Live
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-[57px]">
              <iframe
                src={`https://discord.com/widget?id=1483976991261724692&theme=${widgetTheme}`}
                width="100%"
                height="100%"
                allowTransparency={true}
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                title="Toolz Discord Server"
                className="h-full w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Discord;
