import { motion } from "framer-motion";
import { Zap, Shield, Cpu } from "lucide-react";

const StatusPill = () => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: "circOut" }}
        className="glass-strong px-6 py-3 rounded-full flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 pointer-events-auto hover:scale-105 transition-transform cursor-default"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">System Live</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-4">
          <Zap className="w-4 h-4 text-primary" />
          <Shield className="w-4 h-4 text-accent" />
          <Cpu className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">v1.0.7</span>
      </motion.div>
    </div>
  );
};

export default StatusPill;
