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
  const wasOpen = useRef(false);
  const location = useLocation();
  const { versionName } = useLatestRelease();
  const { activeSkin } = useSkin();
  const logoMotion = useBouncyClick();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drawer focus management. Only restores focus to the hamburger after the
  // drawer has actually been opened, never on first render.
  useEffect(() => {
    if (mobileOpen) {
      wasOpen.current = true;
      const t = setTimeout(() => firstLinkRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      hamburgerRef.current?.focus();
    }
  }, [mobileOpen]);

  // Active section tracker
  useEffect(() => {
    if (location.pathname !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navLinks.forEach(({ href }) => {
      if (href.startsWith("/#")) {
        const el = document.querySelector(href.replace("/", ""));
        if (el) observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [location]);

  const isLinkActive = (href: string) =>
    location.pathname === href ||
    (location.pathname === "/" && activeHref === href.replace("/", ""));

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-50 transition-colors duration-200"
        style={{
          background: scrolled ? "hsl(var(--md-surface-container))" : "hsl(var(--md-surface))",
          borderBottom: `1px solid ${
            scrolled ? "hsl(var(--md-outline-variant) / 0.6)" : "transparent"
          }`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" aria-label="Toolz home">
              <motion.div {...logoMotion} className="flex items-center gap-3">
                <div className="m3-surface-container-high flex h-10 w-10 items-center justify-center overflow-hidden rounded-[22%] p-1.5">
                  <SkinIcon skin={activeSkin} size={28} />
                </div>
                <div className="flex flex-col leading-none">
                  <span
                    className="m3-title-medium font-bold tracking-tight"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    Toolz
                  </span>
                  <span
                    className="m3-label-small mt-0.5"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    v{versionName}
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop nav */}
            <div className="relative hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    aria-current={active ? "page" : undefined}
                    className="m3-label-large relative rounded-full px-5 py-2 transition-colors duration-200"
                    style={{
                      color: active
                        ? "hsl(var(--md-on-secondary-container))"
                        : "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "hsl(var(--md-secondary-container))" }}
                        transition={INDICATOR_SPRING}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <QuickModeToggle />
              <ThemeButton onClick={() => setThemeOpen(true)} />
              <motion.button
                onClick={onDownloadClick}
                whileTap={{ scale: 0.96 }}
                transition={PRESS_SPRING}
                className="m3-btn-filled h-10 gap-2 px-5 text-sm"
                aria-label={`Download Toolz v${versionName}`}
              >
                <Download size={16} />
                Download
              </motion.button>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <QuickModeToggle />
              <ThemeButton onClick={() => setThemeOpen(true)} />
              <button
                ref={hamburgerRef}
                className="m3-state-layer flex h-10 w-10 items-center justify-center rounded-full"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "hsl(var(--md-scrim) / 0.5)" }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-80 max-w-[85vw] flex-col lg:hidden"
              style={{
                background: "hsl(var(--md-surface-container-low))",
                borderRadius: "28px 0 0 28px",
              }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[20%]"
                    style={{ background: "hsl(var(--md-surface-container-high))" }}
                  >
                    <SkinIcon skin={activeSkin} size={26} />
                  </div>
                  <span
                    className="m3-title-medium font-bold"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    Toolz
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="m3-state-layer flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2">
                {navLinks.map((link, i) => {
                  const active = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      ref={i === 0 ? firstLinkRef : undefined}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="m3-title-small mb-1 flex items-center rounded-full px-5 py-3.5 transition-colors"
                      style={{
                        background: active ? "hsl(var(--md-secondary-container))" : "transparent",
                        color: active
                          ? "hsl(var(--md-on-secondary-container))"
                          : "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="p-5">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onDownloadClick();
                  }}
                  className="m3-btn-filled w-full justify-center gap-2 py-3.5 text-sm"
                >
                  <Download size={16} />
                  Download v{versionName}
                </button>
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
