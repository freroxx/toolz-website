import React, { useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Download, ExternalLink, Info, CheckCircle2, X, Users, BarChart } from "lucide-react";
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
    const animation = animate(count, value, { duration: 2, ease: "circOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const { manifest, isLoading } = useUpdateManifest();
  const { totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

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
          <li key={`li-${i}`} className="m3-body-medium ml-2 list-none flex gap-3 my-2 leading-relaxed group">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0 group-hover:scale-125 transition-transform" />
            <div className="flex-1 text-on-surface/90">
              {renderInlineMarkdown(content)}
            </div>
          </li>
        );
        return;
      } else if (currentList.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="my-4 space-y-1">{currentList}</ul>);
        currentList = [];
      }

      // Headers
      if (trimmed.startsWith("# ")) {
        elements.push(<h1 key={i} className="m3-headline-small mt-10 mb-5 text-primary font-bold border-b border-primary/10 pb-2">{trimmed.replace("# ", "").trim()}</h1>);
      } else if (trimmed.startsWith("## ")) {
        elements.push(<h2 key={i} className="m3-title-large mt-8 mb-4 text-primary font-bold">{trimmed.replace("## ", "").trim()}</h2>);
      } else if (trimmed.startsWith("### ")) {
        elements.push(<h3 key={i} className="m3-title-medium mt-6 mb-3 text-primary/90 font-bold">{trimmed.replace("### ", "").trim()}</h3>);
      } else if (trimmed.endsWith(":") && trimmed.length < 60) {
        // Treat lines ending in colon as distinct section subheaders
        elements.push(
          <div key={i} className="mt-8 mb-4 flex items-center gap-3">
            <h4 className="m3-label-large text-primary font-black uppercase tracking-[0.15em] bg-primary/5 px-4 py-1.5 rounded-lg border border-primary/10">
              {trimmed.replace(":", "").trim()}
            </h4>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
        );
      } else if (trimmed.startsWith("- [x]") || trimmed.startsWith("- [ ]")) {
        const checked = trimmed.startsWith("- [x]");
        const content = trimmed.replace("- [x]", "").replace("- [ ]", "").trim();
        elements.push(
          <div key={i} className="flex items-start gap-3 my-3 bg-surface-container/40 p-3 rounded-xl border border-outline-variant/30">
            <CheckCircle2 size={18} className={cn("mt-0.5 shrink-0", checked ? "text-primary" : "text-muted-foreground opacity-40")} />
            <span className={cn("m3-body-medium", !checked && "text-muted-foreground")}>
              {renderInlineMarkdown(content)}
            </span>
          </div>
        );
      } else if (trimmed.startsWith(">")) {
        const content = trimmed.substring(1).trim();
        elements.push(
          <blockquote key={i} className="border-l-4 border-secondary/40 pl-6 py-4 my-8 m3-body-large text-on-surface-variant bg-secondary/5 rounded-r-2xl italic leading-relaxed">
             {renderInlineMarkdown(content)}
          </blockquote>
        );
      } else if (trimmed === "") {
        elements.push(<div key={i} className="h-4" />);
      } else {
        elements.push(
          <p key={i} className="m3-body-large my-3 text-on-surface/80 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(<ul key="ul-final" className="my-4 space-y-1">{currentList}</ul>);
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split by bold markers first
    return text.split("**").map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={`bold-${index}`} className="text-on-surface font-bold text-primary">{part}</strong>;
      }

      // For non-bold parts, split by italics
      return part.split("_").map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return <em key={`italic-${subIndex}`} className="italic text-secondary/90">{subPart}</em>;
        }

        // For remaining text, handle URLs
        const segments = subPart.split(urlRegex);
        return segments.map((segment, segIndex) => {
          if (segment.match(urlRegex)) {
            const isDiscord = segment.includes("discord");
            const isGithub = segment.includes("github");

            return (
              <a
                key={`link-${segIndex}`}
                href={segment}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold transition-all mx-1 my-0.5 border",
                  isDiscord ? "bg-[#5865F2]/10 border-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/20" :
                  isGithub ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" :
                  "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20"
                )}
              >
                {isDiscord ? "Join Discord" : isGithub ? "View on GitHub" : "External Link"}
                <ExternalLink size={12} />
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
      <DialogContent className="max-w-3xl bg-surface-container-low border-outline-variant p-0 overflow-hidden sm:rounded-[40px] max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header Image/Background - fixed at top */}
        <div className="h-40 bg-primary/10 relative overflow-hidden shrink-0">
           <motion.div
             animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl"
           />
           <motion.div
             animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -bottom-20 -left-20 w-48 h-48 bg-secondary/20 rounded-full blur-2xl"
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-[28%] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                 <Download size={40} className="text-on-primary" />
              </div>
           </div>

           {/* Close button for mobile accessibility */}
           <button
             onClick={() => onOpenChange(false)}
             className="absolute top-6 right-6 p-2.5 rounded-full bg-surface-container-highest/50 backdrop-blur-md hover:bg-surface-container-highest transition-colors shadow-lg border border-outline-variant/30"
           >
             <X size={24} className="text-on-surface" />
           </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 sm:px-10 pb-10 pt-8">
          <div className="max-w-2xl mx-auto">
            <DialogHeader className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <DialogTitle className="m3-headline-large mb-2">Release Notes</DialogTitle>
                  <DialogDescription className="m3-body-large flex items-center gap-3">
                    <span className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">
                       {isLoading ? "v?.?.?" : `v${manifest?.versionName || "1.1.0"}`}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                    <span>Latest stable build</span>
                  </DialogDescription>
                </div>

                {/* Expressive Download Counter */}
                <button
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = '/downloads';
                  }}
                  className="flex items-center gap-4 bg-secondary/10 border border-secondary/20 px-5 py-3 rounded-3xl self-start sm:self-center hover:bg-secondary/20 transition-all hover:scale-[1.02] active:scale-95 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Users size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="m3-title-medium font-black text-secondary leading-none">
                      {isDownloadsLoading ? "..." : <DownloadCounter value={totalDownloads || 0} />}
                    </span>
                    <span className="text-[11px] text-secondary/70 uppercase font-black tracking-widest flex items-center gap-1.5 mt-1">
                      Global Usage
                      <BarChart size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-12">
              {/* Changelog Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary">
                   <Info size={24} />
                   <span className="m3-title-large font-bold tracking-tight">What's New</span>
                </div>
                <div className="bg-surface-container/20 rounded-[32px] p-6 sm:p-8 border border-outline-variant/20 shadow-inner">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 bg-surface-container-highest rounded-full w-1/3" />
                      <div className="h-4 bg-surface-container-highest rounded-full w-full" />
                      <div className="h-4 bg-surface-container-highest rounded-full w-5/6" />
                      <div className="h-4 bg-surface-container-highest rounded-full w-4/5" />
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      {renderChangelog(manifest?.changelog || "")}
                    </div>
                  )}
                </div>
              </div>

              {/* ABI Selection Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-secondary">
                   <Package size={24} className="text-secondary" />
                   <span className="m3-title-large font-bold tracking-tight text-on-surface">Get the APK</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-20 bg-surface-container-highest rounded-3xl animate-pulse" />
                    ))
                  ) : (
                    manifest?.releases.map((release) => (
                      <a
                        key={release.abi}
                        href={release.downloadUrl}
                        className="flex items-center justify-between p-5 rounded-[24px] bg-surface-container border border-outline-variant/30 transition-all hover:bg-surface-container-high hover:scale-[1.03] hover:border-primary/30 active:scale-[0.97] group shadow-sm hover:shadow-md"
                      >
                        <div className="flex flex-col">
                          <span className="m3-title-medium font-black text-on-surface tracking-tight">{release.abi}</span>
                          <span className="m3-label-small text-on-surface-variant opacity-60 font-medium mt-0.5">
                            {release.abi === "arm64-v8a" ? "Modern Android" :
                             release.abi === "armeabi-v7a" ? "Legacy Devices" :
                             release.abi === "x86_64" ? "Emulators / Tablets" :
                             release.abi === "x86" ? "ChromeOS / Older" :
                             "Architecture"}
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                          <Download size={22} className="group-hover:translate-y-0.5 transition-transform" />
                        </div>
                      </a>
                    ))
                  )}
                </div>

                <div className="bg-surface-container-highest/30 rounded-2xl p-4 flex items-center justify-center gap-3 border border-outline-variant/20">
                  <span className="m3-label-medium text-on-surface-variant">Not sure which one to pick?</span>
                  <a href="https://github.com/freroxx/toolz/releases" className="text-primary font-black m3-label-large hover:underline flex items-center gap-1">
                    View all releases
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
