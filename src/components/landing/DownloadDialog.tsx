import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Info, CheckCircle2, Users, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
    const animation = animate(count, value, { duration: 2, ease: "circOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const { manifest, isLoading } = useUpdateManifest();
  const { totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

  const renderChangelog = (text: string) => {
    if (!text) return null;

    const normalized = text.replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={key} className="space-y-3 my-4 list-none">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList(`gap-${i}`);
        return;
      }

      // Headers (strip markdown symbols like >)
      if (trimmed.startsWith(">")) {
        flushList(`before-header-${i}`);
        const headerText = trimmed.replace(/^>\s*/, "").replace(/:$/, "").trim();
        elements.push(
          <h4 key={i} className="text-sm font-bold uppercase tracking-[0.2em] text-primary mt-8 mb-4">
            {headerText}
          </h4>
        );
        return;
      }

      // Lists (strip *, -, *-)
      const listMatch = trimmed.match(/^(\*|-|\*-)\s*(.*)/);
      if (listMatch && !trimmed.match(/^https?:\/\//)) {
        const content = listMatch[2];
        currentList.push(
          <li key={`li-${i}`} className="flex gap-3 text-sm text-on-surface font-bold leading-relaxed">
            <span className="text-primary">•</span>
            <span>{renderInlineMarkdown(content)}</span>
          </li>
        );
        return;
      }

      // Normal text
      flushList(`before-text-${i}`);
      elements.push(
        <p key={i} className="text-sm text-on-surface my-3 leading-relaxed font-bold">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    flushList("final");
    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    // Strip bold markers ** as we are bolding everything anyway
    const strippedText = text.replace(/\*\*/g, "");
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = strippedText.split(urlRegex);

    return segments.map((segment, segIndex) => {
      if (segment.match(urlRegex)) {
        return (
          <a
            key={`link-${segIndex}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
          >
            {segment.replace(/^https?:\/\/(www\.)?/, "").split('/')[0]}
            <ExternalLink size={12} className="opacity-70" />
          </a>
        );
      }
      return <React.Fragment key={`seg-${segIndex}`}>{segment}</React.Fragment>;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-container-low border-none p-0 overflow-hidden flex flex-col shadow-2xl rounded-t-[40px] sm:rounded-[40px] focus:outline-none bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2 h-[90vh] sm:h-auto sm:max-h-[85vh]">

        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="bg-primary/5 p-8 sm:p-12 border-b border-outline-variant/10 text-center relative overflow-hidden shrink-0">
          <div className="relative z-10 flex flex-col items-center">
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary mb-4 shadow-lg"
             >
               <Download size={32} />
             </motion.div>
             <h2 className="text-2xl font-bold text-on-surface tracking-tight">
               Update Toolz
             </h2>
             <div className="mt-3 px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-xs font-bold text-primary">
                  v{manifest?.versionName || "1.1.0"}
                </span>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 px-6 sm:px-12 py-8 custom-scrollbar">
          <div className="max-w-xl mx-auto space-y-10">

            {/* Quick Stats & Action */}
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 bg-surface-container p-5 rounded-2xl border border-outline-variant/20 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                   <Users size={24} />
                 </div>
                 <div>
                   <div className="text-xl font-bold text-on-surface">
                     {isDownloadsLoading ? "..." : <DownloadCounter value={totalDownloads || 0} />}
                   </div>
                   <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Global Downloads</div>
                 </div>
               </div>

               <button
                  onClick={() => onOpenChange(false)}
                  className="bg-primary text-on-primary px-8 h-[68px] sm:h-auto py-4 sm:py-0 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all touch-manipulation"
               >
                 Close
                 <CheckCircle2 size={18} />
               </button>
            </div>

            {/* Downloads */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-primary rounded-full" />
                 <h3 className="text-lg font-bold text-on-surface uppercase tracking-wider">Download APK</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {manifest?.releases.map((release) => (
                  <a
                    key={release.abi}
                    href={release.downloadUrl}
                    className="group flex items-center gap-4 p-5 rounded-2xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high transition-all touch-manipulation active:bg-surface-container-highest"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <Download size={24} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-base font-bold text-on-surface">{release.abi}</span>
                       <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight opacity-60">
                         {release.abi === "arm64-v8a" ? "Most Devices" : "Legacy"}
                       </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Changelog */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-secondary rounded-full" />
                 <h3 className="text-lg font-bold text-on-surface uppercase tracking-wider">What's New</h3>
              </div>

              <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-outline-variant/20 relative overflow-hidden">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-3 bg-surface-container-highest rounded-full w-2/3" />
                    <div className="h-24 bg-surface-container-highest rounded-2xl w-full" />
                  </div>
                ) : (
                  <div className="relative z-10">
                    {renderChangelog(manifest?.changelog || "")}
                  </div>
                )}
                <Package className="absolute -bottom-6 -right-6 text-on-surface/5 w-32 h-32 pointer-events-none rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center border-t border-outline-variant/10 shrink-0">
           <p className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-[0.3em]">
             Toolz Open Source Ecosystem
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
