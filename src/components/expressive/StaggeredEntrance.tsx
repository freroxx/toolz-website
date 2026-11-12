import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ENTRANCE_SPRING } from "@/lib/motion";

interface Props {
  index: number;
  children: ReactNode;
  className?: string;
}

/**
 * Port of ExpressiveAnimations.kt staggered entrance.
 * Wrap each item in its own StaggeredEntrance with a sequential index.
 */
export function StaggeredEntrance({ index, children, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...ENTRANCE_SPRING, delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}
