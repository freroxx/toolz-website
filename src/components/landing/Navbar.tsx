import { useState, useEffect } from "react";
import { Menu, X, Github, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Tools", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Gallery", href: "#gallery" },
  { label: "Log", href: "#how-it-works" },
  { label: "Node", href: "#discord" },
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-black/90 border-b border-white/10 py-3" : "bg-transparent py-6"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 border-2 border-primary flex items-center justify-center text-primary font-mono font-black text-xl group-hover:bg-primary group-hover:text-black transition-all duration-300">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-none">
                Toolz<span className="text-primary">_</span>
              </span>
              <span className="text-technical text-white/40 leading-none mt-1">v1.0.7</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-6 py-2 text-technical text-white/50 hover:text-primary hover:bg-white/5 transition-all"
              >
                [{link.label}]
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a 
              href="https://github.com/freroxx/toolz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/freroxx/toolz/releases" 
              className="font-mono uppercase text-[10px] font-black border border-primary px-4 py-2 text-primary hover:bg-primary hover:text-black transition-all"
            >
              Init_Download
            </a>
          </div>

          <button 
            className="md:hidden p-2 text-primary border border-primary/20" 
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10"
          >
            <div className="flex flex-col p-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-4 text-technical text-white/60 hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-6 flex flex-col gap-4">
                <a 
                  href="https://github.com/freroxx/toolz/releases" 
                  className="btn-technical text-center"
                >
                  Download_APK
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
