import { cn } from "@/lib/utils";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";

/**
 * Small navbar affordance showing the active skin's launcher icon.
 * Opens the theme sheet (rendered once by <Navbar>).
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
        "group relative flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-90",
        className
      )}
      style={{
        borderColor: "hsl(var(--md-outline-variant) / 0.55)",
        background: "hsl(var(--md-surface-container-low) / 0.6)",
      }}
    >
      <SkinIcon
        skin={activeSkin}
        size={23}
        className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110"
      />
    </button>
  );
};

export default ThemeButton;
