import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
      active ? "m3-chip-active scale-105 shadow-lg shadow-primary/20" : "hover:scale-105"
    )}
  >
    {label}
  </button>
);

const SpecDetailsDialog = ({ device }: { device: SpecPayload }) => {
  return (
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 border-none bg-surface-container-high rounded-[40px] shadow-2xl custom-scrollbar selection:bg-primary/30">
      <div className="relative">
        {/* Header Hero */}
        <div className="p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center md:items-start border-b border-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-56 h-72 bg-surface-container-lowest rounded-[40px] p-8 flex items-center justify-center shadow-2xl border border-outline-variant/20 shrink-0 relative z-10"
          >
            <img
              src={device.image || "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg"}
              alt={device.matched_device}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";
              }}
            />
          </motion.div>

          <div className="flex flex-col gap-6 text-center md:text-left relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="m3-chip bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-[0.2em] py-1">
                   Technical Sheet
                </span>
                {device.cached && (
                  <span className="m3-chip bg-secondary/10 text-secondary border-secondary/20 text-[10px] uppercase font-bold tracking-[0.2em] py-1">
                    ⚡ Instant Cache
                  </span>
                )}
              </div>
              <h2 className="m3-display-medium text-on-surface leading-tight tracking-tight">
                {device.matched_device}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href={device.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="m3-btn-filled py-3 px-8 text-sm gap-2 shadow-xl shadow-primary/20"
              >
                GSMArena ↗
              </a>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {Object.entries(device.specifications).map(([section, data]) => (
            <div key={section} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-6 w-1.5 bg-primary rounded-full" />
                <h3 className="m3-title-large text-on-surface font-bold">
                  {section}
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(data).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col py-2 border-b border-outline-variant/5"
                  >
                    <span className="m3-label-medium text-on-surface-variant opacity-60 font-bold uppercase tracking-wider mb-1">
                      {key}
                    </span>
                    <span className="m3-body-medium text-on-surface">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-10 bg-surface-container-highest/50 border-t border-outline-variant/20 text-center">
          <p className="m3-body-small text-on-surface-variant opacity-30 font-mono tracking-widest text-[10px]">
             Toolz V3 Server-Side Resolution Engine
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

const SpecCard = ({ device }: { device: SpecPayload }) => {
  const specs = device.specifications || {};
  const displaySize = specs['Display']?.['Size']?.split(',')[0] || 'OLED';
  const chip = specs['Platform']?.['Chipset']?.split('(')[0]?.trim() || 'SoC';

  const brandMatch = device.matched_device.match(/^(Samsung|Apple|Google|Xiaomi|Poco|Redmi|OnePlus|Nothing|Motorola|Realme|Sony|Asus|Honor|vivo|Oppo)/i);
  const brand = brandMatch ? brandMatch[1] : 'Device';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          viewport={{ once: true }}
          className="m3-card-filled group cursor-pointer flex flex-col h-full bg-surface-container shadow-xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-500"
        >
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="w-full h-48 bg-surface-container-low rounded-[32px] p-6 flex items-center justify-center border border-outline-variant/5 group-hover:bg-surface-container-high transition-colors duration-500 overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <img
                  src={device.image || "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg"}
                  alt={device.matched_device}
                  className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-700 ease-emphasized"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";
                  }}
                />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="m3-label-small text-primary font-black uppercase tracking-[0.2em]">
                  {brand}
                </span>
                <h3 className="m3-title-large text-on-surface line-clamp-1">
                  {device.matched_device}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-highest/40 p-3 rounded-2xl flex items-center gap-3">
                  <Monitor size={14} className="text-secondary" />
                  <span className="m3-label-medium text-on-surface-variant truncate">{displaySize}</span>
                </div>
                <div className="bg-surface-container-highest/40 p-3 rounded-2xl flex items-center gap-3">
                  <Cpu size={14} className="text-primary" />
                  <span className="m3-label-medium text-on-surface-variant truncate">{chip}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="m3-btn-tonal w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
              Details
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

  const blobY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 600);
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
    <div className="min-h-screen bg-surface selection:bg-primary/30 selection:text-primary-foreground font-sans">
      {/* Expressions */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          style={{ y: blobY }}
          className="absolute -top-40 -right-40 w-[800px] h-[800px] m3-blob opacity-[0.12]"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-[inherit]" style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)" }} />
        </motion.div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        {/* Nav */}
        <div className="flex items-center justify-between mb-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="m3-btn-outlined px-6 py-3 text-sm gap-3 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
            Home
          </motion.button>

          <a
            href="/api/info"
            target="_blank"
            className="m3-chip gap-2 bg-surface-container-high border-outline-variant/30 hover:bg-primary/10 transition-colors py-2 px-6"
          >
            <Info size={16} className="text-primary" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Architecture</span>
          </a>
        </div>

        {/* Hero */}
        <div ref={heroRef} className="text-center mb-24 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="m3-chip gap-2 bg-primary/10 text-primary border-primary/20 mx-auto py-1.5 px-6"
          >
            <Smartphone size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{data?.totalInRedis || 0} Devices Indexed</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            className="m3-display-large text-on-surface"
          >
            Pure 100%{" "}
            <span className="m3-gradient-text italic font-serif relative">
              Catalog.
              <motion.div
                 initial={{ scaleX: 0 }}
                 animate={{ scaleX: 1 }}
                 transition={{ delay: 0.8, duration: 1 }}
                 className="absolute bottom-2 left-0 right-0 h-4 bg-primary/10 -z-10 origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="m3-body-large text-on-surface-variant max-w-xl mx-auto opacity-70 leading-relaxed"
          >
            Zero slop. Just clean technical specifications resolved via server-side extraction and Upstash Redis.
          </motion.p>
        </div>

        {/* Search */}
        <div className="max-w-4xl mx-auto mb-20 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-primary opacity-50">
              <Search size={28} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model (e.g. S24 Ultra, Pixel 9 Pro)..."
              className="w-full h-20 md:h-24 bg-surface-container-high/50 backdrop-blur-xl border-2 border-outline-variant/20 rounded-[40px] pl-20 pr-8 m3-title-medium text-on-surface outline-none focus:border-primary focus:bg-surface-container transition-all shadow-2xl shadow-black/30"
            />
            {isFetching && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <RefreshCw size={24} className="animate-spin text-primary opacity-50" />
              </div>
            )}
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {["All", "Samsung", "Apple", "Google", "Xiaomi", "OnePlus", "Nothing"].map((btn) => (
              <FilterChip
                key={btn}
                label={btn}
                active={filter === btn}
                onClick={() => setFilter(btn)}
              />
            ))}
          </div>
        </div>

        {/* Alert */}
        <AnimatePresence>
          {data?.autoEnriched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-2xl mx-auto mb-16 m3-card-filled bg-secondary/10 border border-secondary/20 p-6 flex items-center gap-6 text-secondary shadow-lg shadow-secondary/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
                <Zap size={28} />
              </div>
              <div>
                <p className="m3-title-medium font-black uppercase tracking-widest text-[10px]">Database Augmented</p>
                <p className="m3-body-small opacity-80 mt-1">
                  New model resolved and indexed into the global Redis dictionary.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="min-h-[400px]">
          {isLoading && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[450px] rounded-[40px] bg-surface-container-high animate-pulse" />
              ))}
            </div>
          ) : filteredDevices.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredDevices.map((dev) => (
                <SpecCard key={dev.matched_device} device={dev} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-32 space-y-6">
              <div className="w-24 h-24 bg-surface-container-high rounded-[32px] flex items-center justify-center mx-auto text-on-surface-variant/10 shadow-inner">
                <Search size={48} />
              </div>
              <h2 className="m3-headline-medium text-on-surface opacity-30">No matches found</h2>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-40 text-center space-y-12">
           <div className="m3-divider opacity-10 max-w-lg mx-auto" />
           <div className="flex flex-wrap justify-center gap-12">
              <div className="text-center">
                 <div className="m3-display-small text-primary font-serif italic">{data?.totalInRedis || 0}</div>
                 <div className="m3-label-small uppercase tracking-[0.2em] font-black opacity-30 mt-2">Indexed</div>
              </div>
              <div className="text-center">
                 <div className="m3-display-small text-secondary font-serif italic">∞</div>
                 <div className="m3-label-small uppercase tracking-[0.2em] font-black opacity-30 mt-2">Scalability</div>
              </div>
           </div>
           <p className="m3-body-small text-on-surface-variant opacity-30 max-w-md mx-auto leading-relaxed uppercase tracking-widest text-[10px]">
             Toolz Hardware Resolution Engine • Vercel Edge • Upstash Redis
           </p>
        </footer>
      </div>
    </div>
  );
};

export default SpecPage;
