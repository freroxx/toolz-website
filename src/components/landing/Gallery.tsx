import { motion } from "framer-motion";
import { useState } from "react";
import { X, LayoutGrid } from "lucide-react";

const screenshots = [
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

  const column1 = [...screenshots].slice(0, 9);
  const column2 = [...screenshots].slice(9, 18);
  const column3 = [...screenshots].slice(18, 27);
  const column4 = [...screenshots].slice(27);

  const ScrollingColumn = ({ items, speed, reverse = false }: { items: string[], speed: number, reverse?: boolean }) => (
    <div className="flex flex-col gap-8 relative h-[900px] overflow-hidden">
      <motion.div
        animate={{
          y: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-col gap-8"
      >
        {[...items, ...items].map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            whileHover={{ scale: 1.05, rotate: reverse ? -1 : 1 }}
            onClick={() => setSelectedImage(src)}
            className="relative aspect-[9/19] w-full rounded-[2rem] overflow-hidden cursor-zoom-in border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] glass group shrink-0"
          >
            <img
              src={src}
              alt="Toolz Detail"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <section id="gallery" className="relative py-32 overflow-hidden bg-secondary/10">
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-background to-transparent z-20" />
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-background to-transparent z-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-2/5 text-center lg:text-left"
          >
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <LayoutGrid className="w-5 h-5 text-accent" />
              <span className="text-xs uppercase tracking-[0.4em] text-accent font-black block">Visual Proof</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black mt-3 leading-[0.9] tracking-tighter mb-8">
              Every Pixel <br />
              <span className="text-gradient">Refined.</span>
            </h2>
            <p className="text-xl text-muted-foreground mt-6 leading-relaxed font-medium">
              We don't do generic. Every interface in Toolz is built with a focus on hierarchy, accessibility, and modern aesthetics.
            </p>
            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="px-8 py-4 rounded-2xl glass border-primary/20 text-sm font-black uppercase tracking-widest">
                34 High-Res Previews
              </div>
            </div>
          </motion.div>

          <div className="lg:w-3/5 grid grid-cols-2 sm:grid-cols-4 gap-8 h-[900px] overflow-hidden mask-fade-edges opacity-80 hover:opacity-100 transition-opacity duration-700">
            <ScrollingColumn items={column1} speed={45} />
            <ScrollingColumn items={column2} speed={55} reverse />
            <ScrollingColumn items={column3} speed={50} />
            <ScrollingColumn items={column4} speed={60} reverse />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 p-3 rounded-full glass-strong hover:bg-white/10 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-full max-h-[85vh] aspect-[9/19]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Toolz Full View"
              className="w-full h-full object-contain rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default Gallery;
