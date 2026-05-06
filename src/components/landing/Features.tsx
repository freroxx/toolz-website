import { motion } from "framer-motion";
import {
  Shield, Bell, Lock, FileText, Music, FileVideo, 
  Layout, Zap, Cpu, Scan, Focus, Fingerprint, Activity, Terminal
} from "lucide-react";

const BentoCard = ({ title, description, icon: Icon, className = "", accent = "primary" }: any) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.01 }}
    className={`glass group relative overflow-hidden rounded-[2.5rem] p-8 border-white/5 hover:border-white/20 transition-all duration-500 ${className}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${accent === 'primary' ? 'bg-primary' : 'bg-accent'}`} />
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
      accent === "primary"
        ? "bg-primary/10 text-primary shadow-[0_0_30px_rgba(124,58,237,0.1)]"
        : "bg-accent/10 text-accent shadow-[0_0_30px_rgba(14,165,233,0.1)]"
    }`}>
      <Icon className="w-7 h-7" />
    </div>
    
    <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight group-hover:text-gradient transition-all duration-300">
      {title}
    </h3>
    <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
      {description}
    </p>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-black">Precision Instruments</span>
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Hand-crafted <br />
            <span className="text-gradient">Utility.</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Toolz isn't just a collection of scripts. It's a cohesive system of 30+ tools built for stability and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Feature - Large */}
          <BentoCard 
            className="md:col-span-8 md:row-span-2"
            icon={Focus}
            title="Focus Flow"
            accent="primary"
            description="A deep-system integration that tracks app usage and scores productivity. Use accessibility-powered hard locks to reclaim your attention when you need it most. No fluff, just pure focus."
          />
          
          {/* Security - Medium */}
          <BentoCard 
            className="md:col-span-4"
            icon={Lock}
            title="Privacy Vault"
            accent="accent"
            description="Encrypted SQLCipher storage for passwords and notifications. Local-first, biometric-locked."
          />

          {/* Media - Medium */}
          <BentoCard 
            className="md:col-span-4"
            icon={Music}
            title="Media Engine"
            accent="primary"
            description="Media3-backed playback with local indexing and catalog management."
          />

          {/* Utils - Small Grid */}
          <BentoCard 
            className="md:col-span-4"
            icon={FileVideo}
            title="FFmpeg Core"
            accent="accent"
            description="Professional grade file conversion on-device."
          />
          <BentoCard 
            className="md:col-span-4"
            icon={Scan}
            title="Smart Vision"
            accent="primary"
            description="OCR and scanner tools that actually work."
          />
          <BentoCard 
            className="md:col-span-4"
            icon={Activity}
            title="Sensors"
            accent="accent"
            description="Real-time data from every sensor your device has."
          />
          
          {/* System - Large Horizontal */}
          <BentoCard 
            className="md:col-span-8"
            icon={Terminal}
            title="System Native"
            accent="primary"
            description="Built with Jetpack Compose and Hilt, Toolz integrates with Autofill, Quick Settings, and App Widgets to feel like a part of your OS, not an outsider."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
