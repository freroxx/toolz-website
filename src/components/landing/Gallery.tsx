import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

const allScreenshots = [
  "https://i.ibb.co/SDwBvkzW/Screenshot-20260504-201707-Toolz.jpg",
  "https://i.ibb.co/JRm38F2k/Screenshot-20260504-201637-Toolz.jpg",
  "https://i.ibb.co/VW9YRJCS/Screenshot-20260504-201525-Toolz.jpg",
  "https://i.ibb.co/hR44MRvC/Screenshot-20260504-201429-Toolz.jpg",
  "https://i.ibb.co/V0rhMPbT/Screenshot-20260504-201424-Toolz.jpg",
  "https://i.ibb.co/N2PQt7QD/Screenshot-20260504-201404-Toolz.jpg",
  "https://i.ibb.co/TB8wMctc/Screenshot-20260504-201321-Toolz.jpg",
  "https://i.ibb.co/Qv36yMLW/Screenshot-20260504-201305-Toolz.jpg",
  "https://i.ibb.co/JRnj9jtP/Screenshot-20260504-201302-Toolz.jpg",
  "https://i.ibb.co/DfM3hqZN/Screenshot-20260504-201245-Toolz.jpg",
  "https://i.ibb.co/RG99VdJP/Screenshot-20260504-201230-Toolz.jpg",
  "https://i.ibb.co/bpJ4kxD/Screenshot-20260504-201157-Toolz.jpg",
  "https://i.ibb.co/Ld9TSVHg/Screenshot-20260504-201218-Toolz.jpg",
  "https://i.ibb.co/Cp6yQ6TY/Screenshot-20260504-201146-Toolz.jpg",
  "https://i.ibb.co/Z6bVTzp7/Screenshot-20260504-201131-Toolz.jpg",
  "https://i.ibb.co/sds1Q9Q1/Screenshot-20260504-201119-Toolz.jpg",
  "https://i.ibb.co/jZDcd8HQ/Screenshot-20260504-201055-Toolz.jpg",
  "https://i.ibb.co/BVFMt6GR/Screenshot-20260504-200841-Toolz.jpg",
  "https://i.ibb.co/yFBpMYxN/Screenshot-20260504-200819-Toolz.jpg",
  "https://i.ibb.co/Kpr0BjhS/Screenshot-20260504-200806-Toolz.jpg",
  "https://i.ibb.co/XkL1BR8h/Screenshot-20260504-200753-Toolz.jpg",
  "https://i.ibb.co/pv75nVjF/Screenshot-20260504-200738-Toolz.jpg",
  "https://i.ibb.co/bg2xyXst/Screenshot-20260504-200723-Toolz.jpg",
  "https://i.ibb.co/LsfbwSk/Screenshot-20260504-200614-Toolz.jpg",
  "https://i.ibb.co/0VnF2thc/Screenshot-20260504-200628-Toolz.jpg",
  "https://i.ibb.co/Cp87DK3q/Screenshot-20260504-200536-Toolz.jpg",
  "https://i.ibb.co/nqH2xcML/Screenshot-20260504-200554-Toolz.jpg",
  "https://i.ibb.co/RGg4TMxH/Screenshot-20260504-200525-Toolz.jpg",
  "https://i.ibb.co/Q70RRnw8/Screenshot-20260504-200505-Toolz.jpg",
  "https://i.ibb.co/qLVPxjDN/Screenshot-20260504-200445-Toolz.jpg",
  "https://i.ibb.co/84T4zVkQ/Screenshot-20260504-200427-Toolz.jpg",
  "https://i.ibb.co/DN433s5/Screenshot-20260504-200416-Toolz.jpg",
  "https://i.ibb.co/9HWFbpD7/Screenshot-20260504-200355-Toolz.jpg",
  "https://i.ibb.co/p64Prvg5/Screenshot-20260504-200347-Toolz.jpg",
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const column1 = [...allScreenshots].slice(0, 9);
  const column2 = [...allScreenshots].slice(9, 18);
  const column3 = [...allScreenshots].slice(18, 27);
  const column4 = [...allScreenshots].slice(27);

  const ScrollingColumn = ({ items, speed, reverse = false }: { items: string[], speed: number, reverse?: boolean }) => (
    <div className="flex flex-col gap-4 relative h-[800px] overflow-hidden">
      <motion.div
        animate={{
          y: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-col gap-4"
      >
        {[...items, ...items].map((src, i) => (
          <div
            key={`${src}-${i}`}
            onClick={() => setSelectedImage(src)}
            className="relative aspect-[9/19] w-full bg-black border border-white/10 cursor-zoom-in group shrink-0 tactile-feedback"
          >
            <img
              src={src}
              alt="Toolz_Buffer"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-all" />
          </div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <section id="gallery" className="relative py-32 bg-black border-y border-white/5">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-2/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-primary" />
              <span className="text-technical text-primary">Visual_Assets</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">
              Interface <br />
              Audit<span className="text-primary">_</span>
            </h2>
            <p className="text-xl font-mono text-white/50 leading-relaxed">
              Every pixel of the Toolz UI is optimized for technical clarity and operational efficiency. No bloat, just performance.
            </p>
          </div>

          <div className="lg:w-3/5 grid grid-cols-2 sm:grid-cols-4 gap-4 h-[800px] overflow-hidden mask-fade-vertical grayscale hover:grayscale-0 transition-all duration-700">
            <ScrollingColumn items={column1} speed={40} />
            <ScrollingColumn items={column2} speed={50} reverse />
            <ScrollingColumn items={column3} speed={45} />
            <ScrollingColumn items={column4} speed={55} reverse />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 p-4 border border-white/10 text-primary hover:bg-primary hover:text-black transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-full max-h-[85vh] aspect-[9/19] border-2 border-white/10 p-2 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Toolz_Full_Buffer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
