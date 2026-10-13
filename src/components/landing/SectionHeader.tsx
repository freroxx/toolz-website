import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  chip: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

/**
 * One consistent M3 section header for the whole site: assist chip,
 * headline-large (display type is reserved for the hero), supporting text.
 * Replaces the per-section hand-rolled variants that each screamed
 * display-size with gradient spans.
 */
const SectionHeader = ({
  chip,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ type: "spring", stiffness: 200, damping: 25 }}
    className={cn(
      "mb-10 md:mb-14",
      align === "center" ? "text-center" : "text-left",
      className
    )}
  >
    <div className="m3-chip inline-flex mb-4 md:mb-5">{chip}</div>
    <h2 className="m3-headline-large text-on-surface text-balance">{title}</h2>
    {description && (
      <p
        className={cn(
          "m3-body-large text-on-surface-variant mt-3 md:mt-4",
          align === "center" ? "max-w-xl mx-auto" : "max-w-2xl"
        )}
      >
        {description}
      </p>
    )}
  </motion.div>
);

export default SectionHeader;
