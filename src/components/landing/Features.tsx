import { motion } from "framer-motion";
import {
  Shield, Bell, Lock, FileText, Music, FileVideo, 
  Layout, Zap, Cpu, Scan, Focus, Fingerprint, Activity, Terminal, Settings
} from "lucide-react";

const FeatureCard = ({ title, description, icon: Icon, className = "" }: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`utility-card group p-8 ${className}`}
  >
    <div className="flex items-start justify-between mb-8">
      <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300">
        <Icon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </div>
      <span className="text-technical text-white/10 group-hover:text-primary/40 transition-colors">
        MOD_{Math.floor(Math.random() * 90) + 10}
      </span>
    </div>
    
    <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors group-hover:animate-glitch">
      {title}
    </h3>
    <p className="text-sm font-mono text-white/40 leading-relaxed">
      {description}
    </p>
    
    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
      <div className="h-1 w-12 bg-white/5 group-hover:bg-primary transition-all duration-300" />
      <div className="text-[8px] font-mono text-white/10 uppercase group-hover:text-primary/40">Verified_Build</div>
    </div>
  </motion.div>
);

const Features = () => {
  const features = [
    { icon: Settings, title: "Highly_Custom", description: "Tailor every tool to your workflow. Modular interface design built for power users." },
    { icon: Zap, title: "100%_Free", description: "Zero ads. Zero trackers. Zero subscriptions. Pure open-source utility for the community." },
    { icon: Focus, title: "Focus_Flow", description: "Deep-system usage tracking with accessibility-powered app limits and distraction blocking." },
    { icon: Lock, title: "Privacy_Vault", description: "Encrypted SQLCipher storage for sensitive passwords and data. Device-local only." },
    { icon: Bell, title: "Notify_Archive", description: "Local searchable history for all system and app notifications. Never miss a ping." },
    { icon: FileVideo, title: "FFmpeg_Core", description: "Professional-grade on-device media conversion and processing. No cloud required." },
    { icon: Activity, title: "Sensor_Array", description: "Real-time telemetry from all available device hardware sensors. Live data stream." },
    { icon: Fingerprint, title: "Auth_Shield", description: "Biometric security layer integrated into all sensitive modules for maximum protection." },
    { icon: Terminal, title: "Native_Build", description: "Zero-bloat architecture using Jetpack Compose and Hilt. Optimized for Android 15." },
  ];

  return (
    <section id="features" className="relative py-32 bg-black">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-primary" />
              <span className="text-technical text-primary">Module_Manifest</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              The <br />
              <span className="text-primary italic">Toolkit.</span>
            </h2>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-technical text-white/20 mb-2">Build_Status</div>
            <div className="text-xl font-mono font-bold text-primary animate-pulse">BETA_v1.0.8</div>
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
