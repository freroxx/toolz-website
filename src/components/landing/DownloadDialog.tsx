import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Info, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateManifest } from "@/hooks/use-update-manifest";
import { cn } from "@/lib/utils";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const { manifest, isLoading } = useUpdateManifest();

  // Basic markdown to JSX converter for the changelog
  const renderChangelog = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith("# ")) {
        return <h1 key={i} className="m3-headline-small mt-8 mb-4 text-primary font-bold border-b border-primary/10 pb-2">{trimmed.replace("# ", "").trim()}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="m3-title-large mt-6 mb-3 text-primary font-bold">{trimmed.replace("## ", "").trim()}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="m3-title-medium mt-5 mb-2 text-primary/90 font-bold">{trimmed.replace("### ", "").trim()}</h3>;
      }
      if (trimmed.startsWith("#### ")) {
        return <h4 key={i} className="m3-label-large mt-4 mb-1 text-secondary font-bold uppercase tracking-wider">{trimmed.replace("#### ", "").trim()}</h4>;
      }
      if (trimmed.startsWith("- [x]") || trimmed.startsWith("- [ ]")) {
        const checked = trimmed.startsWith("- [x]");
        const content = trimmed.replace("- [x]", "").replace("- [ ]", "").trim();
        return (
          <div key={i} className="flex items-start gap-2 my-2">
            <CheckCircle2 size={16} className={cn("mt-1 shrink-0", checked ? "text-primary" : "text-muted-foreground opacity-40")} />
            <span className={cn("m3-body-medium", !checked && "text-muted-foreground")}>
              {content.split("**").map((part, index) => {
                if (index % 2 === 1) return <strong key={index} className="text-on-surface font-bold">{part}</strong>;
                return part.split("_").map((subPart, subIndex) =>
                  subIndex % 2 === 1 ? <em key={subIndex} className="italic text-primary/80">{subPart}</em> : subPart
                );
              })}
            </span>
          </div>
        );
      }
      if (trimmed.startsWith("*") || (trimmed.startsWith("-") && !trimmed.startsWith("- ["))) {
        return (
          <li key={i} className="m3-body-medium ml-6 list-disc marker:text-primary my-1 leading-relaxed">
            {trimmed.substring(1).split("**").map((part, index) => {
              if (index % 2 === 1) return <strong key={index} className="text-on-surface font-bold">{part}</strong>;
              return part.split("_").map((subPart, subIndex) =>
                subIndex % 2 === 1 ? <em key={subIndex} className="italic text-primary/80">{subPart}</em> : subPart
              );
            })}
          </li>
        );
      }
      if (trimmed.startsWith(">")) {
        const content = trimmed.substring(1).trim();
        return (
          <blockquote key={i} className="border-l-4 border-primary/20 pl-4 py-2 my-6 m3-body-large text-muted-foreground bg-primary/5 rounded-r-xl">
             {content.split("**").map((part, index) => {
                if (index % 2 === 1) return <strong key={index} className="text-primary/90 font-bold">{part}</strong>;
                return part.split("_").map((subPart, subIndex) =>
                  subIndex % 2 === 1 ? <em key={subIndex} className="italic text-primary/80">{subPart}</em> : subPart
                );
              })}
          </blockquote>
        );
      }
      if (trimmed === "") return <div key={i} className="h-2" />;

      return (
        <p key={i} className="m3-body-medium my-2 leading-relaxed">
          {line.split("**").map((part, index) => {
            if (index % 2 === 1) return <strong key={index} className="text-on-surface font-bold">{part}</strong>;
            return part.split("_").map((subPart, subIndex) =>
              subIndex % 2 === 1 ? <em key={subIndex} className="italic text-primary/80">{subPart}</em> : subPart
            );
          })}
        </p>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-container-low border-outline-variant p-0 overflow-hidden sm:rounded-[32px]">
        <div className="relative">
          {/* Header Image/Background */}
          <div className="h-32 bg-primary/10 relative overflow-hidden">
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
          </div>

          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="m3-headline-medium mb-1">Download Toolz</DialogTitle>
                  <DialogDescription className="m3-body-medium">
                    {isLoading ? "Fetching latest version..." : `v${manifest?.versionName || "1.1.0"} Release`}
                  </DialogDescription>
                </div>
                {!isLoading && (
                  <div className="m3-chip bg-primary/10 border-primary/20 text-primary px-3 py-1">
                    Latest
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Release Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
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
                <div className="flex items-center gap-2 text-secondary">
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
                        <Download size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))
                  )}
                </div>
                <p className="m3-label-small text-on-surface-variant text-center mt-4">
                  Not sure which one to pick? <a href="https://github.com/freroxx/toolz/releases" className="text-primary hover:underline">View all releases</a>
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
