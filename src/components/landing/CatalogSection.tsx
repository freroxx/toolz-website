import { motion } from "framer-motion";
import { ArrowRight, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "@/components/landing/SectionHeader";
import { PRESS_SPRING } from "@/lib/motion";

interface SpecPayload {
  matched_device: string;
  image: string;
}

interface CatalogResponse {
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

  const previewDevices = data?.devices?.slice(0, 10) || [];

  return (
    <section id="catalog" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          className="overflow-hidden rounded-[28px] border px-6 py-8 md:px-10 md:py-10 shadow-xs"
          style={{
            background: "hsl(var(--md-surface-container-low))",
            borderColor: "hsl(var(--md-outline-variant) / 0.5)",
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
            <SectionHeader
              className="mb-2 max-w-2xl md:mb-4"
              chip="Spec catalog"
              title="Look up any device."
              description="Full hardware specs for thousands of phones, tablets and watches — the same catalog inside the app."
            />
            <motion.div
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              transition={PRESS_SPRING}
            >
              <Link
                to="/spec"
                className="m3-btn-filled mb-4 gap-2 px-7 py-3.5 text-sm shadow-sm"
              >
                Open catalog
                <ArrowRight size={17} />
              </Link>
            </motion.div>
          </div>

          {/* White wells keep GSMArena product shots legible in both themes. */}
          <div className="mask-fade-horizontal -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 pt-1 md:-mx-10 md:px-10" style={{ scrollbarWidth: "none" }}>
            {isLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-44 w-32 shrink-0 animate-pulse rounded-[20px]"
                    style={{ background: "hsl(var(--md-surface-container-high))" }}
                  />
                ))
              : previewDevices.map((dev, i) => (
                  <motion.div
                    key={dev.matched_device}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="w-32 shrink-0"
                  >
                    <div className="flex h-40 items-center justify-center rounded-[20px] bg-white p-3 shadow-sm">
                      <img
                        src={dev.image}
                        alt={dev.matched_device}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <p className="m3-label-small mt-2 line-clamp-1 text-on-surface-variant">
                      {dev.matched_device}
                    </p>
                  </motion.div>
                ))}

            {!isLoading && previewDevices.length === 0 && (
              <div
                className="flex h-44 flex-1 items-center justify-center gap-2 rounded-[20px]"
                style={{ background: "hsl(var(--md-surface-container))" }}
              >
                <Smartphone size={18} className="text-on-surface-variant" />
                <span className="m3-body-small text-on-surface-variant">
                  Catalog preview unavailable.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
