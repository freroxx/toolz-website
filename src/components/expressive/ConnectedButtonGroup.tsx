import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GroupItem {
  id: string;
  label: ReactNode;
}

interface Props {
  items: GroupItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

const BTN_SPRING = { type: "spring", damping: 18, stiffness: 450 } as const;

/**
 * Port of ToolzConnectedButtonGroup from ExpressiveButtonGroup.kt.
 * Horizontal connected toggle buttons with M3 Expressive border-radius shaping:
 * leading = rounded left, middle = small, trailing = rounded right.
 */
export function ConnectedButtonGroup({ items, activeId, onSelect, className }: Props) {
  return (
    <div
      className={className}
      role="tablist"
      style={{ display: "inline-flex", gap: "2px" }}
    >
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const isActive = item.id === activeId;
        const borderRadius = isFirst
          ? "20px 8px 8px 20px"
          : isLast
          ? "8px 20px 20px 8px"
          : "8px";

        return (
          <motion.button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(item.id)}
            whileTap={{ scale: 0.95 }}
            transition={BTN_SPRING}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius,
              border: "1px solid",
              borderColor: isActive
                ? "transparent"
                : "hsl(var(--md-outline-variant))",
              background: isActive
                ? "hsl(var(--md-primary-container))"
                : "hsl(var(--md-surface-container))",
              color: isActive
                ? "hsl(var(--md-on-primary-container))"
                : "hsl(var(--md-on-surface-variant))",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
          >
            {item.label}
          </motion.button>
        );
      })}
    </div>
  );
}
