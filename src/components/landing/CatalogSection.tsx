import { motion } from "framer-motion";
import { Smartphone, ArrowRight, Sparkles, Database, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface SpecPayload {
  matched_device: string;
  image: string;
  specifications: Record<string, Record<string, string>>;
}

interface CatalogResponse {
  totalInRedis: number;
  devices: SpecPayload[];
}

const CatalogSection = () => {
  const { data, isLoading } = useQuery<CatalogResponse>({
    queryKey: ["catalog-preview"],
    queryFn: async () => {
      const res = await fetch("/api/spec?json=1");
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    },
    staleTime: 60000,
  });

  const previewDevices = data?.devices?.slice(0, 4) || [];

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "hsl(var(--md-surface-container-lowest))" }}>
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-center lg:text-left"
          >
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
              <div className="m3-chip gap-2 bg-primary/10 text-primary border-primary/20 py-1.5 px-6">
                <Database size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hardware Index</span>
              </div>
              <div className="m3-chip gap-2 bg-secondary/10 text-secondary border-secondary/20 py-1.5 px-6">
                <Zap size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Redis Sync</span>
              </div>
            </div>
            <h2 className="m3-display-medium text-on-surface mb-6">
              The world's hardware, <br />
              <span className="m3-gradient-text italic font-serif">at your fingertips.</span>
            </h2>
            <p className="m3-body-large text-on-surface-variant opacity-70 leading-relaxed mb-10">
              Explore a massive database of 25,000+ Android devices and flagships.
              Real-time server-side extraction and Upstash Redis caching for instant technical insights.
            </p>
            <Link
              to="/spec"
              className="m3-btn-filled py-4 px-10 text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Explore Catalog
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 lg:w-1/2"
          >
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="w-40 h-56 rounded-[32px] bg-surface-container animate-pulse" />
              ))
            ) : (
              previewDevices.map((dev, i) => (
                <motion.div
                  key={dev.matched_device}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-40 h-56 m3-card-filled p-4 flex flex-col items-center justify-between border border-outline-variant/10 group cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="w-full h-32 flex items-center justify-center p-2 bg-surface-container-low rounded-[20px] overflow-hidden">
                    <img
                      src={dev.image}
                      alt={dev.matched_device}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="m3-label-small text-on-surface text-center line-clamp-2 font-bold leading-tight">
                    {dev.matched_device}
                  </span>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-outline-variant/20">
          <div className="flex flex-col items-center text-center gap-2">
             <div className="m3-title-large text-primary flex items-center gap-2">
                <Smartphone size={20} />
                {data?.totalInRedis || "25,000+"}
             </div>
             <span className="m3-label-medium uppercase tracking-widest opacity-40 font-black text-[10px]">Devices Indexed</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
             <div className="m3-title-large text-secondary flex items-center gap-2">
                <Zap size={20} />
                Instant
             </div>
             <span className="m3-label-medium uppercase tracking-widest opacity-40 font-black text-[10px]">Resolution Speed</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
             <div className="m3-title-large text-on-surface flex items-center gap-2">
                <Sparkles size={20} />
                No Slop
             </div>
             <span className="m3-label-medium uppercase tracking-widest opacity-40 font-black text-[10px]">Technical Accuracy</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
