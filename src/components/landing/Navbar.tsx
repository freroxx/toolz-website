import { useState, useEffect, useRef } from "react";
import { Menu, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useLatestRelease } from "@/hooks/use-latest-release";
import ThemeButton, { QuickModeToggle } from "@/components/theme/ThemeButton";
import ThemeDialog from "@/components/theme/ThemeDialog";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import { PRESS_SPRING, INDICATOR_SPRING } from "@/lib/motion";
import { useBouncyClick } from "@/components/expressive/useBouncyClick";

const navLinks = [
  { label: "Tools", href: "/#features" },
  { label: "Downloadz", href: "/#downloadz" },
  { label: "Specs", href: "/spec" },
  { label: "News", href: "/news" },
  { label: "Community", href: "/#discord" },
];

const Navbar = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const { versionName } = useLatestRelease();
  const { activeSkin } = useSkin();
  const logoMotion = useBouncyClick();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus management for mobile drawer
  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => firstLinkRef.current?.focus(), 50);
    } else {
      hamburgerRef.current?.focus();
    }
  }, [mobileOpen]);

  // Active section tracker
  useEffect(() => {
    if (location.pathname !== "/") return;
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
      if (href.startsWith("/#")) {
        const id = href.replace("/", "");
        const el = document.querySelector(id);
        if (el) observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [location]);

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
            <Link to="/" aria-label="Toolz home">
              <motion.div
                {...logoMotion}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-10 h-10 rounded-[22%] overflow-hidden m3-surface-container-high flex items-center justify-center p-1.5 shadow-lg shadow-black/20">
                  <SkinIcon skin={activeSkin} size={28} />
                </div>
                <div className="flex flex-col leading-none">
                  <span
                    className="m3-title-medium font-bold tracking-tight"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    Toolz
                  </span>
                  <span className="m3-label-small" style={{ color: "hsl(var(--md-primary-ink))" }}>
                    v{versionName}
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Nav with M3 indicator pill — always rendered, opacity animated */}
            <div className="hidden lg:flex items-center gap-1 relative">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.href ||
                  (location.pathname === "/" &&
                    activeHref === link.href.replace("/", ""));
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="relative px-5 py-2 rounded-full m3-label-large transition-colors duration-200 group"
                    style={{
                      color: isActive
                        ? "hsl(var(--md-on-secondary-container))"
                        : "hsl(var(--md-on-surface-variant))",
                      zIndex: 1,
                    }}
                  >
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "hsl(var(--md-secondary-container))" }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={INDICATOR_SPRING}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA — quick theme toggle + skin studio + download */}
            <div className="hidden lg:flex items-center gap-2.5">
              <QuickModeToggle />
              <ThemeButton onClick={() => setThemeOpen(true)} />
              <motion.button
                onClick={onDownloadClick}
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -1 }}
                transition={PRESS_SPRING}
                className="m3-btn-filled h-9 px-5 text-sm gap-2 shadow-xs"
                aria-label={`Download Toolz v${versionName}`}
              >
                <Download size={16} />
                Download
              </motion.button>
            </div>

            {/* Mobile trigger */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <QuickModeToggle />
              <ThemeButton onClick={() => setThemeOpen(true)} />
              <button
                ref={hamburgerRef}
                className="w-10 h-10 flex items-center justify-center rounded-full m3-state-layer"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
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
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "hsl(var(--md-scrim) / 0.5)" }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 lg:hidden w-80 flex flex-col"
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
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[20%]"
                    style={{ background: "hsl(var(--md-surface-container-high))" }}
                  >
                    <SkinIcon skin={activeSkin} size={26} />
                  </div>
                  <div className="flex flex-col">
                    <span className="m3-title-medium font-bold" style={{ color: "hsl(var(--md-on-surface))" }}>
                      Toolz
                    </span>
                    <span className="m3-label-small" style={{ color: "hsl(var(--md-primary-ink))" }}>
                      v{versionName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <QuickModeToggle />
                  <ThemeButton onClick={() => { setMobileOpen(false); setThemeOpen(true); }} />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full m3-state-layer"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Drawer links */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {navLinks.map((link, i) => {
                  const isActive =
                    location.pathname === link.href ||
                    (location.pathname === "/" &&
                      activeHref === link.href.replace("/", ""));
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      ref={i === 0 ? firstLinkRef : undefined}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-full mb-1 m3-title-medium transition-colors"
                      style={{
                        background: isActive
                          ? "hsl(var(--md-secondary-container))"
                          : "transparent",
                        color: isActive
                          ? "hsl(var(--md-on-secondary-container))"
                          : "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      <motion.span
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 35 }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  );
                })}
              </div>

              {/* Drawer footer CTA */}
              <div
                className="p-6 flex flex-col gap-3 border-t"
                style={{ borderColor: "hsl(var(--md-outline-variant))" }}
              >
                <motion.button
                  onClick={() => { setMobileOpen(false); onDownloadClick(); }}
                  whileTap={{ scale: 0.95 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled w-full justify-center py-3 text-sm gap-2"
                >
                  <Download size={16} />
                  Download v{versionName}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ThemeDialog open={themeOpen} onOpenChange={setThemeOpen} />
    </>
  );
};

export default Navbar;
