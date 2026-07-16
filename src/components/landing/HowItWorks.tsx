import { Cpu, Shield, Zap, Terminal } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "100%_LOCAL",
    desc: "Your data never leaves your device. No cloud, no tracking, no exceptions."
  },
  {
    icon: Zap,
    title: "ZERO_BLOAT",
    desc: "Written in pure, high-performance code. Minimal battery drain, maximum speed."
  },
  {
    icon: Terminal,
    title: "OPEN_SOURCE",
    desc: "Fully auditable code. Built by the community, for the community."
  },
  {
    icon: Cpu,
    title: "PRO_UTILITY",
    desc: "No simplified menus. Real tools for real operators who know their system."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-black border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="text-technical text-primary mb-6">Core_Philosophy</div>
            <h2 className="text-6xl font-black uppercase tracking-tighter mb-12">
              Built for <br />
              <span className="text-primary">Operators_</span>
            </h2>
            <p className="text-xl font-mono text-white/40 leading-relaxed mb-12">
              Toolz isn't just another utility app. It's a high-precision toolkit designed for those who want absolute control over their Android environment.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/20 tactile-feedback group">
                <div className="w-12 h-12 flex items-center justify-center border border-primary/20 text-primary">1</div>
                <div className="text-sm font-mono uppercase tracking-widest text-white/60">Download_Beta_Build</div>
              </div>
              <div className="flex items-center gap-4 p-6 border border-white/5 tactile-feedback group">
                <div className="w-12 h-12 flex items-center justify-center border border-white/10 text-white/20">2</div>
                <div className="text-sm font-mono uppercase tracking-widest text-white/40">Initialize_Modules</div>
              </div>
              <div className="flex items-center gap-4 p-6 border border-white/5 tactile-feedback group">
                <div className="w-12 h-12 flex items-center justify-center border border-white/10 text-white/20">3</div>
                <div className="text-sm font-mono uppercase tracking-widest text-white/40">Command_Your_Device</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 border border-white/5">
            {principles.map((p, i) => (
              <div key={i} className="bg-black p-10 tactile-feedback group">
                <p.icon className="w-6 h-6 text-primary mb-8 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-black uppercase mb-4 group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-xs font-mono text-white/30 leading-relaxed group-hover:text-white/50 transition-colors">
                  {p.desc}
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
