import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Terminal, Shield, Activity } from "lucide-react";

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

const showcaseGroups = [
  {
    title: "Operational_Interface",
    label: "Telemetry",
    icon: Activity,
    description: "Real-time system orchestration. A unified dashboard designed for maximum data density and minimal latency.",
    images: allScreenshots.slice(0, 17)
  },
  {
    title: "Hardened_Security",
    label: "Encryption",
    icon: Shield,
    description: "Device-local SQLCipher integration. Biometric verification for all secure vaults and notification archives.",
    images: allScreenshots.slice(17)
  }
];

const Showcase = () => {
  const [imageIndexes, setImageIndexes] = useState([0, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndexes(prev => prev.map((idx, i) => (idx + 1) % showcaseGroups[i].images.length));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="showcase" className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 space-y-48">
        {showcaseGroups.map((group, i) => (
          <div
            key={group.title}
            className={`flex flex-col ${
              i % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-16 md:gap-32`}
          >
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {/* Mechanical Frame */}
                <div className="relative bg-black border-2 border-white/10 p-2 shadow-2xl w-[280px] md:w-[320px]">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
                  
                  <div className="relative aspect-[9/19] overflow-hidden bg-zinc-900">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={group.images[imageIndexes[i]]}
                        src={group.images[imageIndexes[i]]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]"
                      />
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Technical Label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 text-[8px] font-mono font-black text-black uppercase tracking-widest">
                  Buffer_Stream: {imageIndexes[i] + 1}
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: i % 2 !== 0 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 justify-center md:justify-start mb-8">
                  <div className="w-10 h-10 border border-primary/20 flex items-center justify-center text-primary">
                    <group.icon className="w-5 h-5" />
                  </div>
                  <span className="text-technical text-primary">
                    Module_{group.label}
                  </span>
                </div>
                
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">
                  {group.title}<span className="text-primary">_</span>
                </h3>
                <p className="text-lg md:text-xl font-mono text-white/50 leading-relaxed max-w-lg mx-auto md:mx-0">
                  {group.description}
                </p>
                
                <div className="mt-12 flex justify-center md:justify-start gap-1">
                  {group.images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 transition-all duration-300 ${idx === imageIndexes[i] ? 'w-6 bg-primary' : 'w-1 bg-white/10'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Showcase;
