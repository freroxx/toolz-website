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
 * Section header — chip + display title + optional body copy.
 * No scroll animations: content is immediately visible per M3 Expressive
 * philosophy (motion lives in interactions, not viewport triggers).
 */
const SectionHeader = ({
  chip,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) => (
  <div
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
  </div>
);

export default SectionHeader;
