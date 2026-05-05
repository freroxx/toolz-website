import { motion } from "framer-motion";
import { ShieldCheck, Zap, Layout, Terminal } from "lucide-react";

const reasons = [
  {
    icon: Layout,
    step: "01",
    title: "All-in-One Dashboard",
    description: "One app for timers, notes, PDFs, media, utilities, sensors, and device tools. No more folders full of single-purpose apps.",
  },
  {
    icon: Zap,
    step: "02",
    title: "Smart AI Integration",
    description: "Optional AI where it actually helps, including assistant flows, smart matching, and document summaries.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Privacy & Local First",
    description: "Strong local capabilities for vaults, clipboard history, PDF work, and sensors. Your data stays where it belongs.",
  },
  {
    icon: Terminal,
    step: "04",
    title: "Developer Friendly",
    description: "Open source and built with the latest tech stack: Kotlin 2.1.10, Jetpack Compose, and Hilt.",
    code: `# Build from Source
./gradlew assembleDebug`,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-28 overflow-hidden">
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-widest text-accent font-medium">Why Toolz</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3">
            Designed to be your{" "}
            <span className="text-gradient">daily driver.</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-16">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row items-start gap-8"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center glow-primary">
                  <reason.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-xs font-mono text-accent tracking-wider">REASON {reason.step}</span>
                <h3 className="text-xl font-bold mt-1 mb-2">{reason.title}</h3>
                <p className="text-muted-foreground mb-4">{reason.description}</p>
                {reason.code && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="glass rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto">
                      <div className="flex gap-1.5 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                      </div>
                      <pre className="text-muted-foreground">
                        <code>{reason.code}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
