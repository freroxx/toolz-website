import { motion } from "framer-motion";
import { ArrowRight, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "@/components/landing/SectionHeader";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES } from "@/components/expressive/shapes";

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
    <section
      id="catalog"
      className="scroll-mt-20 py-20 md:py-28"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-6 md:mb-12">
          <SectionHeader
            className="mb-0"
            chip="Spec catalog"
            title="Look up any device."
            description="Full hardware specs for thousands of phones, tablets and watches, the same catalog that's inside the app."
          />
          <motion.div whileTap={{ scale: 0.96 }} transition={PRESS_SPRING}>
            <Link to="/spec" className="m3-btn-filled gap-2 px-7 py-3.5 text-sm">
              Open catalog
              <ArrowRight size={17} />
            </Link>
          </motion.div>
        </div>

        <div
          className="mask-fade-horizontal -mx-4 flex gap-4 overflow-x-auto px-4 pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {isLoading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 w-40 shrink-0 animate-pulse"
                  style={{
                    borderRadius: SHAPES.large,
                    background: "hsl(var(--md-surface-container-high))",
                  }}
                />
              ))
            : previewDevices.map((dev) => (
                <div key={dev.matched_device} className="w-40 shrink-0">
                  <div
                    className="flex h-52 items-center justify-center p-4"
                    style={{
                      borderRadius: SHAPES.large,
                      background: "hsl(var(--md-surface-container))",
                    }}
                  >
                    <img
                      src={dev.image}
                      alt={dev.matched_device}
                      loading="lazy"
                      className="device-img max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="m3-label-large mt-3 line-clamp-1 px-1 text-on-surface-variant">
                    {dev.matched_device}
                  </p>
                </div>
              ))}

          {!isLoading && previewDevices.length === 0 && (
            <div
              className="flex h-52 flex-1 items-center justify-center gap-2"
              style={{
                borderRadius: SHAPES.large,
                background: "hsl(var(--md-surface-container))",
              }}
            >
              <Smartphone size={18} className="text-on-surface-variant" />
              <span className="m3-body-small text-on-surface-variant">Catalog preview unavailable.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
