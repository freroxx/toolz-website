import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * M3 Expressive loading indicator: three dots in a wave sequence.
 * Used for route transitions and lazy boundaries instead of a spinner.
 */
const LoadingIndicator = ({ className }: { className?: string }) => (
  <div
    className={cn("flex items-center justify-center gap-2", className)}
    role="status"
    aria-label="Loading"
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="block w-2.5 h-2.5 rounded-full bg-primary"
        animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
      />
    ))}
  </div>
);

export default LoadingIndicator;
