import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";

/**
 * Navbar affordance showing the active skin's launcher icon. Opens the theme
 * sheet (rendered once by <Navbar>). The icon is keyed by skin id so picking a
 * new look visibly swaps the mark instead of silently repainting it.
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
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`Theme: ${activeSkin.name}. Open theme picker`}
      title={`Theme — ${activeSkin.name}`}
      className={cn(
        "group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-on-surface/[0.08] active:scale-90",
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
        <SkinIcon skin={activeSkin} size={24} />
      </motion.span>
    </button>
  );
};

export default ThemeButton;
