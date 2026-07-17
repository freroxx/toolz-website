import { Github, MessageSquare, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Footer = () => {
  const { ref, isInView } = useScrollReveal(0.1);

  return (
    <motion.footer
      ref={ref}
      className="bg-black border-t border-white/10 py-24"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          <div className="max-w-sm">
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo.png" alt="Toolz Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-black tracking-tighter uppercase">
                Toolz<span className="text-primary">_</span>
              </span>
            </div>
            <p className="text-sm font-mono text-white/30 leading-relaxed mb-8">
              A high-precision utility suite for Android. Engineered for operators who value speed, privacy, and technical clarity. 100% Free and Open Source.
            </p>
            <div className="flex items-center gap-3 p-4 border border-white/5 bg-zinc-950/50 hover:border-primary/20 transition-colors duration-500">
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-white/20 uppercase">Developer_Signature</span>
                <span className="text-xs font-mono text-white/60">Made with love by frerox</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div className="flex flex-col gap-6">
              <span className="text-technical text-primary">Deployment</span>
              <a href="https://github.com/freroxx/toolz/releases" className="text-xs font-mono text-white/30 hover:text-primary transition-colors uppercase">Fetch_Beta_APK</a>
              <a href="https://github.com/freroxx/toolz" className="text-xs font-mono text-white/30 hover:text-primary transition-colors uppercase">Source_Control</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-technical text-primary">Network</span>
              <a href="https://discord.gg/aAswRUerwh" className="text-xs font-mono text-white/30 hover:text-primary transition-colors uppercase">Discord_Node</a>
              <a href="#" className="text-xs font-mono text-white/30 hover:text-primary transition-colors uppercase">Status_Audit</a>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-technical text-primary">Legal_Log</span>
              <a href="#" className="text-xs font-mono text-white/30 hover:text-primary transition-colors uppercase">Privacy_Policy</a>
              <a href="#" className="text-xs font-mono text-white/30 hover:text-primary transition-colors uppercase">MIT_License</a>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-technical text-white/20">
              © 2026 Toolz_Project // All_Systems_Operational
            </div>
            <div className="flex items-center gap-4 text-[8px] font-mono text-white/10 uppercase">
              <span>Optimized for Android 15</span>
              <div className="w-1 h-1 bg-white/10 rounded-full" />
              <span>100% Free Utility</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/freroxx/toolz" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/20 hover:text-primary hover:border-primary transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://discord.gg/aAswRUerwh" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/20 hover:text-primary hover:border-primary transition-all">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
