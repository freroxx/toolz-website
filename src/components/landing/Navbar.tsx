import { useState, useEffect } from "react";
import { Menu, X, Terminal, Download, Cpu, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Modules", href: "#features" },
  { label: "Interface", href: "#showcase" },
  { label: "Audit", href: "#gallery" },
  { label: "Node", href: "#discord" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("features");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Scroll spy logic
      const sections = ["features", "showcase", "gallery", "discord"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-black/95 border-b border-primary/20 py-3" : "bg-transparent py-6"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-4 group">
            <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Toolz Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase leading-none group-hover:animate-glitch">
                Toolz<span className="text-primary">_</span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-technical text-white/40 leading-none uppercase">v1.0.9</span>
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const sectionId = link.href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-6 py-2 text-technical transition-all relative group ${
                    isActive 
                      ? "text-primary bg-primary/10 border-b-2 border-primary" 
                      : "text-white/50 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <span className="relative z-10">[{link.label}]</span>
                  <div className="absolute inset-0 border-x border-primary/0 group-hover:border-primary/20 transition-all" />
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
              <Heart className="w-3 h-3 text-red-500/30" />
              <span>BY_FREROX</span>
            </div>
            <a href="https://github.com/freroxx/toolz/releases" className="btn-technical h-10 px-6">
              Init_Fetch
            </a>
          </div>

          {/* Mobile Trigger */}
          <button 
            className="md:hidden w-12 h-12 flex items-center justify-center text-primary border border-primary/20 bg-black" 
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Mechanical Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 md:hidden bg-black flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Toolz Logo" className="w-8 h-8 object-contain" />
                <span className="text-technical text-primary">SYS_DRAWER_OPEN</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-10 h-10 border border-white/10 flex items-center justify-center text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-blueprint">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group py-6 border-b border-white/5 flex items-center justify-between"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-3xl font-black uppercase tracking-tighter text-white/40 group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    <Terminal className="w-6 h-6 text-white/10 group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
              
              <div className="mt-12 flex flex-col gap-4">
                <a href="https://github.com/freroxx/toolz/releases" className="btn-technical h-16 text-lg">
                  <Download className="w-5 h-5" />
                  Download_Beta
                </a>
                <div className="flex items-center justify-center gap-2 text-technical text-white/20 mt-4">
                  <Heart className="w-4 h-4 text-red-500/40" />
                  <span>MADE_WITH_LOVE_BY_FREROX</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-technical text-white/20">
              <span>STATUS: 1.0.9</span>
              <div className="flex items-center gap-2">
                <span className="text-primary">100% FREE</span>
                <Cpu className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
