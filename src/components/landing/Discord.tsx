import { MessageSquare, Users, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Discord = () => {
  const { ref, isInView } = useScrollReveal(0.2);

  return (
    <section id="discord" className="relative py-32 bg-black border-t border-white/10">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          className="border border-white/10 p-8 md:p-16 relative overflow-hidden group hover:border-primary/10 transition-colors duration-700"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45" />
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-8">
                <div className="w-10 h-10 border border-primary/20 flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-technical text-primary">Node_Connection</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10">
                Join the <br />
                <span className="text-primary italic">Network.</span>
              </h2>
              
              <p className="text-xl font-mono text-white/50 leading-relaxed max-w-xl mb-12">
                Connect with the global Toolz operator network. Share modules, report bugs, and shape the core build.
              </p>
              
              <a href="https://discord.gg/aAswRUerwh" className="btn-technical inline-flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                Initialize_Session
              </a>
            </motion.div>

            <motion.div
              className="flex-1 w-full max-w-[400px]"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="relative border-2 border-white/10 p-2 bg-zinc-900">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <iframe 
                  src="https://discord.com/widget?id=1483976991261724692&theme=dark" 
                  width="100%" 
                  height="500" 
                  allowTransparency={true} 
                  frameBorder="0" 
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Discord;
