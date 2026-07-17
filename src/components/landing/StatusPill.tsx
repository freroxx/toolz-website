import { motion } from "framer-motion";

const StatusPill = () => {
  return (
    <div className="fixed bottom-8 left-8 z-[60] pointer-events-none hidden sm:block">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-black border border-white/20 px-6 py-3 flex items-center shadow-2xl pointer-events-auto cursor-default group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest leading-none">BETA_v1.0.9</span>
            <span className="text-[8px] font-mono text-white/20 uppercase mt-1">Status: Operational</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusPill;
