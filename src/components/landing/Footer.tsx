import { Github, MessageSquare, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { totalTools } from "@/lib/tools-catalog";

const REPO = "https://github.com/freroxx/toolz";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Tool catalog", href: "/#features", external: false },
      { label: "Downloadz", href: "/#downloadz", external: false },
      { label: "Spec catalog", href: "/spec", external: false },
      { label: "News", href: "/news", external: false },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord server", href: "https://discord.gg/aAswRUerwh", external: true },
      { label: "Discussions", href: `${REPO}/discussions`, external: true },
      { label: "Download stats", href: "/downloads", external: false },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Source code", href: REPO, external: true },
      { label: "Latest release", href: `${REPO}/releases/latest`, external: true },
      { label: "GPL-3.0 license", href: `${REPO}/blob/master/LICENSE`, external: true },
    ],
  },
];

const Footer = () => {
  return (
    <footer
      className="py-14 md:py-20"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3" aria-label="Toolz home">
              <span
                className="grid h-12 w-12 place-items-center overflow-hidden rounded-[16px]"
                style={{ background: "hsl(var(--md-surface-container-high))" }}
              >
                <img
                  src="/logo.png"
                  alt=""
                  className="h-full w-full scale-[1.6] object-cover"
                />
              </span>
              <span className="m3-headline-small text-on-surface">Toolz</span>
            </Link>
            <p className="m3-body-small mt-5 text-on-surface-variant">
              {totalTools} tools in one Android app. Free, open source, and built
              to keep your data on your device.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Github, href: REPO, label: "GitHub" },
                {
                  icon: MessageSquare,
                  href: "https://discord.gg/aAswRUerwh",
                  label: "Discord",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-20">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="m3-label-medium uppercase tracking-[0.14em] text-on-surface-variant/70">
                  {col.title}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="m3-body-small inline-flex items-center gap-1 text-on-surface-variant transition-colors hover:text-primary"
                        >
                          {link.label}
                          <ArrowUpRight size={13} className="opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="m3-body-small text-on-surface-variant transition-colors hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-12 flex flex-col justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
          style={{ borderColor: "hsl(var(--md-outline-variant) / 0.5)" }}
        >
          <p className="m3-label-small text-on-surface-variant/70">
            © 2026 Toolz Project
          </p>
          <div className="m3-label-small flex items-center gap-3 text-on-surface-variant/70">
            <span>Android 12 and up</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-50" />
            <span>GPL-3.0</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-50" />
            <span>No ads · no tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
