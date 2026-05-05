import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Sparkles } from "lucide-react";

const Discord = () => {
  return (
    <section id="community" className="relative py-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-accent mb-6">
              <Users className="w-3 h-3" />
              Community Driven
            </span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Join the <span className="text-gradient">Community.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Get real-time support, suggest new features, and connect with other Toolz users. Our Discord is the heart of the project.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="glass p-4 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold">Early Access</h4>
                  <p className="text-xs text-muted-foreground">Try beta features before anyone else.</p>
                </div>
              </div>
              <div className="glass p-4 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-accent" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold">Direct Feedback</h4>
                  <p className="text-xs text-muted-foreground">Talk directly with the developers.</p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
              <a href="https://discord.gg/aAswRUerwh" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-5 h-5" />
                Join Discord Server
              </a>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-strong rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <iframe 
                  src="https://discord.com/widget?id=1483976991261724692&theme=dark" 
                  width="350" 
                  height="500" 
                  allowTransparency={true} 
                  frameBorder="0" 
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="max-w-full"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Discord;
