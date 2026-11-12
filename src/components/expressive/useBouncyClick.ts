import { PRESS_SPRING } from "@/lib/motion";

/** Port of BouncyClick.kt — spring scale on press + subtle lift on hover */
export function useBouncyClick() {
  return {
    whileTap: { scale: 0.95 },
    whileHover: { y: -2 },
    transition: PRESS_SPRING,
  } as const;
}
