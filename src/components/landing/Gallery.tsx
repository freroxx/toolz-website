import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

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

  // Split screenshots into 4 columns for the wheel effect
  const column1 = [...screenshots].slice(0, 9);
  const column2 = [...screenshots].slice(9, 18);
  const column3 = [...screenshots].slice(18, 27);
  const column4 = [...screenshots].slice(27);

  const ScrollingColumn = ({ items, speed, reverse = false }: { items: string[], speed: number, reverse?: boolean }) => (
    <div className="flex flex-col gap-6 relative h-[800px] overflow-hidden">
      <motion.div
        animate={{
          y: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-col gap-6"
      >
        {[...items, ...items].map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => setSelectedImage(src)}
            className="relative aspect-[9/19] w-full rounded-2xl overflow-hidden cursor-zoom-in border border-white/10 shadow-2xl glass group shrink-0"
          >
            <img
              src={src}
              alt="Toolz Screenshot"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <section id="gallery" className="relative py-28 overflow-hidden bg-secondary/20">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-20" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/3 text-center lg:text-left"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4 block">Visual Library</span>
            <h2 className="text-4xl md:text-6xl font-black mt-3 leading-tight">
              Infinite <br />
              <span className="text-gradient">Experience.</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Every tool is crafted with precision. Swipe through our vertical showcase to see the depth of Toolz.
            </p>
            <div className="mt-10 flex justify-center lg:justify-start gap-4">
              <div className="px-6 py-3 rounded-full glass border-primary/20 text-sm font-medium">
                34+ High-Res Previews
              </div>
            </div>
          </motion.div>

          <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-6 h-[800px] overflow-hidden mask-fade-edges">
            <ScrollingColumn items={column1} speed={40} />
            <ScrollingColumn items={column2} speed={50} reverse />
            <ScrollingColumn items={column3} speed={45} />
            <ScrollingColumn items={column4} speed={55} reverse />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-full glass hover:bg-white/10 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-full max-h-[90vh] aspect-[9/19]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Toolz Screenshot Full"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default Gallery;
