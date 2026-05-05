import { Github, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gradient text-xl">Toolz</span>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Toolz. All rights reserved.
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-center md:text-left">
              Next-gen Android toolkit combining 30+ precision instruments into a single Compose-first experience.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community</span>
              <div className="flex items-center gap-6">
                <a
                  href="https://discord.gg/aAswRUerwh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Discord
                </a>
                <a
                  href="https://github.com/freroxx/toolz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          <div className="flex gap-4">
            <a href="https://github.com/freroxx/toolz/releases" className="hover:text-foreground transition-colors">Latest APK (1.0.7)</a>
            <a href="https://github.com/freroxx/toolz" className="hover:text-foreground transition-colors">Build from Source</a>
          </div>
          <div>
            Built with Kotlin & Jetpack Compose
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
