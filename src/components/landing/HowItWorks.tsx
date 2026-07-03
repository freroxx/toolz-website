import { motion } from "framer-motion";
import { Zap, Shield, Cpu, Code } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Core_Zero",
    description: "No background services. No trackers. Zero battery drain when not in use.",
  },
  {
    icon: Shield,
    title: "Secure_Node",
    description: "On-device SQLCipher encryption. Your data never touches a server.",
  },
  {
    icon: Cpu,
    title: "Engine_v2",
    description: "High-fidelity Media3 and Jetpack Compose 1.7 implementation.",
  },
  {
    icon: Code,
    title: "Open_Logic",
    description: "Fully auditable source code. Built for the community by developers.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 bg-zinc-950">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-primary" />
              <span className="text-technical text-primary">Protocol_Logic</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12">
              The <br />
              <span className="text-primary italic">Standard.</span>
            </h2>
            <p className="text-lg font-mono text-white/60 leading-relaxed max-w-xl mb-12">
              Toolz isn&apos;t just a collection of apps. It&apos;s a high-performance framework that redefines what a mobile utility can be.
            </p>
            
            <div className="border border-white/10 p-8 relative group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
              <div className="text-technical text-primary mb-4">Build_Log</div>
              <div className="text-2xl font-black uppercase mb-4 tracking-tight text-white/80">Production_Ready</div>
              <p className="text-sm font-mono text-white/40">
                Optimized for Android 12 through 15. Continuous integration testing on physical hardware for maximum stability.
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 border border-white/5">
            {reasons.map((reason, i) => (
              <div
                key={reason.title}
                className="p-10 bg-black group hover:bg-zinc-900 transition-all duration-300"
              >
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center mb-8 text-white/40 group-hover:text-primary group-hover:border-primary transition-all">
                  <reason.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">{reason.title}</h3>
                <p className="text-sm font-mono text-white/50 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
