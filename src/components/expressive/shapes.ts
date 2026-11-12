/** M3 Expressive shape scale — border-radius values ported from ExpressiveShapes.kt */
export const SHAPES = {
  bouncy:     "32px",
  squircle:   "28px",
  extraLarge: "48px",
  large:      "36px",
  medium:     "28px",
  small:      "20px",
  // Organic asymmetric shapes
  star:    "60px 16px 60px 16px",
  pebble:  "24px 48px 24px 48px",
  diamond: "48px 24px 48px 24px",
  oval:    "80px 80px 20px 20px",
} as const;

export type ShapeKey = keyof typeof SHAPES;
