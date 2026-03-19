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
              Next-Gen Android Toolkit
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Your mobile experience,{" "}
            <span className="text-gradient">fluidly Managed</span> by AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            The all-in-one Android toolkit for your daily needs — 30+ tools,
            AI-powered productivity, and a gorgeous Material 3 experience.
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
              <a href="#how-it-works">
                <Play className="w-5 h-5" />
                See how it works
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="glass rounded-2xl p-1 glow-primary">
            <div className="relative aspect-video rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center cursor-pointer hover:scale-110 transition-transform glow-primary">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                <span className="text-sm text-muted-foreground">App Trailer Coming Soon</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
