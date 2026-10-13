import { Github, MessageSquare, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const REPO = "https://github.com/freroxx/toolz";

const columns = [
  {
    title: "Downloads",
    accent: "text-primary",
    hover: "#FF6D00",
    links: [
      { label: "Latest release", href: `${REPO}/releases/latest`, external: true },
      { label: "All releases", href: `${REPO}/releases`, external: true },
      { label: "Download stats", href: "/downloads", external: false },
    ],
  },
  {
    title: "Community",
    accent: "text-secondary",
    hover: "#00BFA5",
    links: [
      { label: "Discord server", href: "https://discord.gg/aAswRUerwh", external: true },
      { label: "Discussions", href: `${REPO}/discussions`, external: true },
      { label: "News", href: "/news", external: false },
    ],
  },
  {
    title: "Project",
    accent: "text-tertiary",
    hover: "hsl(var(--md-tertiary))",
    links: [
      { label: "Source code", href: REPO, external: true },
      { label: "GPL-3.0 license", href: `${REPO}/blob/master/LICENSE`, external: true },
    ],
  },
];

const Footer = () => {
  return (
    <footer
      className="py-24 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-4 mb-6 group cursor-pointer">
              <div className="w-14 h-14 rounded-[22%] bg-primary/10 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-primary/5">
                 <img src="/logo.png" alt="Toolz Logo" className="w-full h-full object-cover scale-[1.6]" />
              </div>
              <span className="m3-headline-medium font-bold group-hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface))" }}>
                Toolz
              </span>
            </div>
            <p className="m3-body-medium leading-relaxed mb-8" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
              A high-precision utility suite for Android. Engineered for privacy, speed, and technical clarity. Zero bloat, zero tracking, zero compromise.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Github, href: "https://github.com/freroxx/toolz", label: "GitHub" },
                { icon: MessageSquare, href: "https://discord.gg/aAswRUerwh", label: "Discord" },
              ].map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{
                    scale: 1.2,
                    y: -6,
                    backgroundColor: "rgba(255, 109, 0, 0.15)",
                    color: "#FF6D00"
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all shadow-lg hover:shadow-primary/30"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <social.icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-6">
                <span className={`m3-label-large font-bold tracking-widest uppercase opacity-20 ${col.accent}`}>{col.title}</span>
                <ul className="flex flex-col gap-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <motion.a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 8, color: col.hover }}
                          className="m3-body-medium opacity-50 hover:opacity-100 transition-all inline-block"
                        >
                          {link.label}
                        </motion.a>
                      ) : (
                        <Link
                          to={link.href}
                          className="m3-body-medium opacity-50 hover:opacity-100 transition-all inline-block hover:text-primary"
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
            className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex flex-col items-center md:items-start gap-2">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="m3-label-medium opacity-40 hover:opacity-100 transition-opacity"
              >
                © 2026 Toolz Project. All rights reserved.
              </motion.div>
              <div className="flex items-center gap-4 m3-label-small opacity-30">
                <span>Built for Android 16</span>
                <div className="w-1 h-1 bg-current rounded-full" />
                <span>Material 3 Expressive</span>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="m3-chip bg-white/5 border-white/10 gap-2 px-4 py-2"
            >
               <Globe size={14} className="text-primary animate-spin-slow" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Available Globally</span>
            </motion.div>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
