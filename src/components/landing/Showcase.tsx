import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap, Shield, Sparkles } from "lucide-react";

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
    title: "Daily Utility, Perfected.",
    label: "Experience",
    icon: Zap,
    description: "Toolz isn't just an app; it's a productivity hub. From the smart dashboard to pinned quick-actions, every interaction is designed to save you seconds.",
    images: allScreenshots.slice(0, 17)
  },
  {
    title: "Deep System Harmony.",
    label: "Integrations",
    icon: Shield,
    description: "Experience true Android integration. Biometric security, native Autofill services, and accessibility-powered focus locks that actually work.",
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
    <section id="showcase" className="relative py-32 overflow-hidden bg-background">
      <div className="container mx-auto px-4 relative z-10 space-y-48">
        {showcaseGroups.map((group, i) => (
          <div
            key={group.title}
            className={`flex flex-col ${
              i % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-16 md:gap-32`}
          >
            <div className="flex-1 flex justify-center">
              <div className="relative group">
                {/* Hand-crafted decorative frame */}
                <div className="absolute -inset-8 rounded-[4rem] bg-gradient-to-tr from-primary/10 to-accent/10 blur-3xl opacity-50" />
                <div className="relative glass rounded-[3.5rem] p-4 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] w-[300px] md:w-[360px]">
                  <div className="relative aspect-[9/19] rounded-[2.8rem] overflow-hidden bg-black/40">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={group.images[imageIndexes[i]]}
                        src={group.images[imageIndexes[i]]}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                </div>
                {/* Bespoke floating badge */}
                <motion.div 
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute -bottom-6 -right-6 w-20 h-20 glass rounded-3xl flex items-center justify-center shadow-2xl border-white/20"
                >
                  <Sparkles className="w-8 h-8 text-accent" />
                </motion.div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 justify-center md:justify-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <group.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-accent">
                    {group.label}
                  </span>
                </div>
                
                <h3 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
                  {group.title}
                </h3>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                  {group.description}
                </p>
                
                <div className="mt-12 flex justify-center md:justify-start gap-1.5 flex-wrap max-w-xs">
                  {group.images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-700 ${idx === imageIndexes[i] ? 'w-6 bg-primary' : 'w-1 bg-white/10'}`}
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
