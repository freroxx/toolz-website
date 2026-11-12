import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  Cpu,
  Monitor,
  Camera,
  Battery,
  Layers,
  Globe,
  CircleDot,
  Plus,
  Check,
  X,
  ArrowLeftRight,
  ExternalLink,
  Trash2,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import { QuickModeToggle } from "@/components/theme/ThemeButton";

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

type SortKey = "relevance" | "az" | "za";

const FALLBACK_IMG = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";
const MAX_COMPARE = 3;

const BRANDS = [
  "All",
  "Samsung",
  "Apple",
  "Google",
  "Xiaomi",
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

const SUGGESTIONS = ["Galaxy S24", "Pixel 9", "iPhone 16", "Xiaomi 14", "OnePlus 12"];

const BRAND_PATTERN =
  /^(samsung|apple|google|xiaomi|redmi|poco|oneplus|nothing|motorola|oppo|vivo|realme|honor|huawei|sony|asus|infinix|tecno|nokia|lenovo|lg)/i;

// Devices rendered per page in the catalog grid.
const PAGE_SIZE = 30;

function getBrand(deviceName: string): string {
  const m = deviceName.trim().match(BRAND_PATTERN);
  if (!m) return "Other";
  const raw = m[1].toLowerCase();
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

// Redmi and Poco are Xiaomi sub-brands, so they show under the Xiaomi filter.
const XIAOMI_FAMILY = new Set(["Xiaomi", "Redmi", "Poco"]);

function brandMatchesFilter(brand: string, filter: string): boolean {
  if (filter === "Xiaomi") return XIAOMI_FAMILY.has(brand);
  return brand === filter;
}

function getDisplaySummary(device: SpecPayload): string {
  const v =
    device.specifications?.["Display"]?.["Size"] ??
    device.specifications?.["Display"]?.["Type"] ??
    "";
  if (!v) return "N/A";
  return v.split(",")[0].trim().slice(0, 30);
}

function getBatterySummary(device: SpecPayload): string {
  const v = device.specifications?.["Battery"]?.["Type"] ?? "";
  if (!v) return "N/A";
  const m = v.match(/(\d[\d\s,]*)\s*mAh/i);
  if (m) return `${m[1].replace(/\s/g, "")} mAh`;
  return v.split(",")[0].trim().slice(0, 24);
}

function getChipSummary(device: SpecPayload): string {
  const v =
    device.specifications?.["Platform"]?.["Chipset"] ??
    device.specifications?.["Platform"]?.["CPU"] ??
    "";
  if (!v) return "N/A";
  return v.split(",")[0].trim().slice(0, 36);
}

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
};

const SectionIcon = ({ section, size = 16 }: { section: string; size?: number }) => {
  const s = section.toLowerCase();
  if (s.includes("display")) return <Monitor size={size} />;
  if (s.includes("platform") || s.includes("chip")) return <Cpu size={size} />;
  if (s.includes("battery")) return <Battery size={size} />;
  if (s.includes("camera")) return <Camera size={size} />;
  if (s.includes("memory")) return <Layers size={size} />;
  if (s.includes("network")) return <Globe size={size} />;
  return <CircleDot size={size} />;
};

/* ── Shared pieces ────────────────────────────────────────────────────── */
const DeviceImage = ({
  device,
  className,
}: {
  device: SpecPayload;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center justify-center overflow-hidden rounded-[20px] bg-white p-5",
      className
    )}
  >
    <img
      src={device.image || FALLBACK_IMG}
      alt={device.matched_device}
      className="max-h-full max-w-full object-contain"
      loading="lazy"
      onError={handleImgError}
    />
  </div>
);

const BrandChip = ({
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
      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors",
      active
        ? "border-transparent bg-secondary-container text-on-secondary-container"
        : "border-outline-variant/70 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
    )}
  >
    {active && <Check size={14} strokeWidth={2.5} />}
    {label}
    {typeof count === "number" && (
      <span className="text-[11px] tabular-nums opacity-60">{count}</span>
    )}
  </button>
);

const FactRow = ({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5">
    <dt className={cn("text-[13px]", muted ? "opacity-70" : "text-on-surface-variant")}>{label}</dt>
    <dd className="min-w-0 truncate text-right text-[13px] font-medium">{value}</dd>
  </div>
);

/* ── Datasheet dialog ─────────────────────────────────────────────────── */
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
  const sections = Object.entries(device.specifications ?? {});

  const jumpTo = (i: number) =>
    document.getElementById(`spec-sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-surface-container-low p-0 shadow-2xl sm:mx-auto sm:w-[94vw] sm:max-w-5xl">
      <DialogTitle className="sr-only">{device.matched_device} specifications</DialogTitle>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="grid lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Summary */}
          <aside className="bg-surface-container p-6 lg:sticky lg:top-0 lg:self-start">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary-ink">
              {getBrand(device.matched_device)}
            </p>
            <h2 className="mt-1 pr-10 font-display text-2xl font-bold leading-tight tracking-tight text-on-surface lg:pr-0">
              {device.matched_device}
            </h2>

            <DeviceImage device={device} className="mt-5 aspect-[4/3]" />

            <dl className="mt-4 divide-y divide-outline-variant/30 text-on-surface">
              <FactRow label="Display" value={getDisplaySummary(device)} />
              <FactRow label="Chipset" value={getChipSummary(device)} />
              <FactRow label="Battery" value={getBatterySummary(device)} />
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={onToggleCompare}
                disabled={!compareSelected && compareDisabled}
                title={
                  !compareSelected && compareDisabled
                    ? `Compare is full (${MAX_COMPARE} devices)`
                    : undefined
                }
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  compareSelected
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-primary text-on-primary hover:bg-primary/90"
                )}
              >
                {compareSelected ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} />}
                {compareSelected ? "Added to compare" : "Add to compare"}
              </button>
              <a
                href={device.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-outline-variant px-6 text-[14px] font-semibold text-primary-ink transition-colors hover:bg-primary/10"
              >
                View on GSMArena
                <ExternalLink size={14} />
              </a>
            </div>
          </aside>

          {/* Spec sections */}
          <div className="min-w-0">
            {sections.length > 2 && (
              <nav
                aria-label="Spec sections"
                className="sticky top-0 z-10 flex gap-2 overflow-x-auto bg-surface-container-low px-4 py-3 pr-14 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
              >
                {sections.map(([section], i) => (
                  <button
                    key={section}
                    onClick={() => jumpTo(i)}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-outline-variant/70 px-3.5 text-[12px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  >
                    <SectionIcon section={section} size={13} />
                    {section}
                  </button>
                ))}
              </nav>
            )}

            <div className={cn("space-y-3 px-4 pb-6 sm:px-6", sections.length <= 2 && "pt-6")}>
              {sections.map(([section, data], i) => (
                <section
                  key={section}
                  id={`spec-sec-${i}`}
                  className="scroll-mt-16 rounded-[24px] bg-surface-container p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                      <SectionIcon section={section} />
                    </span>
                    <h3 className="font-display text-base font-bold text-on-surface">{section}</h3>
                  </div>
                  <dl className="mt-3">
                    {Object.entries(data).map(([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-1 border-t border-outline-variant/30 py-3 sm:grid-cols-[160px_1fr] sm:gap-6"
                      >
                        <dt className="text-[13px] text-on-surface-variant">{key}</dt>
                        <dd className="text-[13px] font-medium leading-relaxed text-on-surface">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

/* ── Catalog card ─────────────────────────────────────────────────────── */
const SpecCard = ({
  device,
  index,
  compareSelected,
  compareDisabled,
  onOpen,
  onToggleCompare,
}: {
  device: SpecPayload;
  index: number;
  compareSelected: boolean;
  compareDisabled: boolean;
  onOpen: () => void;
  onToggleCompare: () => void;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, delay: Math.min(index, 8) * 0.03 }}
    className={cn(
      "relative flex flex-col rounded-[28px] transition-colors",
      compareSelected
        ? "bg-primary-container text-on-primary-container"
        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
    )}
  >
    <button
      onClick={onOpen}
      aria-label={`Open ${device.matched_device} specifications`}
      className="flex flex-1 flex-col rounded-[28px] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <DeviceImage device={device} className="aspect-[4/3] w-full" />

      <p
        className={cn(
          "mt-4 text-[11px] font-semibold uppercase tracking-[0.12em]",
          compareSelected ? "opacity-70" : "text-primary-ink"
        )}
      >
        {getBrand(device.matched_device)}
      </p>
      <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold leading-snug">
        {device.matched_device}
      </h3>

      <dl
        className={cn(
          "mt-3 w-full divide-y",
          compareSelected ? "divide-on-primary-container/15" : "divide-outline-variant/30"
        )}
      >
        <FactRow label="Display" value={getDisplaySummary(device)} muted={compareSelected} />
        <FactRow label="Chipset" value={getChipSummary(device)} muted={compareSelected} />
        <FactRow label="Battery" value={getBatterySummary(device)} muted={compareSelected} />
      </dl>
    </button>

    <button
      onClick={onToggleCompare}
      disabled={!compareSelected && compareDisabled}
      aria-pressed={compareSelected}
      aria-label={
        compareSelected
          ? `Remove ${device.matched_device} from compare`
          : `Add ${device.matched_device} to compare`
      }
      title={
        compareSelected
          ? "Remove from compare"
          : compareDisabled
            ? `Compare is full (${MAX_COMPARE} devices)`
            : "Add to compare"
      }
      className={cn(
        "absolute right-7 top-7 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        compareSelected
          ? "bg-primary text-on-primary"
          : "bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
      )}
    >
      {compareSelected ? <Check size={17} strokeWidth={2.5} /> : <ArrowLeftRight size={16} />}
    </button>
  </motion.article>
);

/* ── Compare helpers ──────────────────────────────────────────────────── */
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
  onRemove: (device: SpecPayload) => void;
  onClear: () => void;
}) => {
  const groups = useMemo(() => buildCompareRows(devices), [devices]);
  const diffCount = useMemo(
    () => groups.reduce((n, g) => n + g.rows.filter((r) => r.differs).length, 0),
    [groups]
  );
  const visibleGroups = useMemo(
    () =>
      diffOnly
        ? groups
            .map((g) => ({ ...g, rows: g.rows.filter((r) => r.differs) }))
            .filter((g) => g.rows.length > 0)
        : groups,
    [groups, diffOnly]
  );

  const template = `minmax(110px,150px) repeat(${devices.length}, minmax(170px,1fr))`;
  const minWidth = devices.length === 3 ? 700 : 520;

  return (
    <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-surface-container-low p-0 shadow-2xl sm:mx-auto sm:w-full sm:max-w-5xl">
      <DialogTitle className="sr-only">Compare devices</DialogTitle>

      <div className="flex flex-wrap items-center gap-3 px-6 py-5 pr-16">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Compare devices</h2>
          <p className="text-[13px] text-on-surface-variant">
            {diffCount} spec{diffCount === 1 ? "" : "s"} differ
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setDiffOnly(!diffOnly)}
            aria-pressed={diffOnly}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors",
              diffOnly
                ? "border-transparent bg-secondary-container text-on-secondary-container"
                : "border-outline-variant/70 text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {diffOnly && <Check size={14} strokeWidth={2.5} />}
            Differences only
          </button>
          <button
            onClick={onClear}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-auto px-4 pb-6 sm:px-6">
        <div style={{ minWidth }}>
          {/* Sticky device header */}
          <div
            className="sticky top-0 z-10 grid gap-3 bg-surface-container-low pb-3"
            style={{ gridTemplateColumns: template }}
          >
            <div />
            {devices.map((d) => (
              <div
                key={d.matched_device}
                className="relative rounded-[20px] bg-surface-container p-3 text-center"
              >
                <button
                  onClick={() => onRemove(d)}
                  aria-label={`Remove ${d.matched_device}`}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-error/15 hover:text-error"
                >
                  <X size={14} />
                </button>
                <DeviceImage device={d} className="mx-auto aspect-[4/3] w-full max-w-[140px] !p-3" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-ink">
                  {getBrand(d.matched_device)}
                </p>
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-on-surface">
                  {d.matched_device}
                </p>
              </div>
            ))}
          </div>

          {visibleGroups.length === 0 ? (
            <div className="mt-6 rounded-[24px] bg-surface-container p-8 text-center text-sm text-on-surface-variant">
              These devices match on every listed spec.
            </div>
          ) : (
            visibleGroups.map((g) => (
              <section key={g.section} className="mt-5">
                <div className="mb-1 flex items-center gap-2.5 px-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                    <SectionIcon section={g.section} size={15} />
                  </span>
                  <h3 className="font-display text-[15px] font-bold text-on-surface">{g.section}</h3>
                </div>
                {g.rows.map((r) => (
                  <div
                    key={`${g.section}-${r.key}`}
                    className={cn(
                      "grid gap-3 rounded-[14px] px-1 py-3",
                      r.differs && "bg-primary-container/40"
                    )}
                    style={{ gridTemplateColumns: template }}
                  >
                    <div className="px-2 text-[12px] text-on-surface-variant">{r.key}</div>
                    {r.values.map((v, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-2 text-[13px] leading-relaxed text-on-surface",
                          r.differs && "font-medium"
                        )}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    </DialogContent>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────── */
const SpecPage = () => {
  const navigate = useNavigate();
  const { activeSkin } = useSkin();
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("q") ?? ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filter, setFilter] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("relevance");
  // Selected devices are stored as objects so they survive new searches.
  const [compareList, setCompareList] = useState<SpecPayload[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);
  const [details, setDetails] = useState<SpecPayload | null>(null);
  const [preview, setPreview] = useState<SpecPayload[]>([]);
  // Paged rendering: mounting 700+ cards at once is what caused the lag.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Keep the query shareable / SEO-friendly without remounting the route.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [debouncedSearch]);

  // "/" or Cmd/Ctrl+K focuses the catalog search.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } = useQuery<CatalogResponse>({
    queryKey: ["specs", debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/spec?json=1&q=${encodeURIComponent(debouncedSearch)}`);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    },
    staleTime: 60000,
  });

  const devices = useMemo(() => data?.devices ?? [], [data]);

  // Hero preview: the first four devices ever loaded, kept stable across searches.
  useEffect(() => {
    if (devices.length) setPreview((p) => (p.length ? p : devices.slice(0, 4)));
  }, [devices]);

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    devices.forEach((d) => {
      const b = getBrand(d.matched_device);
      counts.set(b, (counts.get(b) ?? 0) + 1);
      // Roll sub-brand counts up into the Xiaomi tab.
      if (b === "Redmi" || b === "Poco") {
        counts.set("Xiaomi", (counts.get("Xiaomi") ?? 0) + 1);
      }
    });
    return counts;
  }, [devices]);

  const filteredDevices = useMemo(() => {
    const base =
      filter === "All"
        ? devices
        : devices.filter((dev) => brandMatchesFilter(getBrand(dev.matched_device), filter));
    if (sort === "relevance") return base;
    const sorted = [...base].sort((a, b) => a.matched_device.localeCompare(b.matched_device));
    return sort === "za" ? sorted.reverse() : sorted;
  }, [devices, filter, sort]);

  // Reset paging whenever the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, filter, sort, data]);

  const visibleDevices = useMemo(
    () => filteredDevices.slice(0, visibleCount),
    [filteredDevices, visibleCount]
  );
  const hasMore = visibleCount < filteredDevices.length;

  // Auto-load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredDevices.length));
        }
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, filteredDevices.length]);

  const compareIds = useMemo(() => compareList.map((d) => d.matched_device), [compareList]);
  const compareFull = compareList.length >= MAX_COMPARE;

  const toggleCompare = (device: SpecPayload) => {
    setCompareList((prev) =>
      prev.some((d) => d.matched_device === device.matched_device)
        ? prev.filter((d) => d.matched_device !== device.matched_device)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, device]
    );
  };

  const applySearch = (term: string) => {
    setSearch(term);
    setDebouncedSearch(term);
    setFilter("All");
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resultsLabel = isLoading
    ? "Loading…"
    : filteredDevices.length > PAGE_SIZE
      ? `Showing ${visibleDevices.length} of ${filteredDevices.length} devices`
      : `${filteredDevices.length} device${filteredDevices.length === 1 ? "" : "s"}`;

  return (
    <div className="min-h-screen overflow-x-clip bg-surface font-sans text-on-surface">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Top app bar */}
        <header className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
            aria-label="Back to Toolz home"
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[22%] bg-surface-container-high p-1.5">
              <SkinIcon skin={activeSkin} size={28} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[16px] font-bold tracking-tight">Toolz</span>
              <span className="block text-[12px] text-on-surface-variant">Phone specs</span>
            </span>
          </button>

          <nav className="flex items-center gap-1">
            <QuickModeToggle />
            <button
              onClick={() => navigate("/")}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to site</span>
            </button>
            <a
              href="/api/info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-secondary-container px-5 text-[13px] font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container/80"
            >
              API
              <ArrowUpRight size={15} />
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-12 pb-12 pt-10 sm:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-ink">
              Spec catalog
            </p>
            <h1
              className="mt-3 max-w-3xl text-balance font-display font-extrabold tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.25rem)", lineHeight: 1.04 }}
            >
              Find any phone.
              <br />
              <span className="text-primary">Read every spec.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-on-surface-variant">
              Search real device hardware, open a complete datasheet, or line up three phones to see
              exactly what changes between them.
              {typeof data?.totalInRedis === "number" && (
                <>
                  {" "}
                  <span className="font-medium text-on-surface">
                    {data.totalInRedis.toLocaleString()} devices
                  </span>{" "}
                  indexed.
                </>
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[13px] text-on-surface-variant">Popular</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => applySearch(s)}
                  className="inline-flex h-9 items-center rounded-full border border-outline-variant/70 px-4 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog preview */}
          <div
            className="hidden rounded-[40px] bg-primary-container p-6 lg:block"
            aria-label="Catalog preview"
          >
            <div className="grid grid-cols-2 gap-3 pb-6 [&>*:nth-child(even)]:translate-y-6">
              {preview.length
                ? preview.map((d) => (
                    <button
                      key={d.matched_device}
                      onClick={() => setDetails(d)}
                      aria-label={`Open ${d.matched_device} specifications`}
                      className="flex aspect-[4/5] items-center justify-center rounded-[26px] bg-white p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <img
                        src={d.image || FALLBACK_IMG}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                        onError={handleImgError}
                      />
                    </button>
                  ))
                : Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] animate-pulse rounded-[26px] bg-white/60"
                    />
                  ))}
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section id="catalog">
          <div className="sticky top-0 z-30 -mx-4 border-b border-outline-variant/40 bg-surface px-4 pb-3 pt-3 sm:-mx-6 sm:px-6">
            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a model, e.g. Galaxy S24, Pixel 9, iPhone 16"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search phone models"
                className="h-14 w-full rounded-full bg-surface-container-high pl-14 pr-28 text-[15px] text-on-surface outline-none transition-shadow placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/60 [&::-webkit-search-cancel-button]:hidden"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {isFetching && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                )}
                {search ? (
                  <button
                    onClick={() => {
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                  >
                    <X size={17} />
                  </button>
                ) : (
                  <kbd className="hidden rounded-md border border-outline-variant/70 px-2 py-0.5 text-[11px] font-medium text-on-surface-variant sm:block">
                    /
                  </kbd>
                )}
              </div>
            </div>

            <div className="mt-3 flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {BRANDS.map((brand) => (
                <BrandChip
                  key={brand}
                  label={brand}
                  active={filter === brand}
                  count={brand === "All" ? devices.length || undefined : brandCounts.get(brand)}
                  onClick={() => setFilter(brand)}
                />
              ))}
            </div>
          </div>

          {/* Result meta + sort */}
          <div
            id="results"
            className="flex scroll-mt-36 flex-wrap items-center gap-x-2 gap-y-3 px-1 pb-5 pt-6 text-[13px] text-on-surface-variant"
          >
            <p className="flex flex-wrap items-center gap-x-2" aria-live="polite">
              <span className="font-medium text-on-surface">{resultsLabel}</span>
              {filter !== "All" && <span>· {filter}</span>}
              {debouncedSearch && <span>· “{debouncedSearch}”</span>}
              {data?.autoEnriched && <span>· New match cached</span>}
            </p>

            <label className="ml-auto inline-flex items-center gap-2">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 cursor-pointer rounded-full border border-outline-variant/70 bg-transparent px-4 text-[13px] font-medium text-on-surface outline-none transition-colors hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="relevance">Relevance</option>
                <option value="az">Name A–Z</option>
                <option value="za">Name Z–A</option>
              </select>
            </label>
          </div>

          {/* Grid */}
          <div className="min-h-[400px] pb-12">
            {isError && !data ? (
              <div className="rounded-[28px] bg-surface-container px-6 py-20 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
                  <WifiOff size={24} />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold">Couldn't load the catalog</h2>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-on-surface-variant">
                  Check your connection and try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary/90"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </div>
            ) : isLoading && !data ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[420px] animate-pulse rounded-[28px] bg-surface-container"
                  />
                ))}
              </div>
            ) : filteredDevices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleDevices.map((dev, i) => (
                    <SpecCard
                      key={dev.matched_device}
                      device={dev}
                      index={i}
                      compareSelected={compareIds.includes(dev.matched_device)}
                      compareDisabled={compareFull && !compareIds.includes(dev.matched_device)}
                      onOpen={() => setDetails(dev)}
                      onToggleCompare={() => toggleCompare(dev)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center pt-10">
                    <button
                      onClick={() =>
                        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredDevices.length))
                      }
                      className="h-12 rounded-full border border-outline-variant px-7 text-[14px] font-semibold text-primary-ink transition-colors hover:bg-primary/10"
                    >
                      Show {Math.min(PAGE_SIZE, filteredDevices.length - visibleDevices.length)} more
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[28px] bg-surface-container px-6 py-20 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <Search size={24} />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold">No devices found</h2>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-on-surface-variant">
                  Try a different model name
                  {filter !== "All" ? ` or clear the ${filter} filter` : ""}.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="h-11 rounded-full border border-outline-variant px-6 text-[14px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                      Clear search
                    </button>
                  )}
                  {filter !== "All" && (
                    <button
                      onClick={() => setFilter("All")}
                      className="h-11 rounded-full bg-primary px-6 text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary/90"
                    >
                      Show all brands
                    </button>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[13px] text-on-surface-variant">Try</span>
                  {SUGGESTIONS.slice(0, 3).map((s) => (
                    <button
                      key={s}
                      onClick={() => applySearch(s)}
                      className="inline-flex h-9 items-center rounded-full border border-outline-variant/70 px-4 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mb-28 flex flex-col justify-between gap-4 border-t border-outline-variant/40 pt-8 text-[13px] text-on-surface-variant sm:flex-row sm:items-center">
          <p>© 2026 Toolz Project · Spec images and data © GSMArena, shown for reference.</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="/" className="transition-colors hover:text-on-surface">
              Home
            </a>
            <a href="/downloads" className="transition-colors hover:text-on-surface">
              Download
            </a>
            <a href="/news" className="transition-colors hover:text-on-surface">
              News
            </a>
            <a
              href="/api/info"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-on-surface"
            >
              API
            </a>
            <a
              href="https://www.gsmarena.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-on-surface"
            >
              GSMArena
              <ExternalLink size={11} />
            </a>
          </nav>
        </footer>
      </div>

      {/* Compare tray */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full bg-inverse-surface p-2 pl-3 text-inverse-on-surface shadow-xl">
              <div className="flex items-center">
                {compareList.map((d, i) => (
                  <button
                    key={d.matched_device}
                    onClick={() => toggleCompare(d)}
                    aria-label={`Remove ${d.matched_device} from compare`}
                    title={`Remove ${d.matched_device}`}
                    className="relative -ml-2 h-10 w-10 overflow-hidden rounded-full border-2 border-inverse-surface bg-white first:ml-0"
                    style={{ zIndex: 10 - i }}
                  >
                    <img
                      src={d.image || FALLBACK_IMG}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      onError={handleImgError}
                    />
                  </button>
                ))}
              </div>

              <span className="text-[13px] font-medium tabular-nums">
                {compareList.length}/{MAX_COMPARE}
                <span className="ml-1.5 hidden opacity-70 sm:inline">
                  {compareFull
                    ? "Full"
                    : compareList.length < 2
                      ? "Pick one more"
                      : "selected"}
                </span>
              </span>

              <div className="ml-auto flex items-center gap-1 sm:ml-2">
                <button
                  onClick={() => setCompareList([])}
                  aria-label="Clear compare"
                  className="flex h-10 w-10 items-center justify-center rounded-full opacity-80 transition-colors hover:bg-white/10 hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => compareList.length >= 2 && setCompareOpen(true)}
                  disabled={compareList.length < 2}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeftRight size={15} />
                  Compare
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One shared datasheet dialog */}
      <Dialog open={details !== null} onOpenChange={(o) => !o && setDetails(null)}>
        {details && (
          <SpecDetailsDialog
            device={details}
            compareSelected={compareIds.includes(details.matched_device)}
            compareDisabled={compareFull && !compareIds.includes(details.matched_device)}
            onToggleCompare={() => toggleCompare(details)}
          />
        )}
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        {compareList.length >= 2 ? (
          <CompareDialog
            devices={compareList}
            diffOnly={diffOnly}
            setDiffOnly={setDiffOnly}
            onRemove={toggleCompare}
            onClear={() => {
              setCompareList([]);
              setCompareOpen(false);
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
};

export default SpecPage;