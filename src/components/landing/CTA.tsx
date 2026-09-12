import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Download, Users, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { useUpdateManifest } from "@/hooks/use-update-manifest";

const DownloadCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 2.5,
      ease: "circOut"
    });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const CTA = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const navigate = useNavigate();
  const { totalDownloads, isLoading } = useGithubDownloads();
  const { versionName } = useUpdateManifest();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Quiet background: faint grid + one soft static glow */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[420px] opacity-[0.07] blur-[100px]"
          style={{ background: "hsl(var(--md-primary))" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="max-w-5xl mx-auto rounded-[28px] md:rounded-[40px] p-6 sm:p-10 md:p-14 overflow-hidden relative"
          style={{
            background: "hsl(var(--md-surface-container-high))",
            border: "1px solid hsl(var(--md-outline-variant) / 0.45)",
            boxShadow: "inset 0 1px 0 hsl(var(--md-on-surface) / 0.06), 0 32px 64px -32px rgba(0,0,0,0.6)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 md:gap-12 items-center">
            {/* Left: copy + actions */}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="m3-display-medium text-4xl md:text-6xl mb-4 md:mb-5 text-on-surface tracking-tight"
              >
                Get Toolz.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.18 }}
                className="m3-body-large text-[15px] md:text-lg text-on-surface-variant mb-3 max-w-md leading-relaxed"
              >
                Free and open-source (GPLv3) for Android 12 and up. Grab the APK
                for your architecture from GitHub Releases{versionName ? ` — latest is v${versionName}` : ""}.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.24 }}
                className="text-[12.5px] md:text-[13px] mb-8 md:mb-10 text-on-surface-variant/70"
              >
                No account. No ads. Updates install from inside the app.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={onDownloadClick}
                  className="m3-btn-filled py-4 md:py-5 px-8 md:px-10 text-base md:text-lg gap-2.5 shadow-xl shadow-primary/25 active:scale-95 transition-transform"
                >
                  <Download size={22} />
                  Download
                </button>
                <a
                  href="https://github.com/freroxx/toolz/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m3-btn-outlined py-4 md:py-5 px-8 md:px-10 text-base md:text-lg gap-2 active:scale-95 transition-transform"
                >
                  All releases
                  <ArrowUpRight size={19} />
                </a>
              </motion.div>
            </div>

            {/* Right: download count */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-[24px] md:rounded-[32px] border p-8 md:p-10 flex flex-col items-center text-center"
              style={{
                background: "hsl(var(--md-surface-container-lowest) / 0.6)",
                borderColor: "hsl(var(--md-outline-variant) / 0.35)",
              }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-5 md:mb-6">
                <Users size={30} />
              </div>

              <div className="m3-display-medium text-5xl md:text-6xl font-bold tracking-tight text-on-surface mb-2 tabular-nums">
                {isLoading ? "…" : <DownloadCounter value={totalDownloads || 0} />}
              </div>

              <div className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/60 mb-6 md:mb-7">
                Downloads on GitHub
              </div>

              <button
                onClick={() => navigate('/downloads')}
                className="inline-flex items-center gap-2 text-[13px] md:text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-5 py-2.5 rounded-full transition-all active:scale-95 group"
              >
                Per-release stats
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
