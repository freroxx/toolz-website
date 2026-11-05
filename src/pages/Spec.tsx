import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Info,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Monitor,
  Sparkles,
  Battery,
  Layers,
  Globe,
  ChevronRight,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";

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

const FALLBACK_IMG = "https://fdn2.gsmarena.com/vv/bigpic/smartphone.jpg";

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
  if (!v) return "Display N/A";
  return v.split(",")[0].trim().slice(0, 30);
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
  if (!v) return "Platform N/A";
  return v.split(",")[0].trim().slice(0, 36);
}

const SectionIcon = ({ section, size = 15 }: { section: string; size?: number }) => {
  const s = section.toLowerCase();
  if (s.includes("display")) return <Monitor size={size} />;
  if (s.includes("platform") || s.includes("chip")) return <Cpu size={size} />;
  if (s.includes("battery")) return <Battery size={size} />;
  if (s.includes("camera")) return <Sparkles size={size} />;
  if (s.includes("memory")) return <Layers size={size} />;
  if (s.includes("network")) return <Globe size={size} />;
  return <ChevronRight size={size} />;
};

/* ── M3 filter chip ───────────────────────────────────────────────────── */
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
      "inline-flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium leading-none transition-all duration-200 active:scale-95",
      active
        ? "bg-secondary-container text-on-secondary-container shadow-sm"
        : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
    )}
  >
    {active && <Check size={14} strokeWidth={3} className="text-secondary" />}
    {label}
    {typeof count === "number" && (
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          active
            ? "bg-on-secondary-container/15 text-on-secondary-container"
            : "bg-surface-container-highest text-on-surface-variant/90"
        )}
      >
        {count}
      </span>
    )}
  </button>
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

  return (
    <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-surface-container-low p-0 shadow-2xl sm:mx-auto sm:w-[94vw] sm:max-w-5xl">
      <DialogTitle className="sr-only">{device.matched_device} specifications</DialogTitle>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Summary */}
          <aside className="bg-surface-container p-5 pb-6 sm:p-6 lg:border-r lg:border-outline-variant/15">
            <div className="flex items-center justify-between gap-3 pr-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-primary-container">
                <Smartphone size={11} />
                {getBrand(device.matched_device)}
              </span>
            </div>

            <div className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] bg-white p-6">
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

            <h2 className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-on-surface">
              {device.matched_device}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant/90">
              {getChipSummary(device)}
            </p>

            <div className="mt-5 space-y-2">
              {[
                { icon: <Monitor size={15} />, label: "Display", value: getDisplaySummary(device) },
                { icon: <Battery size={15} />, label: "Battery", value: getBatterySummary(device) },
                { icon: <Layers size={15} />, label: "Sections", value: `${sections.length} groups` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-[18px] bg-surface-container-high px-3.5 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                    {row.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant/90">
                      {row.label}
                    </div>
                    <div className="truncate text-[13px] font-medium text-on-surface">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={onToggleCompare}
                disabled={!compareSelected && compareDisabled}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
                  compareSelected
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-primary text-on-primary hover:shadow-lg"
                )}
              >
                {compareSelected ? <Check size={15} strokeWidth={3} /> : <Plus size={15} />}
                {compareSelected ? "Added to compare" : "Add to compare"}
              </button>
              <a
                href={device.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/50 px-5 py-3 text-[13px] font-semibold text-primary-ink transition-colors hover:bg-primary/10"
              >
                View on GSMArena <ExternalLink size={14} />
              </a>
            </div>
          </aside>

          {/* Spec sections */}
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <h3 className="font-display text-base font-bold text-on-surface">Specifications</h3>
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-medium text-on-surface-variant">
                {sections.length} sections
              </span>
            </div>

            <div className="space-y-3">
              {sections.map(([section, data]) => (
                <section key={section} className="rounded-[24px] bg-surface-container p-4 sm:p-5">
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                      <SectionIcon section={section} />
                    </span>
                    <h4 className="font-display text-[15px] font-bold text-on-surface">{section}</h4>
                  </div>
                  <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant/90">
                          {key}
                        </dt>
                        <dd className="mt-1 text-[13px] font-medium leading-relaxed text-on-surface">
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

  const rows = [
    { icon: <Monitor size={14} />, label: "Display", value: getDisplaySummary(device) },
    { icon: <Cpu size={14} />, label: "Chipset", value: getChipSummary(device) },
    { icon: <Battery size={14} />, label: "Battery", value: getBatterySummary(device) },
  ];

  return (
    <>
      <article
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[28px] transition-all duration-300",
          compareSelected
            ? "bg-primary-container ring-2 ring-primary/70"
            : "bg-surface-container-low hover:bg-surface-container"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-surface-container-highest/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-ink">
              {getBrand(device.matched_device)}
            </span>
            <h3
              className={cn(
                "mt-2 line-clamp-2 font-display text-lg font-bold leading-tight",
                compareSelected ? "text-on-primary-container" : "text-on-surface"
              )}
            >
              {device.matched_device}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
            disabled={!compareSelected && compareDisabled}
            aria-pressed={compareSelected}
            aria-label={
              compareSelected
                ? `Remove ${device.matched_device} from compare`
                : `Add ${device.matched_device} to compare`
            }
            title={compareSelected ? "Remove from compare" : "Add to compare"}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90",
              compareSelected
                ? "bg-primary text-on-primary"
                : "bg-surface-container-highest text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container disabled:cursor-not-allowed disabled:opacity-30"
            )}
          >
            {compareSelected ? <Check size={15} strokeWidth={3} /> : <Plus size={15} />}
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="block px-5 pt-4 text-left"
          aria-label={`Open ${device.matched_device} datasheet`}
        >
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] bg-white p-6">
            <img
              src={device.image || FALLBACK_IMG}
              alt={device.matched_device}
              className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMG;
              }}
            />
          </div>

          <dl className="mt-4 space-y-2.5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    compareSelected
                      ? "bg-on-primary-container/10 text-on-primary-container"
                      : "bg-primary-container text-on-primary-container"
                  )}
                >
                  {row.icon}
                </span>
                <div className="min-w-0">
                  <dt
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-[0.08em]",
                      compareSelected
                        ? "text-on-primary-container/60"
                        : "text-on-surface-variant/90"
                    )}
                  >
                    {row.label}
                  </dt>
                  <dd
                    className={cn(
                      "truncate text-[13px] font-medium",
                      compareSelected ? "text-on-primary-container" : "text-on-surface"
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </button>

        <button
          onClick={() => setOpen(true)}
          className={cn(
            "mt-auto flex items-center justify-between gap-2 px-5 py-4 text-[13px] font-semibold transition-colors",
            compareSelected
              ? "text-on-primary-container hover:bg-on-primary-container/10"
              : "text-primary-ink hover:bg-primary/10"
          )}
        >
          View full specs
          <ArrowRight size={15} />
        </button>
      </article>

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
    <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-surface-container-low p-0 shadow-2xl sm:mx-auto sm:w-full sm:max-w-5xl">
      <DialogTitle className="sr-only">Compare devices</DialogTitle>

      <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/15 px-5 py-4 pr-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <ArrowLeftRight size={17} />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-on-surface">
              Compare{" "}
              <span className="font-normal text-on-surface-variant">{devices.length}/3</span>
            </h2>
            <p className="text-[11px] text-on-surface-variant/90">Scroll sideways on mobile</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setDiffOnly(!diffOnly)}
            aria-pressed={diffOnly}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all active:scale-95",
              diffOnly
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            )}
          >
            {diffOnly && <Check size={13} strokeWidth={3} />}
            Differences only
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold text-on-surface-variant/90 transition-colors hover:bg-error/10 hover:text-error"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="custom-scrollbar overflow-y-auto p-4 sm:p-6">
        <div className="overflow-x-auto pb-1">
          <div className={cn(devices.length === 3 && "min-w-[560px]")}>
            <div className={cn("grid gap-3", cols)}>
              {devices.map((d) => (
                <div
                  key={d.matched_device}
                  className="relative flex flex-col items-center gap-2 rounded-[22px] bg-surface-container p-3 text-center"
                >
                  <button
                    onClick={() => onRemove(d.matched_device)}
                    aria-label={`Remove ${d.matched_device}`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant/90 transition-colors hover:bg-error/15 hover:text-error"
                  >
                    <X size={14} />
                  </button>
                  <div className="mt-4 flex aspect-[4/3] w-full items-center justify-center rounded-[16px] bg-white p-3">
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
                  <div className="w-full">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-ink">
                      {getBrand(d.matched_device)}
                    </div>
                    <div className="line-clamp-2 text-[12px] font-semibold leading-snug text-on-surface">
                      {d.matched_device}
                    </div>
                  </div>
                  <a
                    href={d.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-primary-ink hover:bg-primary/10"
                  >
                    GSMArena <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>

            {visibleGroups.length === 0 ? (
              <div className="mt-8 rounded-[24px] bg-surface-container p-8 text-center">
                <p className="text-sm text-on-surface-variant/90">
                  No differences — these devices match on every listed spec.
                </p>
              </div>
            ) : (
              visibleGroups.map((g) => (
                <div key={g.section} className="mt-5">
                  <div className="mb-2.5 flex items-center gap-2.5 px-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                      <SectionIcon section={g.section} />
                    </span>
                    <h3 className="font-display text-sm font-bold text-on-surface">{g.section}</h3>
                    <span className="ml-auto rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-medium text-on-surface-variant">
                      {g.rows.length} rows
                    </span>
                  </div>
                  <div className="space-y-2">
                    {g.rows.map((r) => (
                      <div
                        key={`${g.section}-${r.key}`}
                        className={cn(
                          "rounded-[20px] p-3",
                          r.differs ? "bg-primary-container/50" : "bg-surface-container/70"
                        )}
                      >
                        <div className="mb-2 flex items-center gap-2 px-1">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/90">
                            {r.key}
                          </span>
                          {r.differs && (
                            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-on-secondary-container">
                              Differs
                            </span>
                          )}
                        </div>
                        <div className={cn("grid gap-2", cols)}>
                          {r.values.map((v, i) => (
                            <div
                              key={i}
                              className="rounded-[14px] bg-surface-container-low px-3 py-2 text-[12px] leading-relaxed text-on-surface"
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
  const { activeSkin } = useSkin();
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("q") ?? ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filter, setFilter] = useState<string>("All");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);
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
      // Roll sub-brand counts up into the Xiaomi tab.
      if (b === "Redmi" || b === "Poco") {
        counts.set("Xiaomi", (counts.get("Xiaomi") ?? 0) + 1);
      }
    });
    return counts;
  }, [devices]);

  const filteredDevices = useMemo(() => {
    if (filter === "All") return devices;
    return devices.filter((dev) => brandMatchesFilter(getBrand(dev.matched_device), filter));
  }, [devices, filter]);

  // Reset paging whenever the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, filter, data]);

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
    <div className="relative min-h-screen overflow-x-hidden bg-surface font-sans text-on-surface">
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Top app bar */}
        <header className="flex items-center justify-between gap-4 py-5">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 text-left active:scale-95 transition-transform"
            aria-label="Back to Toolz home"
          >
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px] bg-primary-container p-2">
              <SkinIcon skin={activeSkin} size={28} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[16px] font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary-ink">
                Toolz
              </span>
              <span className="block text-[11px] font-medium text-on-surface-variant/90">
                Phone specifications
              </span>
            </span>
          </button>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              aria-label="Home"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <ArrowLeft size={17} />
            </button>
            <a
              href="/api/info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2.5 text-[13px] font-semibold text-on-secondary-container transition-all hover:shadow-lg active:scale-95"
            >
              <Info size={16} />
              <span className="hidden sm:inline">API reference</span>
              <span className="sm:hidden">API</span>
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section className="pb-8 pt-6 sm:pb-10 sm:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3.5 py-1.5 text-[12px] font-semibold text-on-primary-container">
            <Sparkles size={14} />
            Live hardware index
          </span>

          <h1 className="mt-5 max-w-3xl text-balance font-display text-[2.9rem] font-extrabold leading-[0.94] tracking-[-0.04em] text-on-surface sm:text-6xl lg:text-7xl">
            Find any phone.
            <br />
            <span className="text-primary-ink">Read every spec.</span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-on-surface-variant/90 sm:text-base">
            Search real device hardware, open a complete datasheet, or line up three phones to see
            exactly what changes between them.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                searchRef.current?.focus();
                searchRef.current?.select();
                document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-semibold text-on-primary transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
            >
              <Search size={17} />
              Search the catalog
            </button>
            <a
              href="/api/info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-3.5 text-[14px] font-semibold text-primary-ink transition-colors hover:bg-primary/10"
            >
              Read the API docs <ArrowUpRight size={16} />
            </a>
          </div>

          {/* Tonal stat cards */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Devices cached",
                value: data?.totalInRedis ?? "—",
                icon: <Database size={18} />,
                tone: "bg-primary-container text-on-primary-container",
                sub: "Ready to read instantly",
              },
              {
                label: "In this view",
                value: filteredDevices.length,
                icon: <Smartphone size={18} />,
                tone: "bg-secondary-container text-on-secondary-container",
                sub: filter === "All" ? "Across every brand" : `${filter} only`,
              },
              {
                label: "Compare slots",
                value: `${compareIds.length}/3`,
                icon: <ArrowLeftRight size={18} />,
                tone: "bg-tertiary-container text-on-tertiary-container",
                sub: compareIds.length < 2 ? "Pick two phones" : "Ready to compare",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn("flex items-center gap-4 rounded-[26px] p-4 sm:p-5", stat.tone)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/10">
                  {stat.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.1em] opacity-90">
                    {stat.label}
                  </div>
                  <div className="font-display text-3xl font-extrabold leading-tight tabular-nums">
                    {stat.value}
                  </div>
                  <div className="truncate text-[11px] opacity-90">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Catalog */}
        <section id="catalog" className="scroll-mt-4">
          <div className="sticky top-2 z-30 -mx-1 rounded-[28px] border border-outline-variant/20 bg-surface/85 p-2 shadow-xl shadow-black/20 backdrop-blur-xl sm:-mx-2 sm:p-3">
            <div className="flex items-stretch gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/90"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search a model — Galaxy S24, Pixel 9, iPhone 16…"
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search phone models"
                  className="h-12 w-full rounded-full bg-surface-container-high pl-12 pr-24 text-[14px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/50 [&::-webkit-search-cancel-button]:hidden"
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
                      className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      <X size={15} />
                    </button>
                  ) : (
                    <kbd className="hidden rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-medium text-on-surface-variant/90 sm:block">
                      /
                    </kbd>
                  )}
                </div>
              </div>

              {compareIds.length > 0 && (
                <button
                  onClick={() => setCompareOpen(true)}
                  disabled={compareDevices.length < 2}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-on-primary transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
                >
                  <ArrowLeftRight size={16} />
                  <span className="hidden sm:inline">Compare</span>
                  <span className="tabular-nums">{compareIds.length}/3</span>
                </button>
              )}
            </div>

            {/* Brand chips */}
            <div className="mt-2 flex min-w-0 snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

          {/* Result meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 pb-4 pt-5 text-[12px] text-on-surface-variant/90">
            <span className="rounded-full bg-surface-container-high px-3 py-1 font-medium">
              {isLoading
                ? "Loading…"
                : filteredDevices.length > PAGE_SIZE
                  ? `${visibleDevices.length} of ${filteredDevices.length} devices`
                  : `${filteredDevices.length} device${filteredDevices.length === 1 ? "" : "s"}`}
            </span>
            {filter !== "All" && (
              <span className="rounded-full bg-secondary-container px-3 py-1 font-medium text-on-secondary-container">
                {filter}
              </span>
            )}
            {data?.autoEnriched && (
              <span className="rounded-full bg-tertiary-container px-3 py-1 font-medium text-on-tertiary-container">
                New match cached
              </span>
            )}
            {compareFull && (
              <span className="rounded-full bg-primary-container px-3 py-1 font-medium text-on-primary-container">
                Compare full
              </span>
            )}
            <span className="ml-auto hidden sm:inline">
              {debouncedSearch ? `Results for “${debouncedSearch}”` : "Sorted by relevance"}
            </span>
          </div>

          {/* Grid */}
          <div className="min-h-[400px] pb-8">
            {isLoading && !data ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[380px] animate-pulse rounded-[28px] bg-surface-container-low"
                  />
                ))}
              </div>
            ) : filteredDevices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleDevices.map((dev) => (
                    <SpecCard
                      key={dev.matched_device}
                      device={dev}
                      compareSelected={compareIds.includes(dev.matched_device)}
                      compareDisabled={compareFull && !compareIds.includes(dev.matched_device)}
                      onToggleCompare={() => toggleCompare(dev.matched_device)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center pt-10">
                    {isFetching ? (
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                    ) : (
                      <button
                        onClick={() =>
                          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredDevices.length))
                        }
                        className="rounded-full bg-surface-container-high px-7 py-3.5 text-[13px] font-semibold text-on-surface-variant transition-all hover:bg-surface-container-highest hover:text-on-surface active:scale-95"
                      >
                        Load {Math.min(PAGE_SIZE, filteredDevices.length - visibleDevices.length)}{" "}
                        more devices
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[32px] bg-surface-container-low px-6 py-16 text-center sm:py-24">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <Search size={26} />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-on-surface">
                  No entries found
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant/90">
                  Try a different model name
                  {filter !== "All" ? ` or clear the “${filter}” filter` : ""}.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="rounded-full bg-surface-container-high px-5 py-2.5 text-[13px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      Clear search
                    </button>
                  )}
                  {filter !== "All" && (
                    <button
                      onClick={() => setFilter("All")}
                      className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-on-primary transition-all hover:shadow-lg active:scale-95"
                    >
                      Show all brands
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mb-8 rounded-[32px] bg-surface-container-low p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px] bg-primary-container p-2">
                  <SkinIcon skin={activeSkin} size={28} />
                </span>
                <div>
                  <div className="font-display text-[15px] font-bold text-on-surface">
                    Toolz Spec Index
                  </div>
                  <div className="text-[11px] text-on-surface-variant/90">Live hardware data</div>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-on-surface-variant/90">
                Full hardware sheets for each device, served from cache and refreshed from GSMArena
                when a query is new. Images and spec text belong to GSMArena.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/90">
                Index
              </div>
              <ul className="mt-3 space-y-2 text-[13px]">
                {[
                  { label: "All devices", href: "#catalog" },
                  { label: "Download Toolz", href: "/downloads" },
                  { label: "Project news", href: "/news" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="rounded-full text-on-surface-variant/90 transition-colors hover:text-primary-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/90">
                Data
              </div>
              <ul className="mt-3 space-y-2 text-[13px]">
                {[
                  { label: "Architecture & API", href: "/api/info" },
                  { label: "GSMArena source", href: "https://www.gsmarena.com" },
                  { label: "Toolz home", href: "/" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-on-surface-variant/90 transition-colors hover:text-primary-ink"
                    >
                      {link.label}
                      {link.href.startsWith("http") && <ExternalLink size={11} />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-outline-variant/20 pt-4 text-[11px] text-on-surface-variant/90 sm:flex-row sm:items-center">
            <span>© 2026 Toolz Project</span>
            <span>Spec images & data © GSMArena · Shown for reference</span>
          </div>
        </footer>
      </div>

      {/* Compare tray */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:w-auto sm:-translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-[28px] border border-outline-variant/20 bg-surface-container-high/95 p-2 pl-3 shadow-2xl backdrop-blur-xl">
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
                        <div className="flex h-full w-full items-center justify-center text-[12px] font-bold text-black/70">
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
                    className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-outline-variant/50 text-on-surface-variant/70"
                  >
                    <Plus size={15} />
                  </div>
                ))}
              </div>

              <div className="min-w-0 leading-tight">
                <div className="text-[12px] font-semibold text-on-surface">
                  {compareIds.length}/3 selected
                </div>
                <div className="truncate text-[11px] text-on-surface-variant/90 sm:max-w-[190px]">
                  {compareIds.length < 2 ? "Pick at least 2 to compare" : "Ready to compare"}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-1 sm:ml-2">
                <button
                  onClick={() => setCompareIds([])}
                  aria-label="Clear compare"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant/90 transition-colors hover:bg-error/10 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => compareDevices.length >= 2 && setCompareOpen(true)}
                  disabled={compareDevices.length < 2}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[13px] font-semibold text-on-primary transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeftRight size={15} />
                  Compare
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
