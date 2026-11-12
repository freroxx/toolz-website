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
 * Section header: quiet eyebrow label, display title, optional body copy.
 * The eyebrow is plain text rather than a pill, so the page isn't a wall of
 * chips. Content is visible immediately; motion lives in interactions.
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
      "mb-10 md:mb-12",
      align === "center" ? "text-center" : "text-left",
      className
    )}
  >
    <p
      className="m3-label-large font-semibold uppercase tracking-[0.14em]"
      style={{ color: "hsl(var(--md-primary-ink))" }}
    >
      {chip}
    </p>
    <h2 className="m3-display-small mt-3 text-balance font-bold text-on-surface">{title}</h2>
    {description && (
      <p
        className={cn(
          "m3-body-large mt-4 text-pretty text-on-surface-variant",
          align === "center" ? "mx-auto max-w-xl" : "max-w-2xl"
        )}
      >
        {description}
      </p>
    )}
  </div>
);

export default SectionHeader;
