import { motion } from "framer-motion";
import { Smartphone, ArrowRight, Database, Zap } from "lucide-react";
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

  const previewDevices = data?.devices?.slice(0, 6) || [];

  return (
    <section id="catalog" className="py-40 relative overflow-hidden" style={{ background: "hsl(var(--md-surface))" }}>
      {/* Background Expression */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-secondary/5 blur-[100px] rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
            >
              <div className="m3-chip gap-2 bg-primary/10 text-primary border-primary/20 py-1.5 px-6">
                <Database size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Engineering Index</span>
              </div>
              <div className="m3-chip gap-2 bg-secondary/10 text-secondary border-secondary/20 py-1.5 px-6">
                <Zap size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Redis Distributed</span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="m3-display-medium text-on-surface mb-8 leading-tight tracking-tighter"
            >
              Hardware Intelligence, <br />
              <span className="m3-gradient-text italic font-serif">resolved.</span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="m3-body-large text-on-surface-variant opacity-70 leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0"
            >
              A pure engineering database of device specifications. Zero slop.
              Distributed across Vercel Edge for instant technical lookup and comparative analysis.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/spec"
                className="m3-btn-filled py-5 px-12 text-lg gap-3 shadow-2xl shadow-primary/20 active:scale-95 transition-transform"
              >
                Launch Catalog
                <ArrowRight size={24} />
              </Link>
            </motion.div>
          </div>

          {/* Visual Preview Grid - Responsive Perspectives */}
          <div className="flex-1 relative w-full overflow-visible">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 perspective-1000">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4.2] rounded-[32px] bg-surface-container animate-pulse" />
                ))
              ) : (
                previewDevices.map((dev, i) => (
                  <motion.div
                    key={dev.matched_device}
                    initial={{ opacity: 0, scale: 0.8, rotateY: 20, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -12, scale: 1.08, z: 20 }}
                    className="aspect-[3/4.2] m3-card-filled p-4 flex flex-col items-center justify-between border border-outline-variant/10 group cursor-pointer transition-all duration-500 shadow-2xl shadow-black/40"
                  >
                    <div className="w-full h-[75%] flex items-center justify-center p-4 bg-surface-container-low rounded-[24px] overflow-hidden shadow-inner relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={dev.image}
                        alt={dev.matched_device}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 rounded-[16px]"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 w-full overflow-hidden">
                       <span className="m3-label-small text-on-surface text-center line-clamp-1 font-bold uppercase tracking-widest text-[9px] opacity-80 group-hover:text-primary transition-colors">
                         {dev.matched_device}
                       </span>
                       <div className="h-0.5 w-0 bg-primary/40 rounded-full group-hover:w-1/2 transition-all duration-500" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Expressive Overlay */}
            <div className="absolute -inset-10 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none z-20" />
          </div>

        </div>

        {/* Stats Section */}
        <div className="mt-32 pt-16 border-t border-outline-variant/10 flex flex-wrap justify-center lg:justify-between gap-12">
           <div className="flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-[22%] bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                 <Smartphone size={32} />
              </div>
              <div>
                 <div className="m3-title-large text-on-surface font-black tracking-tighter italic font-serif leading-none group-hover:text-primary transition-colors">{data?.totalInRedis || 0}</div>
                 <div className="m3-label-small uppercase tracking-[0.2em] opacity-40 font-black mt-1">Verified Nodes</div>
              </div>
           </div>

           <div className="flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-[22%] bg-secondary/10 flex items-center justify-center text-secondary shadow-lg border border-secondary/20 group-hover:scale-110 transition-transform duration-500">
                 <Zap size={32} />
              </div>
              <div>
                 <div className="m3-title-large text-on-surface font-black tracking-tighter italic font-serif leading-none group-hover:text-secondary transition-colors">100%</div>
                 <div className="m3-label-small uppercase tracking-[0.2em] opacity-40 font-black mt-1">Local Edge Latency</div>
              </div>
           </div>

           <div className="flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-[22%] bg-surface-container-highest flex items-center justify-center text-on-surface-variant shadow-lg border border-outline-variant/20 group-hover:scale-110 transition-transform duration-500">
                 <Database size={32} />
              </div>
              <div>
                 <div className="m3-title-large text-on-surface font-black tracking-tighter italic font-serif leading-none">∞</div>
                 <div className="m3-label-small uppercase tracking-[0.2em] opacity-40 font-black mt-1">Infinite Scaling</div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
