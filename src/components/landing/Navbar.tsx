import { useState, useEffect, useRef } from "react";
import { Menu, X, Download, Github } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useUpdateManifest } from "@/hooks/use-update-manifest";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Gallery", href: "#gallery" },
  { label: "Community", href: "#discord" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { versionName, bestRelease, releasesPageUrl } = useUpdateManifest();

  const downloadUrl = bestRelease?.downloadUrl ?? releasesPageUrl;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracker
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navLinks.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
        style={{
          background: scrolled
            ? "hsl(var(--md-surface-container) / 0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled
            ? "1px solid hsl(var(--md-outline-variant) / 0.5)"
            : "1px solid transparent",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-3 group"
              aria-label="Toolz home"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden m3-surface-container-high flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Toolz"
                  className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="font-display font-bold text-lg tracking-tight"
                  style={{ color: "hsl(var(--md-on-surface))" }}
                >
                  Toolz
                </span>
                <span className="m3-label-small" style={{ color: "hsl(var(--md-primary))" }}>
                  v{versionName} BETA
                </span>
              </div>
            </a>

            {/* Desktop Nav with M3 indicator pill */}
            <div ref={navRef} className="hidden md:flex items-center gap-1 relative">
              {navLinks.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-2 rounded-full m3-label-large transition-colors duration-200"
                    style={{
                      color: isActive
                        ? "hsl(var(--md-on-secondary-container))"
                        : "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "hsl(var(--md-secondary-container))" }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://github.com/freroxx/toolz"
                target="_blank"
                rel="noopener noreferrer"
                className="m3-btn-outlined h-9 px-4 text-sm gap-2"
                aria-label="View source on GitHub"
              >
                <Github size={16} />
                Source
              </a>
              <a
                href={downloadUrl}
                className="m3-btn-filled h-9 px-5 text-sm gap-2"
                aria-label={`Download Toolz v${versionName}`}
              >
                <Download size={16} />
                Download
              </a>
            </div>

            {/* Mobile trigger */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full m3-state-layer"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "hsl(var(--md-scrim) / 0.5)" }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 md:hidden w-80 flex flex-col"
              style={{
                background: "hsl(var(--md-surface-container))",
                boxShadow: "-4px 0 24px hsl(var(--md-shadow) / 0.4)",
              }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: "hsl(var(--md-outline-variant))" }}
              >
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Toolz" className="w-8 h-8 object-contain" />
                  <div className="flex flex-col">
                    <span className="m3-title-medium font-bold" style={{ color: "hsl(var(--md-on-surface))" }}>
                      Toolz
                    </span>
                    <span className="m3-label-small" style={{ color: "hsl(var(--md-primary))" }}>
                      v{versionName} BETA
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full m3-state-layer"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer links */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {navLinks.map((link, i) => {
                  const isActive = activeHref === link.href;
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 35 }}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-full mb-1 m3-title-medium transition-colors"
                      style={{
                        background: isActive ? "hsl(var(--md-secondary-container))" : "transparent",
                        color: isActive
                          ? "hsl(var(--md-on-secondary-container))"
                          : "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {link.label}
                    </motion.a>
                  );
                })}
              </div>

              {/* Drawer footer CTAs */}
              <div
                className="p-6 flex flex-col gap-3 border-t"
                style={{ borderColor: "hsl(var(--md-outline-variant))" }}
              >
                <a
                  href={downloadUrl}
                  className="m3-btn-filled w-full justify-center py-3 text-sm gap-2"
                >
                  <Download size={16} />
                  Download v{versionName}
                </a>
                <a
                  href="https://github.com/freroxx/toolz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m3-btn-outlined w-full justify-center py-3 text-sm gap-2"
                >
                  <Github size={16} />
                  View Source
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
