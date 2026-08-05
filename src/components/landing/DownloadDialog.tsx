import React, { useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Download, ExternalLink, Info, CheckCircle2, X, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateManifest } from "@/hooks/use-update-manifest";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { cn } from "@/lib/utils";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DownloadCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const { manifest, isLoading } = useUpdateManifest();
  const { data: totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

  // Improved markdown to JSX converter for the changelog
  const renderChangelog = (text: string) => {
    if (!text) return null;

    // Split into blocks first to handle lists better
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    let currentList: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // Handle lists (including *- style)
      if (trimmed.startsWith("*-") || trimmed.startsWith("*") || (trimmed.startsWith("-") && !trimmed.startsWith("- ["))) {
        let content = trimmed;
        if (trimmed.startsWith("*-")) content = trimmed.substring(2).trim();
        else if (trimmed.startsWith("*") || trimmed.startsWith("-")) content = trimmed.substring(1).trim();

        currentList.push(
          <li key={`li-${i}`} className="m3-body-medium ml-4 list-none flex gap-3 my-2 leading-relaxed group">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
            <div className="flex-1">
              {renderInlineMarkdown(content)}
            </div>
          </li>
        );
        return;
      } else if (currentList.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="my-3 space-y-1">{currentList}</ul>);
        currentList = [];
      }

      // Headers
      if (trimmed.startsWith("# ")) {
        elements.push(<h1 key={i} className="m3-headline-small mt-8 mb-4 text-primary font-bold border-b border-primary/10 pb-2">{trimmed.replace("# ", "").trim()}</h1>);
      } else if (trimmed.startsWith("## ")) {
        elements.push(<h2 key={i} className="m3-title-large mt-6 mb-3 text-primary font-bold">{trimmed.replace("## ", "").trim()}</h2>);
      } else if (trimmed.startsWith("### ")) {
        elements.push(<h3 key={i} className="m3-title-medium mt-5 mb-2 text-primary/90 font-bold">{trimmed.replace("### ", "").trim()}</h3>);
      } else if (trimmed.endsWith(":") && trimmed.length < 50) {
        // Treat lines ending in colon as subheaders
        elements.push(<h4 key={i} className="m3-label-large mt-6 mb-2 text-primary/80 font-bold uppercase tracking-wider">{trimmed}</h4>);
      } else if (trimmed.startsWith("- [x]") || trimmed.startsWith("- [ ]")) {
        const checked = trimmed.startsWith("- [x]");
        const content = trimmed.replace("- [x]", "").replace("- [ ]", "").trim();
        elements.push(
          <div key={i} className="flex items-start gap-3 my-2 bg-surface-container/30 p-2 rounded-lg">
            <CheckCircle2 size={16} className={cn("mt-1 shrink-0", checked ? "text-primary" : "text-muted-foreground opacity-40")} />
            <span className={cn("m3-body-medium", !checked && "text-muted-foreground")}>
              {renderInlineMarkdown(content)}
            </span>
          </div>
        );
      } else if (trimmed.startsWith(">")) {
        const content = trimmed.substring(1).trim();
        elements.push(
          <blockquote key={i} className="border-l-4 border-primary/20 pl-4 py-2 my-6 m3-body-large text-muted-foreground bg-primary/5 rounded-r-xl italic">
             {renderInlineMarkdown(content)}
          </blockquote>
        );
      } else if (trimmed === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="m3-body-medium my-2 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(<ul key="ul-final" className="my-3 space-y-1">{currentList}</ul>);
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split by bold markers first
    return text.split("**").map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={`bold-${index}`} className="text-on-surface font-bold text-primary/90">{part}</strong>;
      }

      // For non-bold parts, split by italics
      return part.split("_").map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return <em key={`italic-${subIndex}`} className="italic text-primary/80">{subPart}</em>;
        }

        // For remaining text, handle URLs
        const segments = subPart.split(urlRegex);
        return segments.map((segment, segIndex) => {
          if (segment.match(urlRegex)) {
            return (
              <a
                key={`link-${segIndex}`}
                href={segment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all inline-flex items-center gap-1"
              >
                {segment.replace("https://github.com/", "github.com/")}
                <ExternalLink size={10} className="inline" />
              </a>
            );
          }
          return segment;
        });
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-container-low border-outline-variant p-0 overflow-hidden sm:rounded-[32px] max-h-[90vh] flex flex-col">
        {/* Header Image/Background - fixed at top */}
        <div className="h-32 bg-primary/10 relative overflow-hidden shrink-0">
           <motion.div
             animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
           />
           <motion.div
             animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                 <Download size={32} className="text-on-primary" />
              </div>
           </div>

           {/* Close button for mobile accessibility */}
           <button
             onClick={() => onOpenChange(false)}
             className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors sm:hidden"
           >
             <X size={20} className="text-on-surface" />
           </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <DialogTitle className="m3-headline-medium mb-1">Download Toolz</DialogTitle>
                  <DialogDescription className="m3-body-medium flex items-center gap-2">
                    {isLoading ? "Fetching latest version..." : `v${manifest?.versionName || "1.1.0"} Release`}
                    {!isLoading && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        Latest
                      </span>
                    )}
                  </DialogDescription>
                </div>

                {/* Expressive Download Counter */}
                <button
                  onClick={() => {
                    onOpenChange(false);
                    // Use window.location for a direct redirect to ensure the route change triggers
                    window.location.href = '/downloads';
                  }}
                  className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-2xl self-start sm:self-center hover:bg-secondary/20 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <Users size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="m3-title-small font-bold text-secondary leading-none">
                      {isDownloadsLoading ? "..." : <DownloadCounter value={totalDownloads || 0} />}
                    </span>
                    <span className="text-[10px] text-secondary/70 uppercase font-bold tracking-tight flex items-center gap-1">
                      Downloads
                      <BarChart3 size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Release Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                   <Info size={18} />
                   <span className="m3-label-large">Changelog</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-surface-container-highest rounded w-3/4" />
                      <div className="h-4 bg-surface-container-highest rounded w-full" />
                      <div className="h-4 bg-surface-container-highest rounded w-5/6" />
                    </div>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      {renderChangelog(manifest?.changelog || "")}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: ABI Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-secondary border-b border-secondary/10 pb-2">
                   <ExternalLink size={18} />
                   <span className="m3-label-large">Select Architecture</span>
                </div>
                <div className="flex flex-col gap-2">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-surface-container-highest rounded-2xl animate-pulse" />
                    ))
                  ) : (
                    manifest?.releases.map((release) => (
                      <a
                        key={release.abi}
                        href={release.downloadUrl}
                        className="flex items-center justify-between p-4 rounded-2xl bg-surface-container transition-all hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] group"
                      >
                        <div className="flex flex-col">
                          <span className="m3-title-small font-bold text-on-surface">{release.abi}</span>
                          <span className="m3-label-small text-on-surface-variant opacity-70">
                            {release.abi === "arm64-v8a" ? "Modern Android (Recommended)" :
                             release.abi === "armeabi-v7a" ? "Older 32-bit devices" :
                             release.abi === "x86_64" ? "High-perf emulators & tablets" :
                             release.abi === "x86" ? "Older emulators & ChromeOS" :
                             "Generic architecture"}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                          <Download size={18} />
                        </div>
                      </a>
                    ))
                  )}
                </div>
                <p className="m3-label-small text-on-surface-variant text-center mt-4 bg-surface-container/50 py-2 rounded-xl">
                  Not sure? <a href="https://github.com/freroxx/toolz/releases" className="text-primary hover:underline font-bold">View all on GitHub</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
