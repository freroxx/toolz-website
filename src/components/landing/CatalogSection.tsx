import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
    <section id="catalog" className="py-24 relative overflow-hidden" style={{ background: "hsl(var(--md-surface))" }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="m3-display-small text-on-surface mb-4">
            Hardware Intelligence.
          </h2>
          <p className="m3-body-medium text-on-surface-variant opacity-60 mb-8 max-w-xl">
            A minimalist engineering index of device specifications. Zero slop.
          </p>
          <Link
            to="/spec"
            className="m3-btn-filled px-8 text-sm gap-2 active:scale-95 transition-transform"
          >
            Launch Catalog
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Clean, simple row of phones - No text, only rounded images */}
        <div className="flex justify-center gap-4 overflow-hidden mask-fade-horizontal pb-4">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-32 h-44 rounded-3xl bg-surface-container animate-pulse flex-shrink-0" />
            ))
          ) : (
            previewDevices.map((dev, i) => (
              <motion.div
                key={dev.matched_device}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="w-32 h-44 bg-surface-container-low rounded-[32px] p-3 flex items-center justify-center border border-outline-variant/10 flex-shrink-0"
              >
                <img
                  src={dev.image}
                  alt={dev.matched_device}
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
