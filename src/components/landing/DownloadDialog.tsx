import { motion } from "framer-motion";
import { AlertTriangle, Download, ExternalLink, X } from "lucide-react";
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

/**
 * Download sheet. One clear primary action (the build for this device), the
 * other ABIs as a quiet list, then release notes. Phone browsers get a bottom
 * sheet, larger screens a centred dialog. Radix handles focus, Escape, scroll lock.
 */
const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const release = useLatestRelease();
  const { totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

  const primary =
    release.apks.find((a) => a.abi === release.detectedAbi) ?? release.apks[0];
  const others = release.apks.filter((a) => a !== primary);
  const isMatch = primary && primary.abi === release.detectedAbi;
  const primarySize = primary ? formatApkSize(primary.sizeBytes) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-x-0 bottom-0 top-auto flex h-[92dvh] w-full max-w-xl translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[28px] border-0 bg-transparent p-0 shadow-none focus:outline-none data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[86vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="flex h-full w-full flex-col overflow-hidden"
          style={{
            background: "hsl(var(--md-surface-container-low))",
            borderRadius: "inherit",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
            <div className="min-w-0">
              <DialogTitle asChild>
                <h2 className="m3-headline-small font-bold text-on-surface">Download Toolz</h2>
              </DialogTitle>
              <DialogDescription className="m3-body-medium mt-1 text-on-surface-variant">
                Android 12+ · version {release.versionName} ·{" "}
                {isDownloadsLoading ? (
                  "…"
                ) : (
                  <>
                    <DownloadCounter value={totalDownloads || 0} /> downloads
                  </>
                )}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <div className="space-y-8">
              {/* Primary build */}
              {release.isLoading ? (
                <div
                  className="h-[148px] animate-pulse rounded-[24px]"
                  style={{ background: "hsl(var(--md-surface-container-high))" }}
                />
              ) : primary ? (
                <div
                  className="rounded-[24px] p-6"
                  style={{
                    background: "hsl(var(--md-primary-container))",
                    color: "hsl(var(--md-on-primary-container))",
                  }}
                >
                  <p className="m3-label-large font-semibold opacity-80">
                    {isMatch ? "Recommended for this device" : "Latest build"}
                  </p>
                  <p className="m3-title-large mt-1 font-bold">{primary.label}</p>
                  <p className="m3-body-medium mt-0.5 opacity-85">
                    {release.abiHint(primary.abi)}
                    {primarySize ? ` · ${primarySize}` : ""} · Signed APK
                  </p>
                  <a
                    href={primary.downloadUrl}
                    className="m3-btn-filled mt-5 w-full justify-center gap-2 py-3.5 font-semibold"
                  >
                    <Download size={18} />
                    Download v{release.versionName}
                  </a>
                </div>
              ) : (
                <a
                  href={release.releasesPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[20px] p-5"
                  style={{
                    background: "hsl(var(--md-surface-container))",
                    color: "hsl(var(--md-on-surface-variant))",
                  }}
                >
                  <AlertTriangle size={18} className="shrink-0" />
                  <span className="m3-body-medium">
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

              {/* Other builds */}
              {others.length > 0 && (
                <section aria-labelledby="download-others-heading">
                  <h3
                    id="download-others-heading"
                    className="m3-title-small mb-2 font-bold text-on-surface"
                  >
                    Other builds
                  </h3>
                  <p className="m3-body-small mb-3 text-on-surface-variant">
                    Android rejects a build for the wrong architecture, so you can safely try the next one.
                  </p>
                  <ul
                    className="overflow-hidden rounded-[20px]"
                    style={{ background: "hsl(var(--md-surface-container))" }}
                  >
                    {others.map((apk, i) => {
                      const size = formatApkSize(apk.sizeBytes);
                      return (
                        <li
                          key={apk.abi}
                          style={{
                            borderTop:
                              i > 0 ? "1px solid hsl(var(--md-outline-variant) / 0.4)" : "none",
                          }}
                        >
                          <a
                            href={apk.downloadUrl}
                            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-high"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="m3-title-small block truncate text-on-surface">
                                {apk.label}
                              </span>
                              <span className="m3-body-small block truncate text-on-surface-variant">
                                {release.abiHint(apk.abi)}
                                {size ? ` · ${size}` : ""}
                              </span>
                            </span>
                            <Download size={18} className="shrink-0 text-on-surface-variant" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Changelog */}
              {!release.isLoading && release.changelog && (
                <section aria-labelledby="download-changelog-heading">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3
                      id="download-changelog-heading"
                      className="m3-title-small font-bold text-on-surface"
                    >
                      What's new
                    </h3>
                    <a
                      href={release.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m3-label-large inline-flex items-center gap-1 font-semibold hover:underline"
                      style={{ color: "hsl(var(--md-primary-ink))" }}
                    >
                      Release notes
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <ChangelogView raw={release.changelog} />
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
