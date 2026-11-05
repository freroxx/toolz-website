import { motion } from "framer-motion";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { formatApkSize } from "@/lib/release";
import DownloadCounter from "@/components/landing/DownloadCounter";
import ChangelogView from "@/components/landing/ChangelogView";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Reveal = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 28 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Download sheet: the same latest release the /downloads page renders, with
 * one row per ABI. Phone browsers get a bottom sheet, larger screens a
 * centred dialog. Uses Radix for focus trapping, Escape and scroll lock.
 */
const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const release = useLatestRelease();
  const { totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-x-0 bottom-0 top-auto flex h-[92dvh] w-full max-w-2xl translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[28px] border-0 bg-transparent p-0 shadow-none focus:outline-none data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="flex h-full w-full flex-col overflow-hidden border shadow-2xl"
          style={{
            background: "hsl(var(--md-surface-container))",
            borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            borderRadius: "inherit",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: "hsl(var(--md-primary-container))",
                  color: "hsl(var(--md-on-primary-container))",
                }}
              >
                <Download size={22} />
              </span>
              <div className="min-w-0">
                <p
                  className="m3-label-large font-semibold"
                  style={{ color: "hsl(var(--md-primary-ink))" }}
                >
                  Get the app
                </p>
                <DialogTitle asChild>
                  <h2
                    className="m3-headline-small mt-0.5 text-[22px] leading-tight sm:text-[26px]"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    Download Toolz
                  </h2>
                </DialogTitle>
                <DialogDescription className="m3-body-small mt-0.5">
                  Android · version {release.versionName}
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="custom-scrollbar flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
            <div className="space-y-6">
              {/* Quick facts */}
              <Reveal className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "hsl(var(--md-secondary-container))",
                    color: "hsl(var(--md-on-secondary-container))",
                  }}
                >
                  <p className="m3-label-medium opacity-90">Downloads</p>
                  <p className="m3-title-large mt-1 tabular-nums">
                    {isDownloadsLoading ? "…" : <DownloadCounter value={totalDownloads || 0} />}
                  </p>
                  <p className="m3-body-small mt-0.5 opacity-90">across all releases</p>
                </div>
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    background: "hsl(var(--md-surface-container-low))",
                    borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                  }}
                >
                  <p
                    className="m3-label-medium"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    Latest release
                  </p>
                  <p
                    className="m3-title-large mt-1"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    v{release.versionName}
                  </p>
                  <p
                    className="m3-body-small mt-0.5 inline-flex items-center gap-1"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    <ShieldCheck size={13} />
                    Signed APK
                  </p>
                </div>
              </Reveal>

              {/* APK list */}
              <section aria-labelledby="download-apk-heading">
                <div className="flex items-end justify-between gap-3">
                  <h3
                    id="download-apk-heading"
                    className="m3-title-medium"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    Choose your device
                  </h3>
                  <span
                    className="m3-label-small tabular-nums"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    {release.apks.length} build{release.apks.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p
                  className="m3-body-small mt-1"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                >
                  Not sure? Pick the build marked for this device, or the first one — Android
                  rejects a wrong ABI and you can try the next.
                </p>

                {release.isLoading ? (
                  <div className="mt-3 space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-[68px] rounded-2xl"
                        style={{ background: "hsl(var(--md-surface-container-high))" }}
                      />
                    ))}
                  </div>
                ) : release.apks.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {release.apks.map((apk) => {
                      const recommended = apk.abi === release.detectedAbi;
                      const size = formatApkSize(apk.sizeBytes);
                      return (
                        <motion.a
                          key={apk.abi}
                          href={apk.downloadUrl}
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 600, damping: 18 }}
                          className="group flex items-center gap-3 rounded-[16px] border p-3.5 transition-colors"
                          style={{
                            background: recommended
                              ? "hsl(var(--md-primary-container))"
                              : "hsl(var(--md-surface-container-low))",
                            borderColor: recommended
                              ? "transparent"
                              : "hsl(var(--md-outline-variant) / 0.4)",
                            color: recommended
                              ? "hsl(var(--md-on-primary-container))"
                              : "hsl(var(--md-on-surface))",
                          }}
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                            style={{
                              background: recommended
                                ? "hsl(var(--md-on-primary-container) / 0.12)"
                                : "hsl(var(--md-surface-container-high))",
                            }}
                          >
                            <Download size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="m3-title-small block truncate">{apk.label}</span>
                            <span className="m3-body-small block truncate opacity-90">
                              {release.abiHint(apk.abi)}
                              {size ? ` · ${size}` : ""}
                            </span>
                          </span>
                          {recommended && (
                            <span
                              className="m3-label-small shrink-0 rounded-full px-2.5 py-1"
                              style={{
                                background: "hsl(var(--md-primary))",
                                color: "hsl(var(--md-on-primary))",
                              }}
                            >
                              This device
                            </span>
                          )}
                        </motion.a>
                      );
                    })}
                  </div>
                ) : (
                  <a
                    href={release.releasesPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-3 rounded-2xl border p-4"
                    style={{
                      background: "hsl(var(--md-surface-container-low))",
                      borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                      color: "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <AlertTriangle size={18} className="shrink-0" />
                    <span className="m3-body-small">
                      Couldn't load the latest files.{" "}
                      <span
                        className="font-semibold underline underline-offset-2"
                        style={{ color: "hsl(var(--md-primary-ink))" }}
                      >
                        Open GitHub releases
                      </span>
                    </span>
                  </a>
                )}
              </section>

              {/* Changelog */}
              {!release.isLoading && release.changelog && (
                <section aria-labelledby="download-changelog-heading">
                  <div className="flex items-end justify-between gap-3">
                    <h3
                      id="download-changelog-heading"
                      className="m3-title-medium"
                      style={{ color: "hsl(var(--md-on-surface))" }}
                    >
                      What's new
                    </h3>
                    <a
                      href={release.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m3-label-small inline-flex items-center gap-1 hover:underline"
                      style={{ color: "hsl(var(--md-primary-ink))" }}
                    >
                      Release notes
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="mt-3">
                    <ChangelogView raw={release.changelog} />
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between gap-3 border-t px-5 py-3 sm:px-6"
            style={{
              borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              background: "hsl(var(--md-surface-container-low) / 0.6)",
            }}
          >
            <p
              className="m3-label-small truncate"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
            >
              GPLv3 · no account needed
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="m3-btn-filled h-9 shrink-0 px-4 text-[13px]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
