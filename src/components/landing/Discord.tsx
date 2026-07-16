import { MessageSquare, Users } from "lucide-react";

const Discord = () => {
  return (
    <section id="discord" className="py-32 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="bg-zinc-950 border border-white/5 p-16 tactile-feedback group flex flex-col justify-between">
            <div>
              <div className="text-technical text-primary mb-8">Community_Node</div>
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-none">
                Join the <br />
                <span className="text-primary">Network_</span>
              </h2>
              <p className="text-lg font-mono text-white/30 leading-relaxed mb-12">
                Connect with other operators, share module configurations, and get direct support from the development core.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://discord.gg/aAswRUerwh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-technical h-16 px-12 group/btn"
              >
                <MessageSquare className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                Connect_Now
              </a>
              <div className="flex items-center gap-4 px-8 border border-white/10 text-technical text-white/20">
                <Users className="w-4 h-4" />
                <span>Active_Nodes: Online</span>
              </div>
            </div>
          </div>

          <div className="bg-black border border-white/5 overflow-hidden relative group min-h-[500px]">
            <div className="absolute inset-0 bg-blueprint opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <iframe 
                src="https://discord.com/widget?id=1483976991261724692&theme=dark" 
                width="100%" 
                height="100%" 
                allowTransparency={true} 
                frameBorder="0" 
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="relative z-10 border border-white/10 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute top-4 right-4 z-20">
              <div className="flex items-center gap-2 bg-black/80 border border-primary/20 px-3 py-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-mono text-primary uppercase">Live_Widget</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Discord;
