import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "@/components/landing/SectionHeader";

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
        <div className="flex flex-col items-center text-center mb-12">
          <SectionHeader
            className="mb-6"
            chip="Spec catalog"
            title="Look up any device."
            description="Full hardware specs for thousands of phones, tablets and watches — the same catalog inside the app."
          />
          <Link
            to="/spec"
            className="m3-btn-filled px-8 text-sm gap-2 active:scale-95 transition-transform"
          >
            Open catalog
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Clean, simple row of phones - White backgrounds to blend GSMArena assets */}
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
                className="w-32 h-44 bg-white rounded-2xl p-3 flex items-center justify-center border border-white/10 flex-shrink-0 shadow-xl"
              >
                <img
                  src={dev.image}
                  alt={dev.matched_device}
                  className="max-w-full max-h-full object-contain"
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
