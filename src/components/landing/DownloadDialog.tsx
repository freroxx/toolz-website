import React, { useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Download, ExternalLink, Info, CheckCircle2, X, Users, BarChart, Package } from "lucide-react";
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

  const renderChangelog = (text: string) => {
    if (!text) return null;

    // Fix common manifest typos and normalize
    const normalized = text
      .replace(/(https?):\s+\/\//g, "$1://")
      .replace(/\r\n/g, "\n");

    const lines = normalized.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        elements.push(
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 my-6 pl-1"
          >
            {currentList}
          </motion.div>
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

      // 1. Discord-style Headers (e.g., "> Changes :")
      if (trimmed.startsWith(">")) {
        flushList(`before-header-${i}`);
        const headerText = trimmed.replace(/^>\s*/, "").replace(/:$/, "").trim();
        elements.push(
          <div key={i} className="mt-10 mb-5 first:mt-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary py-1 px-3 bg-primary/5 rounded-lg border border-primary/10">
                {headerText}
              </h3>
            </div>
          </div>
        );
        return;
      }

      // 2. Multi-format Lists (e.g., "*- ", "* ", "- ")
      const listMatch = trimmed.match(/^(\*|-|\*-)\s*(.*)/);
      if (listMatch && !trimmed.match(/^https?:\/\//)) {
        const content = listMatch[2];
        currentList.push(
          <div key={`li-${i}`} className="flex gap-4 group">
            <div className="w-2 h-2 rounded-full bg-primary/30 mt-2 shrink-0 group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
            <div className="flex-1 text-sm text-on-surface/90 leading-relaxed font-medium">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
        return;
      }

      // 3. Normal text / Fallback
      flushList(`before-text-${i}`);
      elements.push(
        <p key={i} className="text-sm text-on-surface/80 my-4 leading-relaxed pl-2 font-medium">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    flushList("final");
    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = text.split(urlRegex);

    return segments.map((segment, segIndex) => {
      if (segment.match(urlRegex)) {
        const lower = segment.toLowerCase();
        const isDiscord = lower.includes("discord");
        const isGithub = lower.includes("github");

        return (
          <a
            key={`link-${segIndex}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all mx-1 border align-middle uppercase tracking-widest shadow-sm active:scale-95",
              isDiscord ? "bg-[#5865F2] text-white border-transparent hover:shadow-[#5865F2]/20" :
              isGithub ? "bg-primary text-on-primary border-transparent hover:shadow-primary/20" :
              "bg-secondary/10 border-secondary/20 text-secondary"
            )}
          >
            {isDiscord ? "Discord" : isGithub ? "GitHub" : "Link"}
            <ExternalLink size={12} />
          </a>
        );
      }

      let content: React.ReactNode[] = [segment];

      // Bold **text**
      content = content.flatMap((node, idx) => {
        if (typeof node !== 'string') return node;
        return node.split("**").map((part, j) =>
          j % 2 === 1 ? <span key={j} className="text-primary font-black drop-shadow-sm">{part}</span> : part
        );
      });

      // Key : Value styling
      content = content.flatMap((node, idx) => {
        if (typeof node !== 'string' || idx > 0) return node;
        const colonMatch = node.match(/^([^:]+)\s?:\s?(.*)/);
        if (colonMatch && colonMatch[1].length < 45 && !colonMatch[1].includes("http")) {
          return [
            <span key="label" className="font-black text-on-surface/90 border-b-2 border-primary/20 mr-1 tracking-tight">
              {colonMatch[1]}
            </span>,
            <span key="sep" className="font-light opacity-30 mx-1">:</span>,
            colonMatch[2]
          ];
        }
        return node;
      });

      return <React.Fragment key={`seg-${segIndex}`}>{content}</React.Fragment>;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-3xl bg-surface-container-low border-none p-0 overflow-hidden h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)] rounded-t-[48px] sm:rounded-[48px] bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2 focus:outline-none">
        {/* Mobile "Expressive" Grab Handle */}
        <div className="w-16 h-1.5 bg-outline-variant/40 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0 shadow-inner" />

        {/* Cinematic Header */}
        <div className="h-44 sm:h-56 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent relative overflow-hidden shrink-0 border-b border-outline-variant/10">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
             <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-20 h-20 sm:w-24 sm:h-24 rounded-[35%] bg-primary flex items-center justify-center shadow-[0_20px_40px_rgba(var(--primary),0.3)] text-on-primary mb-5"
             >
               <Download size={48} className="drop-shadow-lg" />
             </motion.div>
             <motion.h2
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-2xl sm:text-3xl font-black text-on-surface tracking-tighter"
             >
               Update Available
             </motion.h2>
             <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-surface-container/50 rounded-full border border-outline-variant/30 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Version {manifest?.versionName || "1.1.0"}
                </span>
             </div>
          </div>
        </div>

        {/* Content Flow */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 sm:px-16 pb-12 pt-8">
          <div className="max-w-2xl mx-auto space-y-12">

            {/* Main Action Card */}
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 bg-surface-container p-6 rounded-[32px] border border-outline-variant/30 flex items-center gap-5 shadow-sm">
                 <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                   <Users size={28} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-2xl font-black text-on-surface tracking-tight">
                     {isDownloadsLoading ? "..." : <DownloadCounter value={totalDownloads || 0} />}
                   </span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Global Installs</span>
                 </div>
               </div>

               <button
                  onClick={() => onOpenChange(false)}
                  className="bg-primary text-on-primary h-[88px] sm:h-auto sm:px-10 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(var(--primary),0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border-none group"
               >
                 Acknowledge
                 <CheckCircle2 size={20} className="group-hover:rotate-12 transition-transform" />
               </button>
            </div>

            {/* Changelog Sections */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-8 bg-secondary rounded-full" />
                   <h3 className="text-2xl font-black text-on-surface tracking-tighter">What's New</h3>
                </div>
                <Info size={20} className="text-on-surface-variant opacity-20" />
              </div>

              <div className="bg-surface-container-low rounded-[40px] p-7 sm:p-10 border border-outline-variant/40 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                  <Package size={200} />
                </div>
                {isLoading ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-4 bg-surface-container-highest rounded-full w-2/3" />
                    <div className="h-32 bg-surface-container-highest rounded-[32px] w-full" />
                  </div>
                ) : (
                  <div className="relative z-10 prose prose-invert max-w-none">
                    {renderChangelog(manifest?.changelog || "")}
                  </div>
                )}
              </div>
            </div>

            {/* ABI Selection Grid */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-8 bg-primary rounded-full" />
                 <h3 className="text-2xl font-black text-on-surface tracking-tighter">Download APK</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {manifest?.releases.map((release) => (
                  <a
                    key={release.abi}
                    href={release.downloadUrl}
                    className="group relative flex items-center gap-5 p-6 rounded-[35px] bg-surface-container border border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="w-14 h-14 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shadow-inner">
                      <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="flex flex-col flex-1">
                       <span className="text-xl font-black text-on-surface group-hover:text-primary transition-colors tracking-tight">{release.abi}</span>
                       <span className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase tracking-widest mt-1">
                         {release.abi === "arm64-v8a" ? "Most Devices" : "Legacy Support"}
                       </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                       <ExternalLink size={20} className="text-primary" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 py-8">
               <div className="h-px w-24 bg-outline-variant/30" />
               <p className="text-[10px] font-black text-on-surface-variant opacity-30 uppercase tracking-[0.4em] text-center">
                 Powered by Toolz Ecosystem
               </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
