import { motion } from "framer-motion";
import { Download, Users, ArrowRight, ArrowUpRight } from "lucide-react";
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
          className="relative overflow-hidden rounded-[28px] border p-6 sm:p-9 md:rounded-[36px] md:p-12 shadow-sm"
          style={{
            background: "hsl(var(--md-primary-container))",
            borderColor: "hsl(var(--md-outline-variant) / 0.5)",
          }}
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            {/* ── Copy ── */}
            <div>
              <span
                className="m3-chip border-transparent font-semibold shadow-xs"
                style={{
                  background: "hsl(var(--md-primary) / 0.18)",
                  color: "hsl(var(--md-on-primary-container))",
                }}
              >
                Open Source Utility
              </span>

              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 }}
                className="m3-display-medium mt-5 font-bold text-balance"
                style={{ color: "hsl(var(--md-on-primary-container))" }}
              >
                Get Toolz.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.14 }}
                className="m3-body-large mt-4 max-w-md leading-relaxed"
                style={{ color: "hsl(var(--md-on-primary-container) / 0.85)" }}
              >
                GPL-3.0 licensed for Android 12 and up. Grab the universal APK or
                the targeted build for your device architecture
                {versionName ? ` (v${versionName})` : ""}.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.22 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <motion.button
                  onClick={onDownloadClick}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled gap-2.5 px-8 py-4 text-base font-semibold shadow-md"
                >
                  <Download size={20} />
                  Download APK
                </motion.button>
                <motion.a
                  href="https://github.com/freroxx/toolz/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-outlined gap-2 px-7 py-4 text-base font-semibold"
                  style={{
                    borderColor: "hsl(var(--md-on-primary-container) / 0.4)",
                    color: "hsl(var(--md-on-primary-container))",
                  }}
                >
                  All releases
                  <ArrowUpRight size={18} />
                </motion.a>
              </motion.div>

              <p
                className="m3-label-medium mt-5 font-medium"
                style={{ color: "hsl(var(--md-on-primary-container) / 0.8)" }}
              >
                No accounts. No ads. Update notifications arrive in-app.
              </p>
            </div>

            {/* ── Download count ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="rounded-[24px] p-7 md:p-9 shadow-md"
              style={{
                background: "hsl(var(--md-primary))",
                color: "hsl(var(--md-on-primary))",
              }}
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-[16px] shadow-xs"
                style={{ background: "hsl(var(--md-on-primary) / 0.16)" }}
              >
                <Users size={24} />
              </span>

              <div className="m3-display-small mt-6 font-bold tabular-nums">
                {isLoading ? "…" : <DownloadCounter value={totalDownloads || 0} duration={2.5} />}
              </div>

              <p className="m3-label-medium mt-1 font-semibold uppercase tracking-[0.14em] opacity-90">
                Total GitHub downloads
              </p>

              <motion.button
                onClick={() => navigate("/downloads")}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -1 }}
                transition={PRESS_SPRING}
                className="m3-label-large mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold shadow-xs"
                style={{
                  background: "hsl(var(--md-on-primary))",
                  color: "hsl(var(--md-primary))",
                }}
              >
                Architecture statistics
                <ArrowRight size={15} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
