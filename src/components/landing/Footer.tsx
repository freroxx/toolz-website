import { Github, MessageSquare, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { totalTools } from "@/lib/tools-catalog";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import { useBouncyClick } from "@/components/expressive/useBouncyClick";

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
  const { activeSkin } = useSkin();
  const logoMotion = useBouncyClick();

  return (
    <footer
      className="py-14 md:py-20"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm">
            <Link to="/" aria-label="Toolz home">
              <motion.div {...logoMotion} className="inline-flex items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center overflow-hidden rounded-[16px] p-2"
                  style={{ background: "hsl(var(--md-surface-container-high))" }}
                >
                  <SkinIcon skin={activeSkin} size={32} />
                </span>
                <span className="m3-headline-small text-on-surface">Toolz</span>
              </motion.div>
            </Link>
            <p className="m3-body-medium mt-5 text-on-surface-variant">
              {totalTools} tools in one Android app. Free, open source, and built to keep your data on
              your device.
            </p>
            <div className="mt-6 flex items-center gap-1">
              {[
                { icon: Github, href: REPO, label: "GitHub" },
                { icon: MessageSquare, href: "https://discord.gg/aAswRUerwh", label: "Discord" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-14 lg:gap-20">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="m3-label-large font-semibold text-on-surface">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="m3-body-medium inline-flex items-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                          {link.label}
                          <ArrowUpRight size={13} className="opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="m3-body-medium text-on-surface-variant transition-colors hover:text-on-surface"
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
          <p className="m3-label-medium text-on-surface-variant">© 2026 Toolz Project</p>
          <p className="m3-label-medium text-on-surface-variant">
            Android 12+ · GPL-3.0 · No ads, no tracking
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
