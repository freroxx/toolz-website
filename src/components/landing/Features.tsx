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
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Features = () => {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-accent font-medium">Standout Features</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3">
            Everything you need,{" "}
            <span className="text-gradient">one app.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Toolz packs 30+ powerful tools into a single, beautifully designed Android app built with Jetpack Compose.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 group cursor-default"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  feature.accent === "primary"
                    ? "bg-primary/15 text-primary"
                    : "bg-accent/15 text-accent"
                }`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
