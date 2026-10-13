import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  CheckCircle2,
  Users,
  ExternalLink,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { formatApkSize } from "@/lib/release";
import { SPRING_BOUNCY, SPRING_STANDARD } from "@/lib/motion";
import DownloadCounter from "@/components/landing/DownloadCounter";
import ChangelogView from "@/components/landing/ChangelogView";
import { cn } from "@/lib/utils";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const release = useLatestRelease();
  const { totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            forceMount
            className="max-w-2xl bg-transparent border-none p-0 overflow-hidden flex flex-col shadow-none focus:outline-none inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 h-[90vh] sm:h-auto sm:max-h-[85vh] [&>button]:hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={SPRING_BOUNCY}
              className="bg-surface-container-low flex flex-col h-full w-full overflow-hidden shadow-2xl"
              style={{ borderRadius: "28px 28px 0px 0px" }}
            >
              {/* Mobile drag handle */}
              <div className="w-10 h-1.5 bg-outline-variant/30 rounded-full mx-auto mt-3 mb-0.5 sm:hidden shrink-0" />

              {/* Header — compact on mobile, roomier from sm: up */}
              <div className="px-5 pt-4 pb-5 sm:px-12 sm:pt-12 sm:pb-8 text-center shrink-0 bg-primary-container/40">
                <motion.div
                  initial={{ scale: 0.4, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...SPRING_BOUNCY, delay: 0.05 }}
                  className="w-11 h-11 sm:w-16 sm:h-16 mx-auto bg-primary flex items-center justify-center text-on-primary mb-2.5 sm:mb-5 shadow-lg"
                  style={{ borderRadius: "18px 18px 6px 18px" }}
                >
                  <Download size={20} strokeWidth={2.4} className="sm:w-[30px] sm:h-[30px]" />
                </motion.div>
                <h2 className="text-lg sm:text-[26px] font-extrabold text-on-surface tracking-tight">
                  Update Toolz
                </h2>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING_STANDARD, delay: 0.12 }}
                  className="mt-1.5 sm:mt-3 inline-flex px-3 py-1 sm:px-4 sm:py-1.5 bg-primary rounded-full"
                >
                  <span className="text-[11px] sm:text-xs font-extrabold text-on-primary tracking-wide">
                    v{release.versionName}
                  </span>
                </motion.div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-4 sm:px-12 py-5 sm:py-8 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-6 sm:space-y-10">

                  {/* Stat + close row */}
                  <div className="flex flex-row gap-2.5 sm:gap-3">
                    <div
                      className="flex-1 bg-secondary-container p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 min-w-0"
                      style={{ borderRadius: "20px 20px 20px 6px" }}
                    >
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-on-secondary-container/10 flex items-center justify-center text-on-secondary-container shrink-0">
                        <Users size={16} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base sm:text-xl font-extrabold text-on-secondary-container leading-none truncate">
                          {isDownloadsLoading ? (
                            <span className="opacity-50">···</span>
                          ) : (
                            <DownloadCounter value={totalDownloads || 0} />
                          )}
                        </div>
                        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-on-secondary-container/70 font-bold mt-1 sm:mt-1.5 truncate">
                          Global Downloads
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      transition={SPRING_BOUNCY}
                      onClick={() => onOpenChange(false)}
                      className="bg-primary text-on-primary px-4 sm:px-8 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation shrink-0"
                      style={{ borderRadius: "20px 20px 6px 20px" }}
                    >
                      Close
                      <CheckCircle2 size={15} className="sm:w-[18px] sm:h-[18px]" />
                    </motion.button>
                  </div>

                  {/* APK downloads — live GitHub release, same data as /downloads */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      <h3 className="text-base font-extrabold text-on-surface uppercase tracking-wider">
                        Download APK
                      </h3>
                    </div>

                    {release.isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-[76px] bg-surface-container-highest"
                            style={{ borderRadius: "20px 20px 20px 6px" }}
                          />
                        ))}
                      </div>
                    ) : release.apks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {release.apks.map((apk, i) => {
                          const recommended = apk.abi === release.detectedAbi;
                          const size = formatApkSize(apk.sizeBytes);
                          return (
                            <motion.a
                              key={apk.abi}
                              href={apk.downloadUrl}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ ...SPRING_STANDARD, delay: 0.05 * i }}
                              whileTap={{ scale: 0.97 }}
                              className={cn(
                                "group relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 bg-surface-container border touch-manipulation",
                                recommended
                                  ? "border-primary/60"
                                  : "border-outline-variant/15"
                              )}
                              style={{ borderRadius: "20px 20px 20px 6px" }}
                            >
                              {recommended && (
                                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                                  <BadgeCheck size={11} />
                                  Your device
                                </span>
                              )}
                              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-primary/12 flex items-center justify-center text-primary group-active:bg-primary group-active:text-on-primary transition-colors shrink-0">
                                <Download size={16} className="sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm sm:text-base font-extrabold text-on-surface truncate">
                                  {apk.label}
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-bold uppercase tracking-tight opacity-60">
                                  {release.abiHint(apk.abi)}
                                  {size ? ` · ${size}` : ""}
                                </span>
                              </div>
                            </motion.a>
                          );
                        })}
                      </div>
                    ) : (
                      <a
                        href={release.releasesPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 sm:p-5 bg-surface-container border border-outline-variant/15"
                        style={{ borderRadius: "20px 20px 20px 6px" }}
                      >
                        <AlertTriangle size={18} className="text-tertiary shrink-0" />
                        <span className="text-sm text-on-surface-variant">
                          Couldn't load the latest files.{" "}
                          <span className="text-primary font-bold inline-flex items-center gap-1">
                            Open GitHub Releases
                            <ExternalLink size={13} />
                          </span>
                        </span>
                      </a>
                    )}
                  </div>

                  {/* Changelog — from the GitHub release body */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-6 bg-tertiary rounded-full" />
                      <h3 className="text-base font-extrabold text-on-surface uppercase tracking-wider">
                        What's New
                      </h3>
                    </div>

                    {release.isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-7 bg-surface-container-highest rounded-full w-1/3" />
                        <div className="h-32 bg-surface-container-highest rounded-[24px] w-full" />
                        <div className="h-32 bg-surface-container-highest rounded-[24px] w-full" />
                      </div>
                    ) : (
                      <ChangelogView raw={release.changelog} />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 sm:px-8 sm:py-6 text-center shrink-0 border-t border-outline-variant/10">
                <a
                  href={release.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold text-on-surface-variant/40 hover:text-primary uppercase tracking-[0.2em] sm:tracking-[0.25em] transition-colors"
                >
                  v{release.versionName} · View release on GitHub
                  <ExternalLink size={10} className="sm:w-[11px] sm:h-[11px]" />
                </a>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DownloadDialog;
