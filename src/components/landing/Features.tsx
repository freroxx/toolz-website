import { 
  Shield, Zap, Cpu, Lock, Smartphone, 
  Terminal, HardDrive, Bell, Settings, 
  Eye, RefreshCw, Layers
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Focus_Flow",
    desc: "Advanced firewall and DNS blocking. Zero trackers, zero ads, zero bloat.",
    tag: "Security"
  },
  {
    icon: Lock,
    title: "Vault_Core",
    desc: "Encrypted password and notification storage. 100% local, 100% private.",
    tag: "Privacy"
  },
  {
    icon: RefreshCw,
    title: "FFmpeg_Engine",
    desc: "Professional-grade media conversion. Powered by system-native binaries.",
    tag: "Utility"
  },
  {
    icon: HardDrive,
    title: "Storage_Ops",
    desc: "Deep system cleaning and file orchestration. Reclaim every megabyte.",
    tag: "System"
  },
  {
    icon: Bell,
    title: "Ghost_Notify",
    desc: "Intercept and archive every notification. Never miss a deleted message.",
    tag: "Intercept"
  },
  {
    icon: Settings,
    title: "Custom_Kernel",
    desc: "Highly customizable UI and behavior. Built for power users and operators.",
    tag: "Core"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-32 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <div className="text-technical text-primary mb-4">Module_Inventory</div>
            <h2 className="text-6xl font-black uppercase tracking-tighter">
              Precision <span className="text-white/20">Modules_</span>
            </h2>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-technical text-white/20 mb-2">Build_Status</div>
            <div className="text-xl font-mono font-bold text-primary animate-pulse">BETA_v1.0.9</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-black p-12 tactile-feedback group hover:z-10 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="p-4 bg-primary/5 border border-primary/20 group-hover:border-primary/50 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="text-[10px] font-mono text-white/20 group-hover:text-primary/40 transition-colors">
                  [MOD_{String(i + 1).padStart(2, '0')}]
                </span>
              </div>
              
              <div className="mb-6">
                <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mb-2 block">
                  {feature.tag}
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
              </div>
              
              <p className="text-white/40 font-mono text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                {feature.desc}
              </p>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-white/20 uppercase">Status: Ready</span>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
