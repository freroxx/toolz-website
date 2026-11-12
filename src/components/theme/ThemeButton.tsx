import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import { PRESS_SPRING } from "@/lib/motion";

/**
 * Direct 1-click Light / Dark toggle affordance.
 * Rotates smoothly between Sun and Moon.
 */
export const QuickModeToggle = ({ className }: { className?: string }) => {
  const { resolvedMode, toggleMode } = useSkin();
  const isDark = resolvedMode === "DARK";

  return (
    <motion.button
      type="button"
      onClick={toggleMode}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={PRESS_SPRING}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
        "border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface",
        className
      )}
    >
      <motion.span
        key={resolvedMode}
        initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </motion.span>
    </motion.button>
  );
};

/**
 * Navbar affordance showing the active skin's launcher icon.
 * Opens the Theme & Skin studio sheet.
 */
const ThemeButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => {
  const { activeSkin } = useSkin();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -1 }}
      transition={PRESS_SPRING}
      aria-haspopup="dialog"
      aria-label={`Theme & Skins: ${activeSkin.name}. Open theme picker`}
      title={`Skin: ${activeSkin.name} — Open theme studio`}
      className={cn(
        "group relative flex h-9 items-center gap-2 rounded-full border px-2.5 transition-colors",
        "border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface",
        className
      )}
    >
      <motion.span
        key={activeSkin.id}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="flex items-center justify-center"
      >
        <SkinIcon skin={activeSkin} size={20} />
      </motion.span>
      <span className="hidden sm:inline text-[13px] font-medium text-on-surface-variant group-hover:text-on-surface">
        {activeSkin.name}
      </span>
    </motion.button>
  );
};

export default ThemeButton;
