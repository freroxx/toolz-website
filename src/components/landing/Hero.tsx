import { Github, Terminal, Activity, Cpu, Heart, Zap, MousePointer2, Shield, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

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

const Hero = () => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = useCallback(() => {
    setIndex((prev) => (prev + 1) % allScreenshots.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) nextImage();
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered, nextImage]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24 bg-blueprint tactile-feedback">
      <div className="scanline" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-4 mb-10 border border-primary/20 bg-primary/5 px-4 py-2 hover:border-primary transition-colors cursor-default"
            >
              <div className="w-2 h-2 bg-primary animate-pulse" />
              <span className="text-technical text-primary uppercase tracking-[0.3em]">BETA // ANDROID_12+</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-huge font-black uppercase mb-12 group cursor-default"
            >
              <span className="inline-block group-hover:animate-glitch transition-all group-hover:text-primary">Toolz</span> <br />
              <span className="text-primary italic group-hover:animate-glitch group-hover:text-white transition-all">Orchestrated.</span>
            </motion.h1>

            <div className="flex flex-col gap-8 mb-16 max-w-2xl mx-auto lg:mx-0">
              <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-mono">
                High-precision utility suite for Android. <span className="text-primary font-black hover:text-white transition-colors cursor-default">100% FREE</span>, <span className="text-white font-black hover:text-primary transition-colors cursor-default">Zero Bloat</span>, and <span className="text-white font-black hover:text-primary transition-colors cursor-default">Zero AI Slop</span>.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-technical text-white/30">
                <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-default group">
                  <Shield className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  <span>Privacy_First</span>
                </div>
                <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-default group">
                  <Zap className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  <span>Zero_Trackers</span>
                </div>
                <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-default group">
                  <Cpu className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  <span>System_Native</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
            >
              <a href="https://github.com/freroxx/toolz/releases" className="btn-technical h-16 px-12 group">
                <span className="relative z-10">Fetch_v1.0.9_BETA</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <a href="https://github.com/freroxx/toolz" className="btn-outline-technical h-16 px-12 group">
                <span className="relative z-10">Source_Control</span>
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative w-full max-w-[400px]"
          >
            <div 
              className="relative z-10 bg-black border-4 border-white/10 p-2 shadow-2xl group cursor-pointer overflow-hidden tactile-feedback"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={nextImage}
            >
              <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-primary group-hover:w-full group-hover:h-full transition-all duration-700 opacity-50" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-primary group-hover:w-full group-hover:h-full transition-all duration-700 opacity-50" />
              
              <div className="relative aspect-[9/19] overflow-hidden bg-zinc-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={allScreenshots[index]}
                    src={allScreenshots[index]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                  <div className="bg-black/80 border border-primary/50 px-6 py-3 flex items-center gap-3">
                    <MousePointer2 className="w-4 h-4 text-primary animate-bounce" />
                    <span className="text-technical text-primary">Next_Buffer</span>
                  </div>
                </div>

                <div className="absolute top-4 left-4 text-[8px] font-mono text-primary uppercase animate-pulse">
                  UI_Buffer_Active
                </div>
                <div className="absolute bottom-4 right-4 text-[8px] font-mono text-primary uppercase">
                  Frame: {index + 1} // v1.0.9b
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
