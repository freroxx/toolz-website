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

const showcaseGroups = [
  {
    title: "A Real Daily Driver",
    label: "Experience",
    description: "Toolz is designed for people who want one fast home for the tools they actually use. A polished dashboard with quick access and pinned tools.",
    images: allScreenshots.slice(0, 17)
  },
  {
    title: "Powerful & Integrated",
    label: "System Native",
    description: "From Focus Flow usage analytics to a secure Password Vault with biometric unlock, Toolz leverages Android-native integrations seamlessly.",
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
    <section id="showcase" className="relative py-28 overflow-hidden">
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10 space-y-32">
        {showcaseGroups.map((group, i) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`flex flex-col ${
              i % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-12 md:gap-24`}
          >
            <div className="flex-1 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-primary/20 to-accent/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative glass rounded-[2.5rem] p-3 border-white/10 shadow-2xl w-[280px] md:w-[320px]">
                  <div className="relative aspect-[9/19] rounded-[2rem] overflow-hidden bg-black/20">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={group.images[imageIndexes[i]]}
                        src={group.images[imageIndexes[i]]}
                        alt={group.title}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                </div>
                {/* Decorative floating dots */}
                <div className="absolute -top-4 -right-4 w-12 h-12 glass rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: i % 2 !== 0 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-block px-4 py-1 rounded-full glass text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-6 border-accent/20">
                  {group.label}
                </span>
                <h3 className="text-4xl md:text-6xl font-black mt-3 mb-6 tracking-tight">
                  {group.title}
                </h3>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-md mx-auto md:mx-0">
                  {group.description}
                </p>
                
                <div className="mt-8 flex justify-center md:justify-start gap-1 flex-wrap">
                  {group.images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-500 ${idx === imageIndexes[i] ? 'w-4 bg-primary' : 'w-1 bg-white/10'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Showcase;
