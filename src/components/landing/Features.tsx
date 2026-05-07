import { motion } from "framer-motion";
import {
  Shield, Bell, Lock, FileText, Music, FileVideo, 
  Layout, Zap, Cpu, Scan, Focus, Fingerprint, Activity, Terminal
} from "lucide-react";

const FeatureCard = ({ title, description, icon: Icon, className = "" }: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`utility-card group p-8 ${className}`}
  >
    <div className="flex items-start justify-between mb-8">
      <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-technical text-white/20 group-hover:text-primary/40 transition-colors">
        ID_00{Math.floor(Math.random() * 9) + 1}
      </span>
    </div>
    
    <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
      {title}
    </h3>
    <p className="text-sm font-mono text-white/50 leading-relaxed">
      {description}
    </p>
    
    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
      <div className="h-1 w-12 bg-white/10 group-hover:bg-primary transition-all duration-300" />
      <div className="text-[8px] font-mono text-white/20 uppercase">Core_Module</div>
    </div>
  </motion.div>
);

const Features = () => {
  const features = [
    { icon: Focus, title: "Focus_Flow", description: "Deep-system usage tracking with accessibility-powered app limits." },
    { icon: Lock, title: "Privacy_Vault", description: "Encrypted SQLCipher storage for sensitive passwords and data." },
    { icon: Bell, title: "Notify_Archive", description: "Local searchable history for all system and app notifications." },
    { icon: FileText, title: "PDF_Precision", description: "OCR-powered document scanning and text extraction engine." },
    { icon: FileVideo, title: "FFmpeg_Core", description: "Professional-grade on-device media conversion and processing." },
    { icon: Music, title: "Audio_Node", description: "Native Media3 playback engine with high-fidelity local indexing." },
    { icon: Activity, title: "Sensor_Array", description: "Real-time telemetry from all available device hardware sensors." },
    { icon: Fingerprint, title: "Auth_Shield", description: "Biometric security layer integrated into all sensitive modules." },
    { icon: Terminal, title: "Native_Build", description: "Zero-bloat architecture using Jetpack Compose and Hilt." },
  ];

  return (
    <section id="features" className="relative py-32 bg-black">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-primary" />
              <span className="text-technical text-primary">Technical_Specifications</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Hard-Edge <br />
              Utility<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-technical text-white/20 mb-2">Build_Version</div>
            <div className="text-xl font-mono font-bold text-white/40">STABLE_v1.0.7</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-white/10">
          {features.map((feature, i) => (
            <FeatureCard 
              key={i}
              {...feature}
              className="border-r border-b border-white/10"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
