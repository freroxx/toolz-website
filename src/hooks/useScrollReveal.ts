import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Lightweight scroll-reveal hook.
 * Returns a ref to attach to the container and a boolean for visibility.
 * Fires once — elements stay revealed after scrolling past.
 */
export function useScrollReveal(amount: number = 0.2) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });
  return { ref, isInView };
}
