import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-xs font-medium text-accent mb-6 tracking-wider uppercase">
              Your device, fully orchestrated.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            One fast home for the <br />
            <span className="text-gradient">tools you actually use.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Toolz is a modern Android toolkit that brings productivity, media, PDF, sensor, privacy, and system utilities into one polished app.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="lg" asChild>
              <a href="https://github.com/freroxx/toolz/releases" target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5" />
                Download for Android 12+
              </a>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <a href="https://github.com/freroxx/toolz" target="_blank" rel="noopener noreferrer">
                <Play className="w-5 h-5" />
                View on GitHub
              </a>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <img alt="Latest release" src="https://img.shields.io/github/v/release/freroxx/toolz?display_name=tag" className="h-5" />
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium text-[10px] uppercase">Android 12+</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-medium text-[10px] uppercase">30+ Tools</span>
            </div>
          </motion.div>
        </div>

        {/* Showcase screenshot instead of video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="glass rounded-2xl p-2 glow-primary overflow-hidden">
            <div className="relative rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden aspect-[16/9]">
              <img 
                src="/src/assets/tools-screenshot.png" 
                alt="Toolz App Interface" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=2070";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
