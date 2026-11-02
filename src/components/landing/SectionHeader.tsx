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
 * Shared section header: a tonal assist chip, expressive display type and
 * supporting copy. Left-aligned by default so sections read as a continuous
 * page rather than a stack of centred marketing blocks.
 */
const SectionHeader = ({
  chip,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ type: "spring", stiffness: 200, damping: 26 }}
    className={cn(
      "mb-10 md:mb-14",
      align === "center" ? "text-center" : "text-left",
      className
    )}
  >
    <div
      className="m3-chip inline-flex border-transparent"
      style={{
        background: "hsl(var(--md-secondary-container))",
        color: "hsl(var(--md-on-secondary-container))",
      }}
    >
      {chip}
    </div>
    <h2 className="m3-display-small mt-5 text-balance text-on-surface">{title}</h2>
    {description && (
      <p
        className={cn(
          "m3-body-large mt-3 text-on-surface-variant md:mt-4",
          align === "center" ? "mx-auto max-w-xl" : "max-w-2xl"
        )}
      >
        {description}
      </p>
    )}
  </motion.div>
);

export default SectionHeader;
