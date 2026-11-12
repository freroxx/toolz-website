import { motion } from "framer-motion";
import { Download, ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { useLatestRelease } from "@/hooks/use-latest-release";
import DownloadCounter from "@/components/landing/DownloadCounter";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES } from "@/components/expressive/shapes";

const CTA = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const navigate = useNavigate();
  const { totalDownloads, isLoading } = useGithubDownloads();
  const { versionName } = useLatestRelease();

  return (
    <section className="py-20 md:py-28" style={{ background: "hsl(var(--md-surface))" }}>
      <div className="container mx-auto px-4">
        <div
          className="p-8 sm:p-12 md:p-16"
          style={{
            borderRadius: SHAPES.extraLarge,
            background: "hsl(var(--md-primary-container))",
            color: "hsl(var(--md-on-primary-container))",
          }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <h2 className="m3-display-medium text-balance font-bold">
                Ready to simplify your phone?
              </h2>
              <p className="m3-body-large mt-4 max-w-md text-pretty opacity-90">
                Get the universal APK or an architecture-specific build
                {versionName ? ` (v${versionName})` : ""}. No accounts, no subscriptions, no tracking.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  onClick={onDownloadClick}
                  whileTap={{ scale: 0.96 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled gap-2.5 px-8 py-4 text-base font-semibold"
                >
                  <Download size={20} />
                  Download v{versionName}
                </motion.button>
                <motion.a
                  href="https://github.com/freroxx/toolz/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.96 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-outlined gap-2 px-7 py-4 text-base font-semibold"
                  style={{
                    color: "hsl(var(--md-on-primary-container))",
                    borderColor: "hsl(var(--md-on-primary-container) / 0.4)",
                  }}
                >
                  All releases
                  <ArrowUpRight size={18} />
                </motion.a>
              </div>
            </div>

            <div
              className="p-7 md:p-9"
              style={{
                borderRadius: SHAPES.large,
                background: "hsl(var(--md-on-primary-container) / 0.08)",
              }}
            >
              <div className="m3-display-small font-bold tabular-nums">
                {isLoading ? (
                  <div
                    className="h-10 w-28 animate-pulse rounded-xl"
                    style={{ background: "hsl(var(--md-on-primary-container) / 0.15)" }}
                  />
                ) : (
                  <DownloadCounter value={totalDownloads || 0} duration={2.5} />
                )}
              </div>
              <p className="m3-label-large mt-1 font-semibold opacity-80">Total GitHub downloads</p>

              <button
                onClick={() => navigate("/downloads")}
                className="m3-label-large mt-6 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline"
              >
                Architecture statistics
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
