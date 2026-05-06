import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Menu, X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Gallery", href: "#gallery" },
  { label: "Why Toolz", href: "#how-it-works" },
  { label: "Community", href: "#discord" },
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
        scrolled ? "py-3" : "py-8"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between px-6 py-3 transition-all duration-500 rounded-[2rem] ${
          scrolled ? "glass-strong shadow-2xl border-white/10" : "bg-transparent border-transparent"
        }`}>
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              T
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
              Toolz<span className="text-primary">.</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-primary transition-all rounded-xl hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a 
              href="https://github.com/freroxx/toolz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Button variant="hero" size="sm" className="rounded-xl px-8 font-black h-12" asChild>
              <a href="https://github.com/freroxx/toolz/releases" target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          </div>

          <button 
            className="md:hidden p-3 text-foreground glass rounded-2xl border-white/10" 
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 mx-4 mt-4 glass-strong border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
          >
            <div className="flex flex-col gap-2 p-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-6 py-4 text-xl font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-6 flex flex-col gap-4">
                <Button variant="hero" size="lg" className="w-full rounded-[1.5rem] h-16 font-black text-lg" asChild>
                  <a href="https://github.com/freroxx/toolz/releases" target="_blank" rel="noopener noreferrer">
                    <Download className="w-5 h-5 mr-2" />
                    Download APK
                  </a>
                </Button>
                <a 
                  href="https://github.com/freroxx/toolz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-5 text-white/60 font-black uppercase tracking-widest hover:text-white transition-colors glass rounded-[1.5rem]"
                >
                  <Github className="w-5 h-5" />
                  Source Code
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
