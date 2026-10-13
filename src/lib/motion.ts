/** Shared M3 Expressive spring presets — one tuning for the whole site. */

export const SPRING_BOUNCY = { type: "spring", stiffness: 420, damping: 26, mass: 0.9 } as const;
export const SPRING_STANDARD = { type: "spring", stiffness: 300, damping: 30 } as const;
export const SPRING_SLOW = { type: "spring", stiffness: 220, damping: 24 } as const;
