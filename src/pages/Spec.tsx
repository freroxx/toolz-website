import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Info,
  ArrowLeft,
  Cpu,
  Monitor,
  Sparkles,
  Battery,
  Layers,
  ChevronRight,
  Globe,
  Plus,
  Check,
  X,
  ArrowLeftRight,
  ExternalLink,
  Database,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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

const FALLBACK_IMG =
  "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";

const BRANDS = [
  "All",
  "Samsung",
  "Apple",
  "Google",
  "Xiaomi",
  "Redmi",
  "Poco",
  "OnePlus",
  "Nothing",
  "Motorola",
  "Oppo",
  "Vivo",
  "Realme",
  "Honor",
  "Huawei",
  "Sony",
  "Asus",
  "Infinix",
  "Tecno",
] as const;

const BRAND_PATTERN =
  /^(samsung|apple|google|xiaomi|redmi|poco|oneplus|nothing|motorola|oppo|vivo|realme|honor|huawei|sony|asus|infinix|tecno|nokia|lenovo|lg)/i;

function getBrand(deviceName: string): string {
  const m = deviceName.trim().match(BRAND_PATTERN);
  if (!m) return "Other";
  const raw = m[1].toLowerCase();
  // Normalize capitalization
  const map: Record<string, string> = {
    samsung: "Samsung",
    apple: "Apple",
    google: "Google",
    xiaomi: "Xiaomi",
    redmi: "Redmi",
    poco: "Poco",
    oneplus: "OnePlus",
    nothing: "Nothing",
    motorola: "Motorola",
    oppo: "Oppo",
    vivo: "Vivo",
    realme: "Realme",
    honor: "Honor",
    huawei: "Huawei",
    sony: "Sony",
    asus: "Asus",
    infinix: "Infinix",
    tecno: "Tecno",
    nokia: "Nokia",
    lenovo: "Lenovo",
    lg: "LG",
  };
  return map[raw] ?? m[1];
}

function getDisplaySummary(device: SpecPayload): string {
  const v =
    device.specifications?.["Display"]?.["Size"] ??
    device.specifications?.["Display"]?.["Type"] ??
    "";
  if (!v) return "Display N/A";
  return v.split(",")[0].trim().slice(0, 28);
}

function getBatterySummary(device: SpecPayload): string {
  const v = device.specifications?.["Battery"]?.["Type"] ?? "";
  if (!v) return "Battery N/A";
  const m = v.match(/(\d[\d\s,]*)\s*mAh/i);
  if (m) return `${m[1].replace(/\s/g, "")} mAh`;
  return v.split(",")[0].trim().slice(0, 24);
}

function getChipSummary(device: SpecPayload): string {
  const v =
    device.specifications?.["Platform"]?.["Chipset"] ??
    device.specifications?.["Platform"]?.["CPU"] ??
    "";
  if (!v) return "";
  return v.split(",")[0].trim().slice(0, 30);
}

/* ── M3 Expressive filter chip: pill, check on active, count ─────────── */
const FilterChip = ({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "group inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold leading-none transition-all duration-200 active:scale-95",
      "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      active
        ? "border-transparent bg-primary text-white shadow-[0_4px_16px_-4px_hsl(var(--md-primary)/0.6)]"
        : "border-outline-variant/25 bg-surface-container-high text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-highest hover:text-on-surface"
    )}
  >
    <span
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-full transition-all",
        active ? "bg-white/25" : "bg-transparent w-0 opacity-0 group-hover:w-4 group-hover:opacity-40"
      )}
    >
      {active ? <Check size={11} strokeWidth={3.5} /> : <Plus size={11} strokeWidth={3} />}
    </span>
    {label}
    {typeof count === "number" && (
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums",
          active ? "bg-white/20 text-white" : "bg-surface-container-highest text-on-surface-variant/60"
        )}
      >
        {count}
      </span>
    )}
  </button>
);

const SectionIcon = ({ section }: { section: string }) => {
  const s = section.toLowerCase();
  if (s.includes("display")) return <Monitor size={18} />;
  if (s.includes("platform") || s.includes("chip")) return <Cpu size={18} />;
  if (s.includes("battery")) return <Battery size={18} />;
  if (s.includes("camera")) return <Sparkles size={18} />;
  if (s.includes("memory")) return <Layers size={18} />;
  if (s.includes("network")) return <Globe size={18} />;
  return <ChevronRight size={18} />;
};

/* ── Detail dialog: mobile-first bottom-sheet feel ────────────────────── */
const SpecDetailsDialog = ({
  device,
  compareSelected,
  compareDisabled,
  onToggleCompare,
}: {
  device: SpecPayload;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}) => {
  return (
    <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[24px] border border-outline-variant/20 bg-surface-container-low p-0 shadow-2xl sm:mx-auto sm:max-w-2xl sm:rounded-[32px] lg:max-w-4xl">
      <DialogTitle className="sr-only">{device.matched_device} specifications</DialogTitle>

      {/* Header */}
      <div className="flex gap-4 border-b border-outline-variant/15 p-5 sm:gap-8 sm:p-10">
        <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/10 bg-white p-3 shadow-md sm:h-72 sm:w-52 sm:rounded-3xl sm:p-6">
          <img
            src={device.image || FALLBACK_IMG}
            alt={device.matched_device}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMG;
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 sm:gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">
            {getBrand(device.matched_device)}
          </span>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-on-surface sm:text-4xl">
            {device.matched_device}
          </h2>
          {getChipSummary(device) ? (
            <p className="truncate text-[13px] text-on-surface-variant/70 sm:text-sm">
              {getChipSummary(device)}
            </p>
          ) : null}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <a
              href={device.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              GSMArena <ExternalLink size={13} />
            </a>
            <button
              onClick={onToggleCompare}
              disabled={!compareSelected && compareDisabled}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all active:scale-95 sm:text-sm",
                compareSelected
                  ? "border-transparent bg-secondary-container text-on-secondary-container"
                  : "border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              {compareSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
              {compareSelected ? "In compare" : "Compare"}
            </button>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="custom-scrollbar space-y-8 overflow-y-auto p-5 sm:space-y-10 sm:p-10">
        {Object.entries(device.specifications).map(([section, data]) => (
          <div key={section} className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SectionIcon section={section} />
              </div>
              <h3 className="text-[15px] font-bold tracking-tight text-on-surface sm:text-lg">
                {section}
              </h3>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(data).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl bg-surface-container-high/60 px-3.5 py-2.5 sm:bg-transparent sm:p-0"
                >
                  <dt className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/50">
                    {key}
                  </dt>
                  <dd className="text-[13px] font-medium leading-relaxed text-on-surface sm:text-[15px]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </DialogContent>
  );
};

/* ── Card: compact 2-col on mobile, rich on desktop ───────────────────── */
const SpecCard = ({
  device,
  compareSelected,
  compareDisabled,
  onToggleCompare,
}: {
  device: SpecPayload;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.35 }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[20px] border bg-surface-container transition-colors duration-300 sm:rounded-[28px]",
          compareSelected
            ? "border-primary/60 ring-2 ring-primary/30"
            : "border-outline-variant/10 hover:border-primary/30"
        )}
      >
        {/* Compare toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          disabled={!compareSelected && compareDisabled}
          aria-pressed={compareSelected}
          title={compareSelected ? "Remove from compare" : "Add to compare"}
          className={cn(
            "absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all active:scale-90 sm:right-4 sm:top-4 sm:h-10 sm:w-10",
            compareSelected
              ? "bg-primary text-white"
              : "border border-outline-variant/20 bg-surface-container-high/90 text-on-surface-variant backdrop-blur hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-high disabled:hover:text-on-surface-variant"
          )}
        >
          {compareSelected ? <Check size={17} strokeWidth={3} /> : <Plus size={17} strokeWidth={2.5} />}
        </button>

        {/* Image — tap opens details */}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col gap-3 p-3 text-left sm:gap-5 sm:p-5"
          aria-label={`View ${device.matched_device} details`}
        >
          <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/5 bg-white p-3 shadow-sm transition-transform duration-500 group-hover:scale-[1.015] sm:h-52 sm:p-6">
            <img
              src={device.image || FALLBACK_IMG}
              alt={device.matched_device}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMG;
              }}
            />
          </div>

          <div className="space-y-1 px-0.5 sm:space-y-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-primary sm:text-[10px]">
              {getBrand(device.matched_device)}
            </span>
            <h3 className="line-clamp-2 min-h-[2.4em] text-[13px] font-bold leading-snug text-on-surface sm:line-clamp-1 sm:min-h-0 sm:text-base">
              {device.matched_device}
            </h3>
            <p className="truncate text-[11px] text-on-surface-variant/60 sm:text-xs">
              {getDisplaySummary(device)} · {getBatterySummary(device)}
            </p>
          </div>
        </button>

        {/* Quick specs (desktop only) */}
        <div className="hidden grid-cols-2 gap-2 px-5 sm:grid">
          <div className="flex items-center gap-2 rounded-xl bg-surface-container-highest/60 p-2.5">
            <Monitor size={13} className="shrink-0 text-secondary opacity-70" />
            <span className="truncate text-[11px] font-bold text-on-surface">
              {getDisplaySummary(device)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-container-highest/60 p-2.5">
            <Battery size={13} className="shrink-0 text-tertiary opacity-70" />
            <span className="truncate text-[11px] font-bold text-on-surface">
              {getBatterySummary(device)}
            </span>
          </div>
        </div>

        <div className="mt-auto p-3 sm:p-5">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-full bg-secondary-container py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-on-secondary-container transition-all hover:bg-primary hover:text-white active:scale-[0.98] sm:py-3 sm:text-[11px]"
          >
            Details
          </button>
        </div>
      </motion.article>

      <Dialog open={open} onOpenChange={setOpen}>
        <SpecDetailsDialog
          device={device}
          compareSelected={compareSelected}
          compareDisabled={compareDisabled}
          onToggleCompare={onToggleCompare}
        />
      </Dialog>
    </>
  );
};

/* ── Compare table helpers ────────────────────────────────────────────── */
interface CompareRow {
  section: string;
  key: string;
  values: string[];
  differs: boolean;
}

function buildCompareRows(devices: SpecPayload[]): { section: string; rows: CompareRow[] }[] {
  const sections = new Map<string, Map<string, string[]>>();
  devices.forEach((d, di) => {
    Object.entries(d.specifications ?? {}).forEach(([section, entries]) => {
      if (!sections.has(section)) sections.set(section, new Map());
      const map = sections.get(section)!;
      Object.entries(entries).forEach(([k, v]) => {
        if (!map.has(k)) map.set(k, devices.map(() => "—"));
        map.get(k)![di] = v || "—";
      });
    });
  });
  return [...sections.entries()].map(([section, map]) => ({
    section,
    rows: [...map.entries()].map(([key, values]) => ({
      section,
      key,
      values,
      differs: new Set(values.map((v) => v.trim().toLowerCase())).size > 1,
    })),
  }));
}

const CompareDialog = ({
  devices,
  diffOnly,
  setDiffOnly,
  onRemove,
  onClear,
}: {
  devices: SpecPayload[];
  diffOnly: boolean;
  setDiffOnly: (v: boolean) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) => {
  const groups = useMemo(() => buildCompareRows(devices), [devices]);
  const visibleGroups = useMemo(
    () =>
      diffOnly
        ? groups
            .map((g) => ({ ...g, rows: g.rows.filter((r) => r.differs) }))
            .filter((g) => g.rows.length > 0)
        : groups,
    [groups, diffOnly]
  );
  const cols = devices.length === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[24px] border border-outline-variant/20 bg-surface-container-low p-0 shadow-2xl sm:mx-auto sm:w-full sm:max-w-4xl sm:rounded-[28px] lg:max-w-5xl">
      <DialogTitle className="sr-only">Compare devices</DialogTitle>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/15 p-4 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface sm:text-xl">
              Compare <span className="text-primary">{devices.length}</span>
              <span className="text-on-surface-variant/50">/3</span>
            </h2>
            <p className="text-[11px] text-on-surface-variant/60 sm:text-xs">
              Swipe sideways on mobile to see all
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setDiffOnly(!diffOnly)}
            aria-pressed={diffOnly}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95",
              diffOnly
                ? "border-transparent bg-primary text-white"
                : "border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            )}
          >
            {diffOnly && <Check size={13} strokeWidth={3} />}
            Differences only
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-on-surface-variant/70 hover:bg-error/10 hover:text-error"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="custom-scrollbar overflow-y-auto p-4 sm:p-6">
        <div className="overflow-x-auto pb-1">
          <div className={cn(devices.length === 3 && "min-w-[560px]")}>
            {/* Device headers */}
            <div className={cn("grid gap-2 sm:gap-3", cols)}>
              {devices.map((d) => (
                <div
                  key={d.matched_device}
                  className="relative flex flex-col items-center gap-2 rounded-2xl border border-outline-variant/15 bg-surface-container-high p-3 text-center sm:p-5"
                >
                  <button
                    onClick={() => onRemove(d.matched_device)}
                    aria-label={`Remove ${d.matched_device}`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant/70 hover:bg-error/15 hover:text-error"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex h-24 w-full items-center justify-center rounded-xl bg-white p-2 sm:h-40 sm:p-4">
                    <img
                      src={d.image || FALLBACK_IMG}
                      alt={d.matched_device}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-primary">
                      {getBrand(d.matched_device)}
                    </div>
                    <div className="line-clamp-2 text-xs font-bold leading-snug text-on-surface sm:text-sm">
                      {d.matched_device}
                    </div>
                    <div className="mt-1 hidden truncate text-[11px] text-on-surface-variant/60 sm:block">
                      {getChipSummary(d)}
                    </div>
                  </div>
                  <a
                    href={d.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    GSMArena <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>

            {/* Spec rows */}
            {visibleGroups.length === 0 ? (
              <p className="py-10 text-center text-sm text-on-surface-variant/60">
                No differences — these devices match on every listed spec.
              </p>
            ) : (
              visibleGroups.map((g) => (
                <div key={g.section} className="mt-5 sm:mt-6">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <SectionIcon section={g.section} />
                    </div>
                    <h3 className="text-sm font-bold text-on-surface sm:text-base">{g.section}</h3>
                    <span className="ml-auto rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold tabular-nums text-on-surface-variant/60">
                      {g.rows.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {g.rows.map((r) => (
                      <div
                        key={`${g.section}-${r.key}`}
                        className={cn(
                          "overflow-hidden rounded-2xl border",
                          r.differs
                            ? "border-primary/25 bg-primary/[0.04]"
                            : "border-outline-variant/10 bg-surface-container-high/50"
                        )}
                      >
                        <div className="flex items-center gap-2 px-3 pt-2.5 sm:px-4">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/55">
                            {r.key}
                          </span>
                          {r.differs && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-primary">
                              Differs
                            </span>
                          )}
                        </div>
                        <div className={cn("grid gap-2 p-2 sm:p-2.5", cols)}>
                          {r.values.map((v, i) => (
                            <div
                              key={i}
                              className="rounded-xl bg-surface-container-low/70 px-3 py-2 text-xs leading-relaxed text-on-surface sm:text-[13px]"
                            >
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────── */
const SpecPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);
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
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
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

  const devices = useMemo(() => data?.devices ?? [], [data]);

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    devices.forEach((d) => {
      const b = getBrand(d.matched_device);
      counts.set(b, (counts.get(b) ?? 0) + 1);
    });
    return counts;
  }, [devices]);

  const filteredDevices = useMemo(() => {
    if (filter === "All") return devices;
    return devices.filter((dev) => getBrand(dev.matched_device) === filter);
  }, [devices, filter]);

  const compareDevices = useMemo(
    () =>
      compareIds
        .map((id) => devices.find((d) => d.matched_device === id))
        .filter((d): d is SpecPayload => Boolean(d)),
    [compareIds, devices]
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  const compareFull = compareIds.length >= 3;

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface selection:bg-primary/30">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <motion.div style={{ y: blobY }} className="absolute -right-40 -top-40 h-[600px] w-[600px] opacity-[0.12] m3-blob sm:h-[900px] sm:w-[900px]">
          <div
            className="h-full w-full rounded-[inherit]"
            style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)" }}
          />
        </motion.div>
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-32 sm:px-6 sm:pb-16">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between pt-5 sm:mb-16 sm:pt-12">
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high py-2.5 pl-4 pr-5 text-[13px] font-semibold text-on-surface-variant transition-all hover:text-primary active:scale-95"
          >
            <ArrowLeft size={16} />
            Home
          </motion.button>

          <a
            href="/api/info"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all hover:bg-primary/10 hover:text-primary"
          >
            <Info size={15} className="text-primary" />
            <span className="hidden sm:inline">Architecture</span>
            <span className="sm:hidden">API</span>
          </a>
        </div>

        {/* Hero */}
        <div ref={heroRef} className="mb-8 space-y-4 text-center sm:mb-14 sm:space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.5rem] font-bold leading-[1.02] tracking-tight text-on-surface sm:text-6xl lg:text-7xl"
          >
            Toolz Device{" "}
            <span className="m3-gradient-text relative inline-block font-serif italic">
              Catalog.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto max-w-xl px-2 text-[15px] leading-relaxed text-on-surface-variant/80 sm:text-lg"
          >
            Look up real specs for any phone. Search by name, filter by brand, and compare up to
            three devices side by side.
          </motion.p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-5 max-w-2xl sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
              <Search size={19} />
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model name… e.g. Galaxy S24, Pixel 9"
              enterKeyHint="search"
              className="h-14 w-full rounded-full border border-outline-variant/20 bg-surface-container-high pl-12 pr-12 text-[15px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/45 focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
            />
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {isFetching && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              )}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant/70 hover:text-on-surface"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Filter chips: horizontal scroll on mobile, wrap on desktop */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {BRANDS.map((brand) => (
              <FilterChip
                key={brand}
                label={brand}
                active={filter === brand}
                count={
                  brand === "All"
                    ? devices.length || undefined
                    : brandCounts.get(brand)
                }
                onClick={() => setFilter(brand)}
              />
            ))}
          </div>
          {/* Edge fade (mobile only) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent sm:hidden" />
        </div>

        {/* Result meta */}
        <div className="mb-4 flex flex-wrap items-center gap-2 px-1 sm:mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3.5 py-1.5 text-xs font-semibold text-on-surface-variant">
            <Smartphone size={13} className="text-primary" />
            {isLoading ? "Loading…" : `${filteredDevices.length} device${filteredDevices.length === 1 ? "" : "s"}`}
            {filter !== "All" && ` · ${filter}`}
          </span>
          {compareIds.length > 0 && (
            <button
              onClick={() => setCompareOpen(true)}
              disabled={compareDevices.length < 2}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white active:scale-95 disabled:opacity-40"
            >
              <ArrowLeftRight size={13} />
              Compare ({compareIds.length}/3)
            </button>
          )}
          {compareFull && (
            <span className="text-[11px] font-medium text-on-surface-variant/60">
              Max 3 — remove one to add another
            </span>
          )}
        </div>

        {/* Grid: 2 cols on mobile, 3 on desktop */}
        <div className="min-h-[400px]">
          {isLoading && !data ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-[20px] bg-surface-container-high sm:h-[420px] sm:rounded-[28px]"
                />
              ))}
            </div>
          ) : filteredDevices.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {filteredDevices.map((dev) => (
                <SpecCard
                  key={dev.matched_device}
                  device={dev}
                  compareSelected={compareIds.includes(dev.matched_device)}
                  compareDisabled={compareFull && !compareIds.includes(dev.matched_device)}
                  onToggleCompare={() => toggleCompare(dev.matched_device)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="space-y-3 px-4 py-24 text-center sm:py-32">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant/40">
                <Search size={24} />
              </div>
              <h2 className="text-xl font-bold text-on-surface/70 sm:text-2xl">No matches found</h2>
              <p className="mx-auto max-w-sm text-sm text-on-surface-variant/60">
                Try a different model name{filter !== "All" ? ` or clear the “${filter}” filter` : ""}.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="rounded-full bg-surface-container-high px-5 py-2.5 text-[13px] font-semibold hover:bg-surface-container-highest"
                  >
                    Clear search
                  </button>
                )}
                {filter !== "All" && (
                  <button
                    onClick={() => setFilter("All")}
                    className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white"
                  >
                    Show all brands
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── New footer ─────────────────────────────────────────── */}
        <footer className="mt-16 overflow-hidden rounded-[24px] border border-outline-variant/15 bg-surface-container-low sm:mt-28 sm:rounded-[32px]">
          <div className="grid gap-8 p-6 sm:gap-10 sm:p-10 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] bg-primary/10">
                  <img src="/logo.png" alt="Toolz" className="h-full w-full scale-[1.6] object-cover" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-on-surface">Toolz Device Catalog</div>
                  <div className="text-xs text-on-surface-variant/60">Live phone specs, kept simple</div>
                </div>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-on-surface-variant/70 sm:text-sm">
                Every listing shows full hardware details with images. Data is served from cache
                and refreshed from GSMArena when you search something new.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-5 py-2.5 text-[13px] font-semibold text-on-surface transition-all hover:bg-primary hover:text-white active:scale-95"
              >
                <ArrowLeft size={15} /> Back to home
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-on-surface-variant/50">
                Catalog
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: Database, value: String(data?.totalInRedis ?? "—"), label: "Devices stored" },
                  { icon: Smartphone, value: String(devices.length), label: "Showing now" },
                  { icon: ArrowLeftRight, value: `${compareIds.length}/3`, label: "Comparing" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/60 p-3 text-center sm:p-4"
                  >
                    <s.icon size={16} className="mx-auto mb-1.5 text-primary" />
                    <div className="text-base font-extrabold tabular-nums text-on-surface sm:text-lg">
                      {s.value}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/55">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-on-surface-variant/50">
                Links
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Architecture & API info", href: "/api/info", icon: Info },
                  { label: "Source: GSMArena.com", href: "https://www.gsmarena.com", icon: Globe },
                  { label: "Toolz home", href: "/", icon: ArrowLeft },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface sm:text-sm"
                  >
                    <l.icon size={15} className="text-primary/70 group-hover:text-primary" />
                    {l.label}
                    {l.href.startsWith("http") && (
                      <ExternalLink size={12} className="ml-auto opacity-40" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant/10 px-6 py-5 text-center sm:flex-row sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/45">
              © 2026 Toolz Project
            </span>
            <span className="text-[11px] text-on-surface-variant/45">
              Spec images & data © GSMArena · Shown for reference
            </span>
          </div>
        </footer>
      </div>

      {/* ── Compare tray (floating) ──────────────────────────────── */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:w-auto sm:-translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-3xl border border-outline-variant/20 bg-surface-container-high/95 p-3 pl-4 shadow-2xl backdrop-blur-xl sm:rounded-full sm:py-2.5 sm:pl-5 sm:pr-2.5">
              <div className="flex items-center">
                {compareIds.map((id, i) => {
                  const d = devices.find((x) => x.matched_device === id);
                  return (
                    <div
                      key={id}
                      className="group relative -ml-2 h-11 w-11 overflow-hidden rounded-full border-2 border-surface-container-high bg-white first:ml-0"
                      style={{ zIndex: 10 - i }}
                      title={id}
                    >
                      {d?.image ? (
                        <img
                          src={d.image}
                          alt={id}
                          className="h-full w-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMG;
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold">
                          {id.slice(0, 1)}
                        </div>
                      )}
                      <button
                        onClick={() => toggleCompare(id)}
                        aria-label={`Remove ${id}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                {Array.from({ length: 3 - compareIds.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-outline-variant/40 text-on-surface-variant/30"
                  >
                    <Plus size={15} />
                  </div>
                ))}
              </div>

              <div className="min-w-0 leading-tight">
                <div className="text-[13px] font-bold text-on-surface">
                  {compareIds.length}/3 <span className="hidden sm:inline">selected</span>
                </div>
                <div className="truncate text-[11px] text-on-surface-variant/60 sm:max-w-[220px]">
                  {compareIds.length < 2 ? "Pick at least 2 to compare" : "Ready to compare"}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-1.5 sm:ml-3">
                <button
                  onClick={() => setCompareIds([])}
                  aria-label="Clear compare"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant/70 hover:bg-surface-container-highest hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => compareDevices.length >= 2 && setCompareOpen(true)}
                  disabled={compareDevices.length < 2}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <ArrowLeftRight size={14} />
                  Compare
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        {compareDevices.length >= 2 ? (
          <CompareDialog
            devices={compareDevices}
            diffOnly={diffOnly}
            setDiffOnly={setDiffOnly}
            onRemove={toggleCompare}
            onClear={() => {
              setCompareIds([]);
              setCompareOpen(false);
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
};

export default SpecPage;
