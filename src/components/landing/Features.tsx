import { motion } from "framer-motion";
import {
  Shield, Bell, Lock, FileText, Music, FileVideo, 
  Layout, Zap, Cpu, Scan, Focus, Fingerprint
} from "lucide-react";

const features = [
  {
    icon: Focus,
    title: "Focus Flow",
    description: "Track app usage, score productivity, and enforce app limits with accessibility-powered hard locks.",
    accent: "primary",
  },
  {
    icon: Lock,
    title: "Password Vault",
    description: "Encrypted SQLCipher-backed database with biometric unlock, Autofill, and vault health checks.",
    accent: "accent",
  },
  {
    icon: Bell,
    title: "Notification Vault",
    description: "Capture selected notifications into a searchable local archive with app-level controls.",
    accent: "primary",
  },
  {
    icon: FileText,
    title: "PDF Reader & OCR",
    description: "Scan documents with OCR, extract text, and support AI-assisted summaries.",
    accent: "accent",
  },
  {
    icon: FileVideo,
    title: "File Converter",
    description: "FFmpeg-backed processing for video, audio, image, and PDF conversion workflows.",
    accent: "primary",
  },
  {
    icon: Music,
    title: "Music Player",
    description: "Local playback with lyrics, Media3 controls, and a catalog download flow.",
    accent: "accent",
  },
  {
    icon: Layout,
    title: "Widgets & Tiles",
    description: "Homescreen widgets and quick settings tiles for flashlight, notes, steps, and more.",
    accent: "primary",
  },
  {
    icon: Zap,
    title: "Smart Flow & AI",
    description: "AI Assistant with configurable providers and smart dashboard search matching your intent.",
    accent: "accent",
  },
  {
    icon: Scan,
    title: "Sensors & Vision",
    description: "Scanner, Light Meter, Compass, Bubble Level, Speedometer, and Altimeter.",
    accent: "primary",
  },
  {
    icon: Fingerprint,
    title: "Privacy First",
    description: "Strong local capabilities for vaults, clipboard history, and measurement tools.",
    accent: "accent",
  },
  {
    icon: Cpu,
    title: "System Utilities",
    description: "Device Info, Battery Info, File Cleaner, and random generation tools.",
    accent: "primary",
  },
  {
    icon: Shield,
    title: "30+ Precision Instruments",
    description: "A single Compose-first experience combining all the tools you need daily.",
    accent: "accent",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Features = () => {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-accent font-black mb-4 block">Core Toolkit</span>
          <h2 className="text-4xl md:text-7xl font-black mt-3 tracking-tight">
            Everything you need, <br />
            <span className="text-gradient">one powerhouse.</span>
          </h2>
          <p className="text-muted-foreground mt-8 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Toolz packs 30+ precision instruments into a single, beautifully designed Android app built with <span className="text-foreground font-semibold">Jetpack Compose</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="glass rounded-[2rem] p-8 group cursor-default border-white/5 hover:border-white/20 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-12 ${
                  feature.accent === "primary"
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                    : "bg-accent/10 text-accent shadow-[0_0_20px_rgba(14,165,233,0.2)]"
                }`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all duration-300">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
