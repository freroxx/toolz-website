import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES, ShapeKey } from "./shapes";

interface Props extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  shape?: ShapeKey | string;
  onClick?: () => void;
  className?: string;
}

/**
 * Port of ExpressiveCards.kt — M3 filled card with spring press and organic shapes.
 * Default surface: surface-container-high. Default shape: bouncy (32px).
 */
export function ExpressiveCard({ children, shape = "bouncy", onClick, className, style, ...rest }: Props) {
  const radius = shape in SHAPES ? SHAPES[shape as ShapeKey] : shape;

  return (
    <motion.div
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      whileHover={onClick ? { y: -3 } : undefined}
      transition={PRESS_SPRING}
      className={className}
      style={{
        borderRadius: radius,
        background: "hsl(var(--md-surface-container-high))",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
