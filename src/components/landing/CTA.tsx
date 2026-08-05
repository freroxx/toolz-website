import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Download, Users, ArrowRight, Sparkles, BarChart } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGithubDownloads } from "@/hooks/use-github-downloads";

const DownloadCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 3,
      ease: "circOut"
    });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const CTA = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const navigate = useNavigate();
  const { totalDownloads, isLoading } = useGithubDownloads();

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
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="m3-display-medium mb-6 text-on-surface"
              >
                What are you <br />
                <span className="m3-gradient-text italic font-serif text-6xl md:text-8xl">waiting for?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="m3-body-large text-on-surface-variant mb-10 max-w-md leading-relaxed"
              >
                Toolz is an ever-evolving utility suite. Get the App that respects your privacy and powers your productivity.
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
                  className="m3-btn-filled py-6 px-12 text-xl gap-4 shadow-2xl shadow-primary/30 active:scale-95 transition-all group rounded-[24px]"
                >
                  <Download size={24} />
                  Get Toolz Now
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            <div className="relative">
              {/* Big Expressive Counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-surface-container-highest/40 backdrop-blur-3xl border border-outline-variant/20 rounded-[48px] p-12 flex flex-col items-center text-center shadow-2xl shadow-black/10"
              >
                <div className="w-24 h-24 rounded-[32%] bg-secondary/10 flex items-center justify-center text-secondary mb-8">
                  <Users size={48} />
                </div>

                <div className="m3-display-large font-black tracking-tighter text-primary mb-3 text-7xl md:text-9xl">
                  {isLoading ? "..." : <DownloadCounter value={totalDownloads || 0} />}
                </div>

                <div className="m3-title-large font-bold text-on-surface-variant tracking-widest uppercase opacity-60">
                  Global Downloads
                </div>

                <button
                  onClick={() => navigate('/downloads')}
                  className="mt-8 flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 px-6 py-3 rounded-full transition-all active:scale-95 group"
                >
                  <BarChart size={16} />
                  <span className="m3-label-large font-bold uppercase tracking-wider">Stats</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
