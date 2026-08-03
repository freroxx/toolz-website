import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

const allScreenshots = [
  "https://i.ibb.co/JPmYCs5/Screenshot-20260801-202638-Toolz.jpg",
  "https://i.ibb.co/8LyXD7gL/Screenshot-20260801-202824-Toolz.jpg",
  "https://i.ibb.co/x8dPC604/Screenshot-20260801-202836-Toolz.jpg",
  "https://i.ibb.co/B5ddDr3B/Screenshot-20260801-202943-Toolz.jpg",
  "https://i.ibb.co/HvXvq7b/Screenshot-20260801-203047-Toolz.jpg",
  "https://i.ibb.co/bgZhLpFC/Screenshot-20260801-203255-Toolz.jpg",
  "https://i.ibb.co/KxBCH1N0/Screenshot-20260801-203650-Toolz.jpg",
  "https://i.ibb.co/fY4P78H0/Screenshot-20260801-203726-Toolz.jpg",
  "https://i.ibb.co/1f6nwgh2/Screenshot-20260801-203837-Toolz.jpg",
  "https://i.ibb.co/VcXgd7Ln/Screenshot-20260801-203956-Toolz.jpg",
  "https://i.ibb.co/TBWstnFX/Screenshot-20260801-204050-Toolz.jpg",
  "https://i.ibb.co/fdJTKt21/Screenshot-20260801-204136-Toolz.jpg",
  "https://i.ibb.co/YB78db4d/Screenshot-20260801-204152-Toolz.jpg",
  "https://i.ibb.co/QFjpfKM3/Screenshot-20260801-204227-Toolz.jpg",
  "https://i.ibb.co/6c0JdSJb/Screenshot-20260801-204253-Toolz.jpg",
  "https://i.ibb.co/60Y3Kfyd/Screenshot-20260801-204349-Toolz.jpg",
  "https://i.ibb.co/gZpPwFYB/Screenshot-20260801-204451-Toolz.jpg",
  "https://i.ibb.co/LdJkX9W8/Screenshot-20260801-204508-Toolz.jpg",
  "https://i.ibb.co/NdV9Zvvx/Screenshot-20260801-204523-Toolz.jpg",
  "https://i.ibb.co/7xrctBk2/Screenshot-20260801-204546-Toolz.jpg",
  "https://i.ibb.co/3yVtRJK9/Screenshot-20260801-204556-Toolz.jpg",
  "https://i.ibb.co/kg8DK78X/Screenshot-20260801-204625-Toolz.jpg",
  "https://i.ibb.co/PZ5C7W3d/Screenshot-20260801-204720-Toolz.jpg",
  "https://i.ibb.co/pjjRVt11/Screenshot-20260801-204746-Toolz.jpg",
  "https://i.ibb.co/21KCCVnq/Screenshot-20260801-204951-Toolz.jpg",
  "https://i.ibb.co/YFwsHXGX/Screenshot-20260801-205032-Toolz.jpg",
  "https://i.ibb.co/Gf9G1HSD/Screenshot-20260801-205053-Toolz.jpg",
  "https://i.ibb.co/PG37z8B9/Screenshot-20260801-205157-Toolz.jpg",
  "https://i.ibb.co/rfHmrYzG/Screenshot-20260801-205233-Toolz.jpg",
  "https://i.ibb.co/hFcfWbcK/Screenshot-20260801-205252-Toolz.jpg",
  "https://i.ibb.co/vvJcqG6k/Screenshot-20260801-205311-Toolz.jpg",
  "https://i.ibb.co/mVc23hyP/Screenshot-20260801-205448-Toolz.jpg",
  "https://i.ibb.co/przVxJQw/Screenshot-20260801-205634-Toolz.jpg",
  "https://i.ibb.co/TBX23hW8/Screenshot-20260801-205655-Toolz.jpg",
  "https://i.ibb.co/6cS4Ps4k/Screenshot-20260801-205740-Toolz.jpg",
  "https://i.ibb.co/bg8WHNyJ/Screenshot-20260801-205820-Toolz.jpg",
  "https://i.ibb.co/BV2q8cQn/Screenshot-20260801-205902-Toolz.jpg",
  "https://i.ibb.co/C5Zk6tJB/Screenshot-20260801-205939-Toolz.jpg",
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
