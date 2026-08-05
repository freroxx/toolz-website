import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
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
          <ul key={key} className="space-y-2 my-4 list-none">
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

      // Headers (e.g., "> Changes :")
      if (trimmed.startsWith(">")) {
        flushList(`before-header-${i}`);
        const headerText = trimmed.replace(/^>\s*/, "").replace(/:$/, "").trim();
        elements.push(
          <h4 key={i} className="text-sm font-bold uppercase tracking-wider text-primary mt-6 mb-3">
            {headerText}
          </h4>
        );
        return;
      }

      // Lists (e.g., "* ", "- ")
      const listMatch = trimmed.match(/^(\*|-|\*-)\s*(.*)/);
      if (listMatch && !trimmed.match(/^https?:\/\//)) {
        const content = listMatch[2];
        currentList.push(
          <li key={`li-${i}`} className="flex gap-3 text-sm text-on-surface/80 leading-relaxed">
            <span className="text-primary font-bold">•</span>
            <span>{renderInlineMarkdown(content)}</span>
          </li>
        );
        return;
      }

      // Normal text
      flushList(`before-text-${i}`);
      elements.push(
        <p key={i} className="text-sm text-on-surface/80 my-2 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    flushList("final");
    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    // Regex for URLs that don't already look like markdown links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = text.split(urlRegex);

    return segments.map((segment, segIndex) => {
      if (segment.match(urlRegex)) {
        return (
          <a
            key={`link-${segIndex}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
          >
            {segment.replace(/^https?:\/\/(www\.)?/, "").split('/')[0]}
            <ExternalLink size={12} className="opacity-50" />
          </a>
        );
      }

      let content: React.ReactNode[] = [segment];

      // Bold **text**
      content = content.flatMap((node, idx) => {
        if (typeof node !== 'string') return node;
        return node.split("**").map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-on-surface font-bold">{part}</strong> : part
        );
      });

      return <React.Fragment key={`seg-${segIndex}`}>{content}</React.Fragment>;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-container-low border-none p-0 overflow-hidden flex flex-col shadow-2xl rounded-[32px] sm:rounded-[40px] focus:outline-none">
        {/* Simple Professional Header */}
        <div className="bg-primary/5 p-8 sm:p-12 border-b border-outline-variant/10 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary mb-4 shadow-lg">
               <Download size={32} />
             </div>
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
        <div className="overflow-y-auto max-h-[60vh] px-6 sm:px-12 py-8 custom-scrollbar">
          <div className="space-y-10">

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
                   <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">Global Downloads</div>
                 </div>
               </div>

               <button
                  onClick={() => onOpenChange(false)}
                  className="bg-primary text-on-primary px-8 h-auto py-4 sm:py-0 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
               >
                 Close
                 <CheckCircle2 size={18} />
               </button>
            </div>

            {/* Downloads - Now BEFORE Changelog */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-primary rounded-full" />
                 <h3 className="text-lg font-bold text-on-surface">Download APK</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {manifest?.releases.map((release) => (
                  <a
                    key={release.abi}
                    href={release.downloadUrl}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <Download size={20} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-base font-bold text-on-surface">{release.abi}</span>
                       <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
                         {release.abi === "arm64-v8a" ? "Recommended" : "Compatibility"}
                       </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Changelog - Now AFTER Downloads */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-secondary rounded-full" />
                 <h3 className="text-lg font-bold text-on-surface">What's New</h3>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 relative">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-3 bg-surface-container-highest rounded-full w-2/3" />
                    <div className="h-20 bg-surface-container-highest rounded-xl w-full" />
                  </div>
                ) : (
                  <div className="relative z-10">
                    {renderChangelog(manifest?.changelog || "")}
                  </div>
                )}
                <Package className="absolute bottom-4 right-4 text-on-surface/5 w-12 h-12 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="p-6 text-center border-t border-outline-variant/10">
           <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
             Toolz Open Source Utility
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
