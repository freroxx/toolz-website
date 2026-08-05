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
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <img src="/logo.png" alt="Toolz Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="m3-headline-medium" style={{ color: "hsl(var(--md-on-surface))" }}>
                Toolz
              </span>
            </div>
            <p className="m3-body-medium leading-relaxed mb-8" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
              A high-precision utility suite for Android. Engineered for privacy, speed, and technical clarity. Zero bloat, zero tracking, zero compromise.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/freroxx/toolz"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center transition-colors hover:bg-primary/10 hover:text-primary"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
              >
                <Github size={20} />
              </a>
              <a
                href="https://discord.gg/aAswRUerwh"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center transition-colors hover:bg-primary/10 hover:text-primary"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
              >
                <MessageSquare size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center transition-colors hover:bg-primary/10 hover:text-primary"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
            <div className="flex flex-col gap-4">
              <span className="m3-label-large font-bold" style={{ color: "hsl(var(--md-primary))" }}>Downloads</span>
              <ul className="flex flex-col gap-3">
                <li><a href="https://github.com/freroxx/toolz/releases" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>Latest Releases</a></li>
                <li><a href="https://github.com/freroxx/toolz" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>Source Code</a></li>
                <li><a href="#" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>Changelog</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <span className="m3-label-large font-bold" style={{ color: "hsl(var(--md-secondary))" }}>Community</span>
              <ul className="flex flex-col gap-3">
                <li><a href="https://discord.gg/aAswRUerwh" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>Discord Server</a></li>
                <li><a href="https://github.com/freroxx/toolz/discussions" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>Discussions</a></li>
                <li><a href="#" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>App Status</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <span className="m3-label-large font-bold" style={{ color: "hsl(var(--md-tertiary))" }}>Legal</span>
              <ul className="flex flex-col gap-3">
                <li><a href="#" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>Privacy Policy</a></li>
                <li><a href="#" className="m3-body-small hover:text-primary transition-colors" style={{ color: "hsl(var(--md-on-surface-variant))" }}>GPL License</a></li>
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
