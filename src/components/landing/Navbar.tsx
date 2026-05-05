import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Menu, X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Gallery", href: "#gallery" },
  { label: "Why Toolz", href: "#how-it-works" },
  { label: "Community", href: "#community" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3 glass-strong shadow-lg shadow-background/50" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">Toolz</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a 
            href="https://github.com/freroxx/toolz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <Button variant="hero" size="sm" className="rounded-full px-6" asChild>
            <a href="https://github.com/freroxx/toolz/releases" target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Get Toolz
            </a>
          </Button>
        </div>

        <button 
          className="md:hidden p-2 text-foreground glass rounded-lg" 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border/30 overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Button variant="hero" size="lg" className="w-full rounded-xl" asChild>
                  <a href="https://github.com/freroxx/toolz/releases" target="_blank" rel="noopener noreferrer">
                    <Download className="w-5 h-5" />
                    Download APK
                  </a>
                </Button>
                <a 
                  href="https://github.com/freroxx/toolz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 text-muted-foreground hover:text-foreground transition-colors glass rounded-xl"
                >
                  <Github className="w-5 h-5" />
                  View Source
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
