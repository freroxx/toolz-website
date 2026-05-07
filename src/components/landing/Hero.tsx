import { Download, Github, Terminal, Activity, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % allScreenshots.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24 bg-blueprint">
      <div className="scanline" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-4 mb-10 border border-primary/20 bg-primary/5 px-4 py-2"
            >
              <div className="w-2 h-2 bg-primary animate-pulse" />
              <span className="text-technical text-primary">Status: Orchestration_Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-huge font-black uppercase mb-12"
            >
              Less <br />
              <span className="text-primary italic">Noise.</span>
            </motion.h1>

            <div className="flex flex-col gap-8 mb-16 max-w-2xl mx-auto lg:mx-0">
              <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-mono">
                Toolz is a high-precision Android utility suite. Built for speed. Engineered for privacy. 30+ tools, zero bloat.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-technical text-white/30">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>30+ Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Kotlin Native</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>ARM64_V8A</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="https://github.com/freroxx/toolz/releases" className="btn-technical h-16 px-10">
                Fetch_Latest_APK
              </a>
              <a href="https://github.com/freroxx/toolz" className="btn-outline-technical h-16 px-10">
                View_Source
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative w-full max-w-[400px]"
          >
            <div className="relative z-10 bg-black border-4 border-white/10 p-2 shadow-2xl">
              <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-primary" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-primary" />
              
              <div className="relative aspect-[9/19] overflow-hidden bg-zinc-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={allScreenshots[index]}
                    src={allScreenshots[index]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 border border-primary/20 pointer-events-none" />
                <div className="absolute top-4 left-4 text-[8px] font-mono text-primary uppercase">
                  UI_Buffer_Active
                </div>
                <div className="absolute bottom-4 right-4 text-[8px] font-mono text-primary uppercase">
                  Frame: {index + 1} / 34
                </div>
              </div>
            </div>
            
            {/* Background decorative technical elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/5 rotate-45 hidden lg:block" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 border border-white/5 -rotate-12 hidden lg:block" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
