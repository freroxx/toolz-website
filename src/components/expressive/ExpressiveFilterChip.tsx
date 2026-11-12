import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

const CHIP_SPRING = { type: "spring", damping: 16, stiffness: 400 } as const;

/**
 * Port of ExpressiveButtons.kt ExpressiveFilterChip.
 * Selected: primaryContainer bg with scale 1.03. Press: scale 0.94.
 */
export function ExpressiveFilterChip({ selected, onClick, children, className }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{ scale: selected ? 1.03 : 1 }}
      whileTap={{ scale: 0.94 }}
      transition={CHIP_SPRING}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        borderRadius: "9999px",
        border: "1px solid",
        borderColor: selected
          ? "transparent"
          : "hsl(var(--md-outline-variant))",
        background: selected
          ? "hsl(var(--md-secondary-container))"
          : "hsl(var(--md-surface-container-low))",
        color: selected
          ? "hsl(var(--md-on-secondary-container))"
          : "hsl(var(--md-on-surface-variant))",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.1px",
        lineHeight: "18px",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </motion.button>
  );
}
