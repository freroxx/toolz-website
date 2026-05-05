import { Button } from "@/components/ui/button";
import { Download, Github, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const heroScreenshots = [
  "https://i.ibb.co/SDwBvkzW/Screenshot-20260504-201707-Toolz.jpg",
  "https://i.ibb.co/JRm38F2k/Screenshot-20260504-201637-Toolz.jpg",
  "https://i.ibb.co/VW9YRJCS/Screenshot-20260504-201525-Toolz.jpg",
  "https://i.ibb.co/hR44MRvC/Screenshot-20260504-201429-Toolz.jpg",
  "https://i.ibb.co/V0rhMPbT/Screenshot-20260504-201424-Toolz.jpg",
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroScreenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[10px] sm:text-xs font-semibold text-accent mb-8 tracking-[0.2em] uppercase border-accent/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Your device, fully orchestrated
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black leading-[1.1] mb-8 tracking-tight"
          >
            The tools you <br />
            <span className="text-gradient">actually use.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Toolz is a modern Android toolkit that brings productivity, media, PDF, sensor, privacy, and system utilities into one <span className="text-foreground font-medium">polished experience</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button variant="hero" size="xl" className="w-full sm:w-auto rounded-full group shadow-2xl shadow-primary/20" asChild>
              <a href="https://github.com/freroxx/toolz/releases" target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Download APK
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto rounded-full border-white/10" asChild>
              <a href="https://github.com/freroxx/toolz" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
              <img alt="Latest release" src="https://img.shields.io/github/v/release/freroxx/toolz?display_name=tag&color=7C3AED&labelColor=1F2937" className="h-5" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Android 12+
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              30+ Tools
            </div>
          </motion.div>
        </div>

        {/* Dynamic Rotating Screenshots */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 relative max-w-6xl mx-auto"
        >
          <div className="relative z-10 glass rounded-[2.5rem] p-3 glow-primary shadow-2xl overflow-hidden">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[16/9] bg-black/40">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex gap-4 sm:gap-8 items-center">
                  <AnimatePresence mode="wait">
                    {[
                      (index - 1 + heroScreenshots.length) % heroScreenshots.length,
                      index,
                      (index + 1) % heroScreenshots.length
                    ].map((idx, i) => (
                      <motion.div
                        key={`${idx}-${i}`}
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: i === 1 ? 1 : 0.4, x: 0, scale: i === 1 ? 1.1 : 0.9 }}
                        exit={{ opacity: 0, x: -20, scale: 0.8 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`w-24 sm:w-40 md:w-56 aspect-[9/19] rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${i === 1 ? 'z-30 -translate-y-4' : 'z-10'}`}
                      >
                        <img src={heroScreenshots[idx]} className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
