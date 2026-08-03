import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Smartphone, Terminal, Cpu } from "lucide-react";

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
