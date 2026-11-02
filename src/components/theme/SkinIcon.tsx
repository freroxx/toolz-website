import { useId } from "react";
import type { SiteSkin } from "@/lib/skins";
import { cn } from "@/lib/utils";

const OCTAGON_OUTER =
  "M1015.52,499.73A105.23,105.23,0,0,1,1015.52,580.27L904.72,847.77A105.23,105.23,0,0,1,847.77,904.72L580.27,1015.52A105.23,105.23,0,0,1,499.73,1015.52L232.23,904.72A105.23,105.23,0,0,1,175.28,847.77L64.48,580.27A105.23,105.23,0,0,1,64.48,499.73L175.28,232.23A105.23,105.23,0,0,1,232.23,175.28L499.73,64.48A105.23,105.23,0,0,1,580.27,64.48L847.77,175.28A105.23,105.23,0,0,1,904.72,232.23Z";

const OCTAGON_INNER =
  "M982.04,510.49A77.12,77.12,0,0,1,982.04,569.51L873.44,831.7A77.12,77.12,0,0,1,831.7,873.44L569.51,982.04A77.12,77.12,0,0,1,510.49,982.04L248.3,873.44A77.12,77.12,0,0,1,206.56,831.7L97.96,569.51A77.12,77.12,0,0,1,97.96,510.49L206.56,248.3A77.12,77.12,0,0,1,248.3,206.56L510.49,97.96A77.12,77.12,0,0,1,569.51,97.96L831.7,206.56A77.12,77.12,0,0,1,873.44,248.3Z";

const DISC = "M212,540A328,328,0,1,1,868,540A328,328,0,1,1,212,540Z";

const CARVE =
  "M299.73,336.49L405.93,573.29A131.7,131.7,0,0,0,646.27,465.51L540.07,228.71A131.7,131.7,0,0,0,299.73,336.49Z";

/**
 * The Toolz mark, painted with a skin's icon colours. Geometry matches the
 * app's `ic_launcher_foreground` vector so the navbar tile looks like the
 * launcher icon the skin produces on Android.
 */
const SkinIcon = ({
  skin,
  size = 28,
  className,
  title,
}: {
  skin: SiteSkin;
  size?: number;
  className?: string;
  title?: string;
}) => {
  const gradientId = `skin-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { rim, bodyStart, bodyEnd, disc } = skin.icon;
  const useGradient = skin.iconGradient && Boolean(bodyEnd);
  const fill = useGradient ? `url(#${gradientId})` : bodyStart;
  const round = skin.shape === "CIRCLE";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1080 1080"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {useGradient && (
        <defs>
          <linearGradient id={gradientId} x1="27%" y1="16%" x2="73%" y2="84%">
            <stop offset="0%" stopColor={bodyStart} />
            <stop offset="100%" stopColor={bodyEnd ?? bodyStart} />
          </linearGradient>
        </defs>
      )}
      {round ? (
        <>
          <circle cx="540" cy="540" r="520" fill={rim} />
          <circle cx="540" cy="540" r="490" fill={fill} />
        </>
      ) : (
        <>
          <path d={OCTAGON_OUTER} fill={rim} />
          <path d={OCTAGON_INNER} fill={fill} />
        </>
      )}
      <path d={DISC} fill={disc} />
      <path d={CARVE} fill={bodyStart} />
    </svg>
  );
};

export default SkinIcon;
