import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/** Animated integer counter (locale-formatted). Shared by dialog, CTA, /downloads. */
const DownloadCounter = ({ value, duration = 1.6 }: { value: number; duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, count, duration]);

  return <motion.span>{rounded}</motion.span>;
};

export default DownloadCounter;
