import { motion } from "framer-motion";
import { Download, Users, ArrowRight, ArrowUpRight, ShieldCheck, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { useLatestRelease } from "@/hooks/use-latest-release";
import DownloadCounter from "@/components/landing/DownloadCounter";
import { PRESS_SPRING } from "@/lib/motion";

const CTA = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const navigate = useNavigate();
  const { totalDownloads, isLoading } = useGithubDownloads();
  const { versionName } = useLatestRelease();

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-[24px] border p-6 sm:p-9 md:p-12 shadow-sm"
          style={{
            background: "hsl(var(--md-surface-container))",
            borderColor: "hsl(var(--md-outline-variant) / 0.5)",
          }}
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            {/* ── Copy ── */}
            <div>
              <div
                className="m3-chip inline-flex items-center gap-2 border-transparent font-semibold shadow-xs"
                style={{
                  background: "hsl(var(--md-secondary-container))",
                  color: "hsl(var(--md-on-secondary-container))",
                }}
              >
                <Smartphone size={14} />
                Android 12 and up · GPL-3.0
              </div>

              <h2
                className="m3-display-medium mt-5 font-bold text-balance text-on-surface"
              >
                Ready to simplify your phone?
              </h2>

              <p
                className="m3-body-large mt-4 max-w-md leading-relaxed text-on-surface-variant"
              >
                Download the universal APK or targeted architecture build
                {versionName ? ` (v${versionName})` : ""}. No accounts, no subscriptions,
                and no tracking — ever.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  onClick={onDownloadClick}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled gap-2.5 px-8 py-4 text-base font-semibold shadow-md"
                >
                  <Download size={20} />
                  Download v{versionName}
                </motion.button>
                <motion.a
                  href="https://github.com/freroxx/toolz/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-outlined gap-2 px-7 py-4 text-base font-semibold"
                >
                  All releases
                  <ArrowUpRight size={18} />
                </motion.a>
              </div>

              <div className="mt-6 flex items-center gap-2 text-on-surface-variant m3-label-medium">
                <ShieldCheck size={16} style={{ color: "hsl(var(--md-primary-ink))" }} />
                <span>Verified open source on GitHub. Updates arrive in-app.</span>
              </div>
            </div>

            {/* ── Download count card ── */}
            <div
              className="rounded-[20px] border p-7 md:p-9 shadow-sm"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                borderColor: "hsl(var(--md-outline-variant) / 0.5)",
              }}
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-[14px]"
                style={{
                  background: "hsl(var(--md-primary-container))",
                  color: "hsl(var(--md-on-primary-container))",
                }}
              >
                <Users size={22} />
              </div>

              <div className="m3-display-small mt-6 font-bold tabular-nums text-on-surface">
                {isLoading ? "…" : <DownloadCounter value={totalDownloads || 0} duration={2.5} />}
              </div>

              <p className="m3-label-medium mt-1 font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                Total GitHub downloads
              </p>

              <motion.button
                onClick={() => navigate("/downloads")}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -1 }}
                transition={PRESS_SPRING}
                className="m3-btn-tonal mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
              >
                Architecture statistics
                <ArrowRight size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
