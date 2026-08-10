import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Smartphone,
  Info,
  ArrowLeft,
  Cpu,
  Monitor,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Zap,
  Battery,
  Database,
  Layers,
  ChevronRight,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SpecPayload {
  search_query: string;
  search_name: string;
  matched_device: string;
  source_url: string;
  image: string;
  specifications: Record<string, Record<string, string>>;
  timing_ms?: number;
  cached?: boolean;
}

interface CatalogResponse {
  totalInRedis: number;
  count: number;
  query: string;
  autoEnriched: boolean;
  devices: SpecPayload[];
}

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "m3-chip m3-state-layer transition-all duration-300",
      active ? "m3-chip-active scale-105 shadow-lg shadow-primary/25 border-primary/30" : "hover:scale-105"
    )}
  >
    {label}
  </button>
);

const SectionIcon = ({ section }: { section: string }) => {
  const s = section.toLowerCase();
  if (s.includes("display")) return <Monitor size={20} />;
  if (s.includes("platform") || s.includes("chip")) return <Cpu size={20} />;
  if (s.includes("battery")) return <Battery size={20} />;
  if (s.includes("camera")) return <Sparkles size={20} />;
  if (s.includes("memory")) return <Layers size={20} />;
  if (s.includes("network")) return <Globe size={20} />;
  return <ChevronRight size={20} />;
};

const SpecDetailsDialog = ({ device }: { device: SpecPayload }) => {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-surface-container-lowest rounded-[40px] shadow-2xl custom-scrollbar selection:bg-primary/30">
      <div className="relative">
        {/* Header Hero Area */}
        <div className="p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center md:items-start border-b border-outline-variant/30 bg-surface-container-low/50">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-64 h-80 bg-white/5 backdrop-blur-md rounded-[48px] p-8 flex items-center justify-center shadow-2xl border border-white/10 shrink-0 relative z-10"
          >
            <img
              src={device.image || "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg"}
              alt={device.matched_device}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";
              }}
            />
          </motion.div>

          <div className="flex flex-col gap-6 text-center md:text-left relative z-10 py-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="m3-chip bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] py-1 px-4">
                   Engineering Spec
                </span>
                {device.cached && (
                  <span className="m3-chip bg-secondary/20 text-secondary border-secondary/30 text-[10px] font-black uppercase tracking-[0.2em] py-1 px-4">
                    ⚡ Upstash Cached
                  </span>
                )}
              </div>
              <h2 className="m3-display-medium text-on-surface leading-tight tracking-tighter drop-shadow-sm">
                {device.matched_device}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <a
                href={device.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="m3-btn-filled py-3 px-8 text-sm gap-2 shadow-2xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
              >
                Full GSMArena ↗
              </a>
              <div className="m3-chip bg-surface-container-high border-outline-variant/30 text-[10px] font-bold uppercase tracking-widest py-1 px-4">
                 Resolution: {device.timing_ms || 1200}ms
              </div>
            </div>
          </div>
        </div>

        {/* Improved Specs Grid */}
        <div className="p-8 md:p-16 space-y-16">
          {Object.entries(device.specifications).map(([section, data], idx) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <SectionIcon section={section} />
                </div>
                <h3 className="m3-headline-small text-on-surface font-bold tracking-tight">
                  {section}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-outline-variant/40 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(data).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col py-2 border-b border-outline-variant/10 group hover:border-primary/20 transition-colors"
                  >
                    <span className="m3-label-medium text-on-surface-variant opacity-60 font-black uppercase tracking-[0.15em] mb-2 group-hover:text-primary transition-colors">
                      {key}
                    </span>
                    <span className="m3-body-medium text-on-surface leading-relaxed font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-12 bg-surface-container-low border-t border-outline-variant/30 text-center">
          <div className="flex items-center justify-center gap-3 text-on-surface-variant opacity-30 mb-4">
             <Database size={16} />
             <span className="m3-label-small font-black uppercase tracking-[0.2em] text-[10px]">Indexed & Verified Hardware Data</span>
          </div>
          <p className="m3-body-small text-on-surface-variant opacity-20 font-mono tracking-tighter text-[9px]">
             Toolz Hardware Resolution Engine v4 • Edge Architecture • 2026 Index
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

const SpecCard = ({ device }: { device: SpecPayload }) => {
  const specs = device.specifications || {};
  const display = specs['Display']?.['Size']?.split(',')[0] || 'OLED';
  const chip = specs['Platform']?.['Chipset']?.split('(')[0]?.trim() || 'SoC';
  const battery = specs['Battery']?.['Type']?.split('mAh')[0] + 'mAh' || 'Li-Ion';

  const brandMatch = device.matched_device.match(/^(Samsung|Apple|Google|Xiaomi|Poco|Redmi|OnePlus|Nothing|Motorola|Realme|Sony|Asus|Honor|vivo|Oppo)/i);
  const brand = brandMatch ? brandMatch[1] : 'Android';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          viewport={{ once: true }}
          className="m3-card-filled group cursor-pointer flex flex-col h-full bg-surface-container shadow-2xl border border-outline-variant/10 hover:border-primary/40 transition-all duration-500"
        >
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="w-full h-52 bg-surface-container-low rounded-[32px] p-8 flex items-center justify-center border border-outline-variant/5 group-hover:bg-surface-container-high transition-colors duration-500 overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <img
                  src={device.image || "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg"}
                  alt={device.matched_device}
                  className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 ease-emphasized"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";
                  }}
                />
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                   <span className="m3-label-small text-primary font-black uppercase tracking-[0.25em] text-[9px] bg-primary/10 px-3 py-1 rounded-full">
                      {brand}
                   </span>
                   {device.cached && <Zap size={12} className="text-secondary" />}
                </div>
                <h3 className="m3-headline-small text-on-surface line-clamp-1 font-bold tracking-tight">
                  {device.matched_device}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-highest/60 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-3 border border-outline-variant/10">
                  <Monitor size={14} className="text-secondary" />
                  <span className="m3-label-medium text-on-surface truncate font-bold">{display}</span>
                </div>
                <div className="bg-surface-container-highest/60 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-3 border border-outline-variant/10">
                  <Battery size={14} className="text-tertiary" />
                  <span className="m3-label-medium text-on-surface truncate font-bold">{battery}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="m3-btn-tonal w-full py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-on-primary transition-all shadow-lg group-hover:shadow-primary/20">
              Technical Details
            </button>
          </div>
        </motion.div>
      </DialogTrigger>
      <SpecDetailsDialog device={device} />
    </Dialog>
  );
};

const SpecPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const blobY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 700);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery<CatalogResponse>({
    queryKey: ["specs", debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/spec?json=1&q=${encodeURIComponent(debouncedSearch)}`);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    },
    staleTime: 60000,
  });

  const filteredDevices = data?.devices?.filter(dev => {
    if (filter === "All") return true;
    return dev.matched_device.toLowerCase().includes(filter.toLowerCase());
  }) || [];

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 selection:text-primary-foreground font-sans text-on-surface">
      {/* ── Expressive Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          style={{ y: blobY }}
          className="absolute -top-40 -right-40 w-[900px] h-[900px] m3-blob opacity-[0.15]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-[inherit]" style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)" }} />
        </motion.div>

        <motion.div
          style={{ y: blob2Y }}
          className="absolute -bottom-40 -left-40 w-[800px] h-[800px] m3-blob-2 opacity-[0.1]"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-[inherit]" style={{ background: "radial-gradient(circle, hsl(var(--md-secondary) / 0.4) 0%, transparent 70%)" }} />
        </motion.div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      </div>

      {/* ── Floating Sync Status ── */}
      <motion.div
         initial={{ y: 100 }}
         animate={{ y: 0 }}
         className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
         <div className="m3-chip gap-3 bg-surface-container-highest/90 backdrop-blur-2xl border-outline-variant/30 py-2 px-6 shadow-2xl flex items-center pointer-events-auto">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isFetching ? "bg-primary" : "bg-secondary")} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
               {isFetching ? "Syncing Redis..." : "Live Catalog"}
            </span>
            <div className="w-px h-4 bg-outline-variant/30" />
            <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{data?.totalInRedis || 0} Devices</span>
         </div>
      </motion.div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mb-24">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="m3-btn-outlined px-8 py-3.5 text-sm gap-3 active:scale-95 transition-all shadow-xl hover:shadow-primary/10"
          >
            <ArrowLeft size={20} />
            Back Home
          </motion.button>

          <a
            href="/api/info"
            target="_blank"
            className="m3-chip gap-3 bg-surface-container-high border-outline-variant/30 hover:bg-primary/10 transition-all py-2.5 px-8 shadow-sm"
          >
            <Info size={18} className="text-primary" />
            <span className="font-black uppercase tracking-[0.25em] text-[10px]">Architecture</span>
          </a>
        </div>

        {/* ── Hero ── */}
        <motion.div
           ref={heroRef}
           style={{ opacity: headerOpacity, scale: headerScale }}
           className="text-center mb-24 space-y-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="m3-chip gap-3 bg-primary/10 text-primary border-primary/25 mx-auto py-2 px-8 shadow-lg shadow-primary/5"
          >
            <Database size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Upstash Hardware Index</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="m3-display-large text-on-surface tracking-tighter"
          >
            Technical{" "}
            <span className="m3-gradient-text italic font-serif relative inline-block">
              Catalog.
              <motion.div
                 initial={{ scaleX: 0 }}
                 animate={{ scaleX: 1 }}
                 transition={{ delay: 1, duration: 1.2, ease: "circOut" }}
                 className="absolute bottom-4 left-0 right-0 h-6 bg-primary/10 -z-10 origin-left rounded-sm"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="m3-body-large text-on-surface-variant max-w-2xl mx-auto opacity-70 leading-relaxed tracking-wide"
          >
            High-fidelity hardware specifications. Zero slop, pure technical insight.
            Resolved server-side and distributed via Upstash Redis.
          </motion.p>
        </motion.div>

        {/* ── Search Bar ── */}
        <div className="max-w-4xl mx-auto mb-20 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
              <Search size={32} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone model (e.g. S24 Ultra, Pixel 9 Pro)..."
              className="w-full h-24 md:h-28 bg-surface-container-high/40 backdrop-blur-3xl border-2 border-outline-variant/20 rounded-[48px] pl-24 pr-12 m3-title-medium text-on-surface outline-none focus:border-primary focus:bg-surface-container transition-all shadow-2xl shadow-black/40"
            />
            {isFetching && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <RefreshCw size={28} className="animate-spin text-primary opacity-40" />
              </div>
            )}
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4 px-4">
            {["All", "Samsung", "Apple", "Google", "Xiaomi", "OnePlus", "Nothing", "Motorola"].map((btn) => (
              <FilterChip
                key={btn}
                label={btn}
                active={filter === btn}
                onClick={() => setFilter(btn)}
              />
            ))}
          </div>
        </div>

        {/* ── Auto-Enrichment Alert ── */}
        <AnimatePresence>
          {data?.autoEnriched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-2xl mx-auto mb-20 m3-card-filled bg-secondary/10 border border-secondary/25 p-8 flex items-center gap-8 text-secondary shadow-2xl shadow-secondary/5"
            >
              <div className="w-16 h-16 rounded-[24px] bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/20">
                <Zap size={32} />
              </div>
              <div className="space-y-1">
                <p className="m3-title-medium font-black uppercase tracking-[0.25em] text-[10px]">Database Auto-Enriched ✨</p>
                <p className="m3-body-small opacity-80 leading-relaxed font-medium">
                  Specifications extracted from authoritative sources and synchronized to the global hardware index.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Catalog Grid ── */}
        <div className="min-h-[500px] relative">
          {(isLoading || isFetching) && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[480px] rounded-[48px] bg-surface-container-high animate-pulse shadow-inner" />
              ))}
            </div>
          ) : filteredDevices.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {filteredDevices.map((dev) => (
                <SpecCard key={dev.matched_device} device={dev} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-40 space-y-8"
            >
              <div className="w-32 h-32 bg-surface-container-high rounded-[48px] flex items-center justify-center mx-auto text-on-surface-variant/10 shadow-inner">
                <Search size={64} />
              </div>
              <div className="space-y-2">
                 <h2 className="m3-headline-medium text-on-surface opacity-30 font-bold tracking-tight">Search Disambiguation</h2>
                 <p className="m3-label-medium opacity-20 uppercase tracking-[0.3em] font-black">No Exact Matches Found</p>
              </div>
              <button
                onClick={() => { setSearch(""); setFilter("All"); }}
                className="m3-btn-outlined px-12 py-4 rounded-[20px]"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="mt-52 pb-20 text-center space-y-16">
           <div className="m3-divider opacity-10 max-w-2xl mx-auto" />
           <div className="flex flex-wrap justify-center gap-20">
              <div className="text-center group">
                 <div className="m3-display-small text-primary font-serif italic drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{data?.totalInRedis || 0}</div>
                 <div className="m3-label-small uppercase tracking-[0.3em] font-black opacity-30 mt-3 flex items-center gap-2 justify-center">
                    <Database size={12} />
                    Hardware Index
                 </div>
              </div>
              <div className="text-center group">
                 <div className="m3-display-small text-secondary font-serif italic drop-shadow-sm group-hover:scale-110 transition-transform duration-500">∞</div>
                 <div className="m3-label-small uppercase tracking-[0.3em] font-black opacity-30 mt-3 flex items-center gap-2 justify-center">
                    <Globe size={12} />
                    Global Sync
                 </div>
              </div>
              <div className="text-center group">
                 <div className="m3-display-small text-tertiary font-serif italic drop-shadow-sm group-hover:scale-110 transition-transform duration-500">100%</div>
                 <div className="m3-label-small uppercase tracking-[0.3em] font-black opacity-30 mt-3 flex items-center gap-2 justify-center">
                    <ShieldCheck size={12} />
                    Verified Data
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-8">
              <p className="m3-body-small text-on-surface-variant opacity-30 max-w-lg mx-auto leading-relaxed uppercase tracking-[0.2em] text-[10px] font-bold">
                Toolz Hardware Resolution Engine v5 • Distributed Infrastructure
              </p>
              <div className="flex items-center justify-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                 <img src="https://upstash.com/static/logo.svg" alt="Upstash" className="h-4" />
                 <div className="w-px h-4 bg-outline-variant" />
                 <img src="https://www.vercel.com/static/vercel/logo.svg" alt="Vercel" className="h-3" />
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default SpecPage;
