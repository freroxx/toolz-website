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
                { icon: Github, href: "https://github.com/freroxx/toolz" },
                { icon: MessageSquare, href: "https://discord.gg/aAswRUerwh" },
                { icon: Twitter, href: "#" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
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
            <div className="flex flex-col gap-6">
              <span className="m3-label-large font-bold tracking-widest uppercase opacity-20 text-primary">Downloads</span>
              <ul className="flex flex-col gap-4">
                {["Latest Releases", "Source Code", "Changelog"].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 8, color: "#FF6D00" }}
                      className="m3-body-medium opacity-50 hover:opacity-100 transition-all inline-block"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <span className="m3-label-large font-bold tracking-widest uppercase opacity-20 text-secondary">Community</span>
              <ul className="flex flex-col gap-4">
                {["Discord Server", "Discussions", "App Status"].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 8, color: "#00BFA5" }}
                      className="m3-body-medium opacity-50 hover:opacity-100 transition-all inline-block"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <span className="m3-label-large font-bold tracking-widest uppercase opacity-20 text-tertiary">Legal</span>
              <ul className="flex flex-col gap-4">
                {["Privacy Policy", "GPL License"].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 8, color: "hsl(var(--md-tertiary))" }}
                      className="m3-body-medium opacity-50 hover:opacity-100 transition-all inline-block"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
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
