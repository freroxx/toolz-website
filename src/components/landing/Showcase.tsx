import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Shield, Activity, Cpu, Code, MousePointer2 } from "lucide-react";

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
    id: "MOD_01",
    title: "Tactical_UI",
    icon: Activity,
    description: "Highly customizable dashboard with 30+ tools. 100% Free, forever.",
    images: allScreenshots.slice(0, 11)
  },
  {
    id: "MOD_02",
    title: "Hardened_Vault",
    icon: Shield,
    description: "Military-grade SQLCipher encryption. Your data stays local.",
    images: allScreenshots.slice(11, 22)
  },
  {
    id: "MOD_03",
    title: "Media_Engine",
    icon: Cpu,
    description: "Professional FFmpeg processing and high-fidelity Media3 playback.",
    images: allScreenshots.slice(22)
  }
];

const Showcase = () => {
  const [activeMod, setActiveMod] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = useCallback(() => {
    setImgIndex(prev => (prev + 1) % modules[activeMod].images.length);
  }, [activeMod]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) nextImage();
    }, 3000);
    return () => clearInterval(timer);
  }, [activeMod, isHovered, nextImage]);

  return (
    <section id="showcase" className="relative py-32 bg-black border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          {/* Module Selector */}
          <div className="lg:w-1/3 flex flex-col gap-4 sticky top-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-primary" />
              <span className="text-technical text-primary">System_Modules</span>
            </div>
            
            {modules.map((mod, i) => (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveMod(i);
                  setImgIndex(0);
                }}
                className={`text-left p-6 border-2 transition-all duration-300 group relative overflow-hidden hover:translate-x-2 ${
                  activeMod === i ? "border-primary bg-primary/5" : "border-white/5 bg-transparent hover:border-white/20"
                }`}
              >
                {activeMod === i && (
                  <motion.div layoutId="activeMod" className="absolute inset-0 bg-primary/10 -z-10" />
                )}
                <div className="flex items-center justify-between mb-4">
                  <mod.icon className={`w-6 h-6 transition-transform group-hover:rotate-12 ${activeMod === i ? "text-primary" : "text-white/20"}`} />
                  <span className="text-[8px] font-mono text-white/20 group-hover:text-primary/40 transition-colors">{mod.id}</span>
                </div>
                <h3 className={`text-xl font-black uppercase tracking-tighter transition-colors ${activeMod === i ? "text-primary" : "text-white/40 group-hover:text-white"}`}>
                  {mod.title}
                </h3>
                <p className={`text-xs font-mono mt-2 leading-relaxed transition-colors ${activeMod === i ? "text-white/70" : "text-white/20 group-hover:text-white/40"}`}>
                  {mod.description}
                </p>
              </button>
            ))}

            <div className="mt-8 p-6 border border-white/10 bg-zinc-950 flex flex-col gap-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between text-technical text-white/20">
                <span>Made with love by frerox</span>
                <Code className="w-3 h-3" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-technical text-primary animate-pulse">100% FREE</span>
                <span className="text-[8px] font-mono text-white/20">NO_ADS_NO_TRACKERS</span>
              </div>
            </div>
          </div>

          {/* Module Viewer */}
          <div className="lg:w-2/3 flex flex-col items-center">
            <div 
              className="relative bg-black border-4 border-white/10 p-2 shadow-2xl group cursor-pointer overflow-hidden w-full max-w-[360px]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={nextImage}
            >
              {/* Corner Accents */}
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-primary group-hover:w-full group-hover:h-full transition-all duration-500 opacity-50" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-primary group-hover:w-full group-hover:h-full transition-all duration-500 opacity-50" />
              
              <div className="relative aspect-[9/16] overflow-hidden bg-zinc-900 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${activeMod}-${imgIndex}`}
                    src={modules[activeMod].images[imgIndex]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    decoding="async"
                  />
                </AnimatePresence>

                {/* Interactive Feedback Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/80 border border-primary/50 px-4 py-2 flex items-center gap-2 backdrop-blur-md">
                    <MousePointer2 className="w-4 h-4 text-primary animate-bounce" />
                    <span className="text-technical text-primary">Click_To_Skip</span>
                  </div>
                </div>

                {/* Technical Overlays */}
                <div className="absolute inset-0 pointer-events-none border border-primary/10" />
                <div className="absolute top-6 left-6 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-primary font-black uppercase tracking-widest">Active_Module: {modules[activeMod].title}</span>
                  <span className="text-[8px] font-mono text-white/20 uppercase">Buffer_ID: {imgIndex + 1} // TOTAL: {modules[activeMod].images.length}</span>
                </div>
                <div className="absolute bottom-6 right-6 flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono text-white/40 uppercase">System_State</span>
                    <span className="text-[10px] font-mono text-primary uppercase font-black">Operational</span>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(142,70,50,0.8)]" />
                </div>
              </div>
            </div>

            {/* Progress Indicator with Clickable Dots */}
            <div className="mt-8 flex items-center gap-1.5 w-full max-w-[360px]">
              {modules[activeMod].images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                  className={`h-1 flex-1 transition-all duration-300 hover:bg-primary/40 ${i === imgIndex ? "bg-primary" : "bg-white/5"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
