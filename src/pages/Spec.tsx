import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Info,
  ArrowLeft,
  Cpu,
  Monitor,
  Sparkles,
  RefreshCw,
  Battery,
  Layers,
  ChevronRight,
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
      active ? "m3-chip-active scale-105" : "hover:scale-105"
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
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 border-none bg-surface-container-low rounded-[40px] shadow-2xl custom-scrollbar selection:bg-primary/30">
      <div className="relative">
        <div className="p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-10 items-center md:items-start border-b border-outline-variant/20">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-52 h-72 bg-white rounded-[32px] p-6 flex items-center justify-center shadow-xl border border-outline-variant/10 shrink-0 relative z-10"
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

          <div className="flex flex-col gap-6 text-center md:text-left relative z-10 py-2">
            <div className="space-y-3">
              <span className="m3-label-small text-primary font-black uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-full inline-block">
                 Hardware Engineering Sheet
              </span>
              <h2 className="m3-display-medium text-on-surface leading-tight tracking-tighter">
                {device.matched_device}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href={device.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="m3-btn-filled py-3 px-8 text-sm gap-2"
              >
                GSMArena ↗
              </a>
              <div className="m3-chip bg-surface-container-high border-outline-variant/30 text-[10px] font-bold uppercase tracking-widest py-1 px-4">
                 Res: {device.timing_ms || 1200}ms
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 space-y-12">
          {Object.entries(device.specifications).map(([section, data]) => (
            <div key={section} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <SectionIcon section={section} />
                </div>
                <h3 className="m3-title-large text-on-surface font-bold tracking-tight">
                  {section}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex flex-col py-1.5">
                    <span className="m3-label-medium text-on-surface-variant opacity-50 font-bold uppercase tracking-widest text-[9px] mb-1">
                      {key}
                    </span>
                    <span className="m3-body-medium text-on-surface font-medium leading-relaxed">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  );
};

const SpecCard = ({ device }: { device: SpecPayload }) => {
  const specs = device.specifications || {};
  const display = specs['Display']?.['Size']?.split(',')[0] || 'OLED';
  const battery = specs['Battery']?.['Type']?.split('mAh')[0] + 'mAh' || 'Li-Ion';

  const brandMatch = device.matched_device.match(/^(Samsung|Apple|Google|Xiaomi|Poco|Redmi|OnePlus|Nothing|Motorola|Realme|Sony|Asus|Honor|vivo|Oppo)/i);
  const brand = brandMatch ? brandMatch[1] : 'Device';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="m3-card-filled group cursor-pointer flex flex-col h-full bg-surface-container hover:bg-surface-container-high transition-all duration-500 border border-outline-variant/10"
        >
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="w-full h-48 bg-white rounded-[28px] p-6 flex items-center justify-center border border-outline-variant/5 group-hover:scale-[1.02] transition-transform duration-700 overflow-hidden relative shadow-sm">
               <img
                  src={device.image || "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg"}
                  alt={device.matched_device}
                  className="max-w-full max-h-full object-contain relative z-10 group-hover:rotate-3 transition-all duration-700"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";
                  }}
                />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="m3-label-small text-primary font-black uppercase tracking-[0.2em] text-[9px]">
                  {brand}
                </span>
                <h3 className="m3-title-medium text-on-surface line-clamp-1 font-bold">
                  {device.matched_device}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-highest/50 p-2.5 rounded-xl flex items-center gap-2.5">
                  <Monitor size={12} className="text-secondary opacity-60" />
                  <span className="m3-label-medium text-on-surface truncate font-bold text-[11px]">{display}</span>
                </div>
                <div className="bg-surface-container-highest/50 p-2.5 rounded-xl flex items-center gap-2.5">
                  <Battery size={12} className="text-tertiary opacity-60" />
                  <span className="m3-label-medium text-on-surface truncate font-bold text-[11px]">{battery}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="m3-btn-tonal w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const blobY = useTransform(scrollYProgress, [0, 1], [0, 200]);

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
    <div className="min-h-screen bg-surface selection:bg-primary/30 selection:text-primary-foreground font-sans text-on-surface">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          style={{ y: blobY }}
          className="absolute -top-40 -right-40 w-[900px] h-[900px] m3-blob opacity-[0.12]"
        >
          <div className="w-full h-full rounded-[inherit]" style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)" }} />
        </motion.div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <div className="flex items-center justify-between mb-24">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-3 m3-label-large text-on-surface-variant hover:text-primary transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Home
          </motion.button>

          <a
            href="/api/info"
            target="_blank"
            className="m3-chip gap-2 bg-surface-container-high border-outline-variant/30 hover:bg-primary/10 transition-all py-2 px-6"
          >
            <Info size={16} className="text-primary" />
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Architecture</span>
          </a>
        </div>

        <div ref={heroRef} className="text-center mb-24 space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            className="m3-display-large text-on-surface"
          >
            Pure 100%{" "}
            <span className="m3-gradient-text italic font-serif relative inline-block">
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
            transition={{ delay: 0.2 }}
            className="m3-body-large text-on-surface-variant max-w-xl mx-auto opacity-70 leading-relaxed"
          >
            High-fidelity hardware specifications. Zero slop, resolved instantly via server-side engine.
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto mb-20 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model name..."
              className="w-full h-14 bg-surface-container-high border-none rounded-2xl pl-14 pr-12 m3-body-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {isFetching && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <RefreshCw size={16} className="animate-spin text-primary/40" />
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

        <div className="min-h-[400px]">
          {isLoading && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[450px] rounded-[32px] bg-surface-container-high animate-pulse" />
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
            <div className="text-center py-32 space-y-4">
              <h2 className="m3-headline-medium text-on-surface opacity-30">No matches found</h2>
            </div>
          )}
        </div>

        <footer className="mt-40 text-center space-y-12">
           <div className="m3-divider opacity-10 max-w-lg mx-auto" />
           <div className="flex flex-wrap justify-center gap-12">
              <div className="text-center">
                 <div className="m3-display-small text-secondary font-serif italic">∞</div>
                 <div className="m3-label-small uppercase tracking-[0.2em] font-black opacity-30 mt-2">Scale</div>
              </div>
           </div>
           <p className="m3-body-small text-on-surface-variant opacity-30 max-w-md mx-auto uppercase tracking-widest text-[10px] font-bold">
             Hardware Resolution Engine • Distributed Architecture
           </p>
        </footer>
      </div>
    </div>
  );
};

export default SpecPage;
