import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Terminal, Shield, Activity, Cpu, Zap } from "lucide-react";

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

const ShowcaseItem = ({ group, index, total }: any) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex(prev => (prev + 1) % group.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [group.images.length]);

  return (
    <motion.div 
      ref={container}
      style={{ opacity, scale }}
      className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 min-h-[70vh] py-20"
    >
      <div className="flex-1 order-2 lg:order-1">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 border border-primary flex items-center justify-center text-primary">
            <group.icon className="w-6 h-6" />
          </div>
          <span className="text-technical text-primary">SYS_NODE_0{index + 1}</span>
        </div>
        <h3 className="text-huge font-black uppercase mb-8">
          {group.title}<span className="text-primary">_</span>
        </h3>
        <p className="text-xl font-mono text-white/50 leading-relaxed max-w-xl">
          {group.description}
        </p>
        
        <div className="mt-12 grid grid-cols-2 gap-4">
          {group.specs.map((spec: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-technical text-white/30">
              <div className="w-1 h-1 bg-primary" />
              {spec}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 order-1 lg:order-2 w-full max-w-[400px]">
        <motion.div style={{ y }} className="relative">
          <div className="bg-black border-4 border-white/10 p-2 shadow-2xl relative">
            <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-primary" />
            <div className="relative aspect-[9/19] overflow-hidden bg-zinc-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={group.images[imgIndex]}
                  src={group.images[imgIndex]}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
                />
              </AnimatePresence>
              <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur px-2 py-1 text-[8px] font-mono text-primary">
                STREAM_ACTIVE: {imgIndex + 1}
              </div>
            </div>
          </div>
          {/* Decorative Technical elements */}
          <div className="absolute -bottom-8 -left-8 text-[10px] font-mono text-white/10 uppercase vertical-text hidden lg:block">
            Buffer_Verification_Protocol_Active
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Showcase = () => {
  const groups = [
    {
      title: "Tactical_Control",
      icon: Activity,
      description: "A high-density dashboard engineered for instant operational response. Every tool is one tap away.",
      specs: ["LOW_LATENCY", "COMPOSE_UI", "HILT_DI", "FLUID_STATE"],
      images: allScreenshots.slice(0, 12)
    },
    {
      title: "Hardened_Vault",
      icon: Shield,
      description: "Zero-knowledge encryption for your most sensitive data. SQLCipher implementation with biometric gating.",
      specs: ["AES_256_GCM", "BIOMETRIC_V2", "LOCAL_ONLY", "AUDITABLE"],
      images: allScreenshots.slice(12, 24)
    },
    {
      title: "Media_Engine",
      icon: Cpu,
      description: "Professional-grade FFmpeg processing and high-fidelity Media3 playback for any operational format.",
      specs: ["FFMPEG_6.0", "MEDIA3_STABLE", "VLC_BACKEND", "METADATA_EXT"],
      images: allScreenshots.slice(24)
    }
  ];

  return (
    <section id="showcase" className="relative py-32 bg-black overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col gap-32">
          {groups.map((group, i) => (
            <ShowcaseItem key={i} group={group} index={i} total={groups.length} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
