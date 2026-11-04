import { useEffect, useState } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

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
            className="flex flex-col justify-between gap-8 rounded-[32px] p-6 md:rounded-[40px] md:p-10"
            style={{ background: "hsl(var(--md-secondary-container))" }}
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
                className="m3-display-small mt-5 text-balance"
                style={{ color: "hsl(var(--md-on-secondary-container))" }}
              >
                Join the Discord.
              </h2>
              <p
                className="m3-body-large mt-3 max-w-md"
                style={{ color: "hsl(var(--md-on-secondary-container) / 0.8)" }}
              >
                Get help, report bugs and follow development. Reports with steps
                to reproduce get fixed fastest.
              </p>
            </div>

            <div
              className="flex items-center gap-3 rounded-[20px] p-4"
              style={{ background: "hsl(var(--md-secondary) / 0.14)" }}
            >
              <MessageSquare
                size={20}
                style={{ color: "hsl(var(--md-on-secondary-container))" }}
              />
              <div>
                <p
                  className="m3-label-small opacity-90"
                  style={{ color: "hsl(var(--md-on-secondary-container))" }}
                >
                  Support
                </p>
                <p
                  className="m3-title-small"
                  style={{ color: "hsl(var(--md-on-secondary-container))" }}
                >
                  Direct from the dev team
                </p>
              </div>
            </div>

            <a
              href="https://discord.gg/aAswRUerwh"
              target="_blank"
              rel="noopener noreferrer"
              className="m3-btn-filled w-full justify-center gap-3 py-4 sm:w-auto sm:self-start"
            >
              <MessageSquare size={20} />
              Join Discord
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>

          {/* Right: live widget */}
          <div
            className="relative min-h-[420px] overflow-hidden rounded-[32px] md:rounded-[40px]"
            style={{ background: "hsl(var(--md-surface-container))" }}
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
