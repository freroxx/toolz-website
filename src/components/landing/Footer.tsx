import { Github, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 border-2 border-primary flex items-center justify-center text-primary font-mono font-black italic">
                T
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">
                Toolz<span className="text-primary">_</span>
              </span>
            </div>
            <p className="text-sm font-mono text-white/40 leading-relaxed">
              A high-precision utility suite for Android. Engineered for operators who value speed, privacy, and technical clarity.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div className="flex flex-col gap-6">
              <span className="text-technical text-primary">Access</span>
              <a href="https://github.com/freroxx/toolz/releases" className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase">Download_APK</a>
              <a href="https://github.com/freroxx/toolz" className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase">Source_Repo</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-technical text-primary">Node</span>
              <a href="https://discord.gg/aAswRUerwh" className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase">Discord_Server</a>
              <a href="#" className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase">Status_Page</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-technical text-primary">Protocol</span>
              <a href="#" className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase">Privacy_v1</a>
              <a href="#" className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase">License_MIT</a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-technical text-white/20">
            © 2026 Toolz_Project // All_Systems_Operational
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/freroxx/toolz" className="text-white/20 hover:text-primary transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://discord.gg/aAswRUerwh" className="text-white/20 hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
