import { Suspense, lazy, useEffect, useState } from "react";

const DownloadDialog = lazy(() => import("./DownloadDialog"));

interface LazyDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Download dialog that loads on first open and stays mounted afterwards,
 * so the exit animation can play. Keeps radix-dialog + changelog parsing
 * out of the initial page bundle.
 */
const LazyDownloadDialog = ({ open, onOpenChange }: LazyDownloadDialogProps) => {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open ]);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <DownloadDialog open={open} onOpenChange={onOpenChange} />
    </Suspense>
  );
};

export default LazyDownloadDialog;
