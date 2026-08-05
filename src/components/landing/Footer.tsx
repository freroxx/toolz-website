import { Github, MessageSquare, Twitter, Globe } from "lucide-react";
import { motion } from "framer-motion";

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
              <div className="w-14 h-14 rounded-[16px] bg-primary/10 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-primary/5">
                 <img src="/logo.png" alt="Toolz Logo" className="w-full h-full object-cover" />
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
                { icon: Github, href: "https://github.com/freroxx/toolz" },
                { icon: MessageSquare, href: "https://discord.gg/aAswRUerwh" },
                { icon: Twitter, href: "#" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary shadow-sm hover:shadow-primary/20"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                >
                  <social.icon size={22} />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
            <div className="flex flex-col gap-4">
              <span className="m3-label-large font-bold tracking-widest uppercase opacity-50" style={{ color: "hsl(var(--md-primary))" }}>Downloads</span>
              <ul className="flex flex-col gap-3">
                {["Latest Releases", "Source Code", "Changelog"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="m3-body-medium hover:text-primary transition-all hover:translate-x-1 inline-block"
                      style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <span className="m3-label-large font-bold tracking-widest uppercase opacity-50" style={{ color: "hsl(var(--md-secondary))" }}>Community</span>
              <ul className="flex flex-col gap-3">
                {["Discord Server", "Discussions", "App Status"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="m3-body-medium hover:text-secondary transition-all hover:translate-x-1 inline-block"
                      style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <span className="m3-label-large font-bold tracking-widest uppercase opacity-50" style={{ color: "hsl(var(--md-tertiary))" }}>Legal</span>
              <ul className="flex flex-col gap-3">
                {["Privacy Policy", "GPL License"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="m3-body-medium hover:text-tertiary transition-all hover:translate-x-1 inline-block"
                      style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div
          className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8"
          style={{ borderColor: "hsl(var(--md-outline-variant) / 0.5)" }}
        >
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="m3-label-medium" style={{ color: "hsl(var(--md-on-surface-variant) / 0.6)" }}>
              © 2026 Toolz Project. All rights reserved.
            </div>
            <div className="flex items-center gap-4 m3-label-small" style={{ color: "hsl(var(--md-on-surface-variant) / 0.4)" }}>
              <span>Built for Android 16</span>
              <div className="w-1 h-1 bg-current rounded-full opacity-20" />
              <span>Material 3 Expressive</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="m3-chip bg-surface-container border-outline-variant/30 gap-2">
               <Globe size={12} className="text-primary" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Distributed Globally</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
