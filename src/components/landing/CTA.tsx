import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Download, Users, ArrowRight, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useGithubDownloads } from "@/hooks/use-github-downloads";

const DownloadCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 3, ease: [0.34, 1.56, 0.64, 1] });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const CTA = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const { data: totalDownloads, isLoading } = useGithubDownloads();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* M3 Expressive Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 blur-[120px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--md-primary)) 0%, hsl(var(--md-secondary)) 30%, transparent 70%)"
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] opacity-10"
        >
          <div className="w-full h-full m3-blob bg-primary" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="max-w-5xl mx-auto rounded-[48px] p-8 md:p-16 overflow-hidden relative"
          style={{
            background: "hsl(var(--md-surface-container-high))",
            border: "1px solid hsl(var(--md-outline-variant) / 0.5)"
          }}
        >
          {/* Subtle noise/texture overlay would go here if available */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="m3-chip gap-2 bg-primary/10 text-primary border-primary/20 mb-6"
              >
                <Sparkles size={14} />
                Join the movement
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="m3-display-medium mb-6 text-on-surface"
              >
                What are you <br />
                <span className="m3-gradient-text italic font-serif">waiting for?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="m3-body-large text-on-surface-variant mb-10 max-w-md"
              >
                Toolz is evolving every day. Get the App that respects your privacy and powers your productivity.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={onDownloadClick}
                  className="m3-btn-filled py-6 px-10 text-xl gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-transform group"
                >
                  <Download size={24} />
                  Get Toolz Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            <div className="relative">
              {/* Big Expressive Counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="bg-surface-container-highest/50 backdrop-blur-xl border border-outline-variant/30 rounded-[40px] p-10 flex flex-col items-center text-center shadow-2xl"
              >
                <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                  <Users size={40} />
                </div>

                <div className="m3-display-large font-black tracking-tighter text-primary mb-2">
                  {isLoading ? "..." : <DownloadCounter value={totalDownloads || 0} />}
                </div>

                <div className="m3-title-large font-bold text-on-surface-variant tracking-widest uppercase opacity-80">
                  Global Downloads
                </div>

                <div className="mt-8 flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="m3-label-medium font-bold uppercase tracking-wider">Live Updates</span>
                </div>
              </motion.div>

              {/* Decorative elements around counter */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-tertiary rounded-2xl rotate-12 blur-[2px] opacity-20" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary rounded-full blur-[40px] opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
