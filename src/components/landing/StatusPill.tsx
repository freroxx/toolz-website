import { motion } from "framer-motion";
import { Zap, Shield, Cpu } from "lucide-react";

const StatusPill = () => {
  return (
    <div className="fixed bottom-8 left-8 z-[60] pointer-events-none">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-black border border-white/20 px-4 py-2 flex items-center gap-4 shadow-2xl pointer-events-auto cursor-default"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
          <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest">Sys_v1.0.7</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-3">
          <Zap className="w-3 h-3 text-white/40" />
          <Shield className="w-3 h-3 text-white/40" />
          <Cpu className="w-3 h-3 text-white/40" />
        </div>
      </motion.div>
    </div>
  );
};

export default StatusPill;
