import { motion } from "framer-motion";
import { Zap, Shield, Cpu } from "lucide-react";

const StatusPill = () => {
  return (
    <div className="fixed bottom-8 left-8 z-[60] pointer-events-none hidden sm:block">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-black border border-white/20 px-6 py-3 flex items-center gap-6 shadow-2xl pointer-events-auto cursor-default group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest leading-none">BETA_v1.0.7</span>
            <span className="text-[8px] font-mono text-white/20 uppercase mt-1">Status: Operational</span>
          </div>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center group-hover:text-primary transition-colors">
            <Shield className="w-3 h-3 text-white/20 group-hover:text-primary transition-all" />
            <span className="text-[6px] font-mono mt-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Secure</span>
          </div>
          <div className="flex flex-col items-center group-hover:text-primary transition-colors">
            <Zap className="w-3 h-3 text-white/20 group-hover:text-primary transition-all" />
            <span className="text-[6px] font-mono mt-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Free</span>
          </div>
          <div className="flex flex-col items-center group-hover:text-primary transition-colors">
            <Cpu className="w-3 h-3 text-white/20 group-hover:text-primary transition-all" />
            <span className="text-[6px] font-mono mt-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Core</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusPill;
