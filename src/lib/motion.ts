/** Shared M3 Expressive spring presets. */

// Fast spatial — buttons, chips, small components (M3 Expressive Fast Spatial)
export const SPRING_BOUNCY = { type: "spring", stiffness: 800, damping: 20, mass: 0.8 } as const;
// Default spatial — mid-sized containers, cards
export const SPRING_STANDARD = { type: "spring", stiffness: 380, damping: 28 } as const;
// Slow spatial — large layout transitions, page elements
export const SPRING_SLOW = { type: "spring", stiffness: 200, damping: 24 } as const;

// Press interaction: compress then bounce back past 1.0
export const PRESS_SPRING = { type: "spring", stiffness: 800, damping: 15, mass: 0.8 } as const;
