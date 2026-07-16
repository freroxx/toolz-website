import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Smartphone, Terminal, Cpu } from "lucide-react";

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

const modules = [
  {
    id: "tactical",
    name: "Tactical_UI",
    desc: "Optimized for high-speed operation and zero-latency feedback.",
    images: allScreenshots.slice(0, 12)
  },
  {
    id: "vault",
    name: "Hardened_Vault",
    desc: "Military-grade encryption for your most sensitive local data.",
    images: allScreenshots.slice(12, 24)
  },
  {
    id: "engine",
    name: "Media_Engine",
    desc: "Lossless conversion and orchestration of system media assets.",
    images: allScreenshots.slice(24)
  }
];

const Showcase = () => {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = useCallback(() => {
    setImageIndex((prev) => (prev + 1) % activeModule.images.length);
  }, [activeModule.images.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) nextImage();
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered, nextImage]);

  useEffect(() => {
    setImageIndex(0);
  }, [activeModule]);

  return (
    <section id="showcase" className="py-32 bg-black relative border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="lg:w-1/2">
            <div className="text-technical text-primary mb-6">Interface_Protocol</div>
            <h2 className="text-6xl font-black uppercase tracking-tighter mb-12">
              System <br />
              <span className="text-primary">Modules_</span>
            </h2>
            
            <div className="flex flex-col gap-4">
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m)}
                  className={`p-8 border text-left transition-all duration-500 tactile-feedback group relative ${
                    activeModule.id === m.id 
                      ? "border-primary bg-primary/5" 
                      : "border-white/5 bg-transparent hover:border-white/20"
                  }`}
                >
                  {activeModule.id === m.id && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-technical ${activeModule.id === m.id ? "text-primary" : "text-white/20"}`}>
                      {m.id.toUpperCase()}_SYS
                    </span>
                    <Terminal className={`w-4 h-4 ${activeModule.id === m.id ? "text-primary" : "text-white/10"}`} />
                  </div>
                  <h3 className={`text-2xl font-black uppercase mb-2 ${activeModule.id === m.id ? "text-white" : "text-white/40"}`}>
                    {m.name}
                  </h3>
                  <p className="text-sm font-mono text-white/20 group-hover:text-white/40 transition-colors">
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative flex justify-center">
            <div 
              className="relative w-full max-w-[320px] aspect-[9/19] bg-black border-4 border-white/10 p-2 shadow-2xl group cursor-pointer overflow-hidden tactile-feedback"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={nextImage}
            >
              <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
              <div className="relative w-full h-full overflow-hidden bg-zinc-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${activeModule.id}-${imageIndex}`}
                    src={activeModule.images[imageIndex]}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                  <div className="bg-black/80 border border-primary/50 px-4 py-2 flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-primary animate-bounce" />
                    <span className="text-technical text-primary">Skip_Buffer</span>
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 border border-primary/20 px-2 py-1">
                  <Smartphone className="w-3 h-3 text-primary" />
                  <span className="text-[8px] font-mono text-primary uppercase">v1.0.9_LIVE</span>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-black/80 border border-white/10 px-2 py-1">
                  <span className="text-[8px] font-mono text-white/40 uppercase">
                    Buffer: {imageIndex + 1}/{activeModule.images.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
