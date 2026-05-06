import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Discord = () => {
  return (
    <section id="discord" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass rounded-[4rem] p-8 md:p-16 border-white/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-white/10 mb-8">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Community Hub</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-8">
                  Join the <br />
                  <span className="text-gradient">Orchestra.</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl mb-12">
                  Connect with thousands of power users, share your workflows, and help shape the future of Toolz.
                </p>
                <Button variant="hero" size="xl" className="rounded-2xl h-20 px-12 text-xl font-black shadow-2xl shadow-primary/40 group" asChild>
                  <a href="https://discord.gg/aAswRUerwh" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Join Discord
                  </a>
                </Button>
              </motion.div>
            </div>

            <div className="flex-1 w-full max-w-[400px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative glass rounded-[2.5rem] p-2 border-white/10 shadow-2xl overflow-hidden">
                  <iframe 
                    src="https://discord.com/widget?id=1483976991261724692&theme=dark" 
                    width="100%" 
                    height="500" 
                    allowTransparency={true} 
                    frameBorder="0" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="rounded-[2rem]"
                  ></iframe>
                </div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -left-6 glass-strong p-4 rounded-2xl shadow-xl border-white/10"
                >
                  <Sparkles className="w-6 h-6 text-accent" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Discord;
