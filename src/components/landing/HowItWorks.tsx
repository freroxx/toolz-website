import { motion } from "framer-motion";
import { Zap, Shield, Cpu, Code } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Zero Bloat.",
    description: "Built for speed. No trackers, no ads, no background drain. Just the tools you need, instantly.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Shield,
    title: "Local First.",
    description: "Your data never leaves your device. Encryption is handled on-device with SQLCipher.",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: Cpu,
    title: "Native Power.",
    description: "Leverages the full power of Android's Media3, Jetpack Compose, and Hilt architectures.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Code,
    title: "Open Core.",
    description: "Transparent, auditable, and community-driven. Built by developers, for everyone.",
    color: "from-accent/20 to-accent/5",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-12 bg-accent" />
              <span className="text-xs uppercase tracking-[0.4em] text-accent font-black">Philosophy</span>
            </motion.div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10">
              Why <br />
              <span className="text-gradient">Toolz?</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl">
              Most toolkits are cluttered and slow. We went the other way—building a high-performance engine that respects your time and privacy.
            </p>
            
            <div className="mt-12 p-8 glass rounded-[2.5rem] border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="text-sm font-black uppercase tracking-widest text-primary mb-2">Build Status</div>
                <div className="text-3xl font-black mb-4 tracking-tight">Production Ready.</div>
                <p className="text-muted-foreground font-medium">
                  Currently at v1.0.7 with stable support for Android 12 through 15. Continuous updates and community-driven feature requests.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2.5rem] glass border-white/5 hover:border-white/20 transition-all duration-500 bg-gradient-to-br ${reason.color}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <reason.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">{reason.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
