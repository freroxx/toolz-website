import { motion } from "framer-motion";
import {
  Calendar, ListChecks, Footprints, Bot, Music, FileText,
  Sparkles, ScanEye, Shield, Wrench,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Calendar",
    description: "Your best daily-driver for upcoming events with AI to help you manage your future time.",
    accent: "primary",
  },
  {
    icon: ListChecks,
    title: "Task Flow",
    description: "Manage your to-do list with priority index, sub-objectives, temporal limits and more.",
    accent: "accent",
  },
  {
    icon: Footprints,
    title: "Step Counter",
    description: "Track your fitness activity live on Toolz.",
    accent: "primary",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Built-in AI agents — Gemini, Groq, ChatGPT, Claude — including free & custom API keys.",
    accent: "accent",
  },
  {
    icon: Music,
    title: "Music Player",
    description: "An offline music player with the best Material 3 design that adapts to your preferences.",
    accent: "primary",
  },
  {
    icon: FileText,
    title: "Notepad",
    description: "A clean, modern, highly customizable notepad experience.",
    accent: "accent",
  },
  {
    icon: Sparkles,
    title: "AI Features",
    description: "AI manages events, detects distractions in Focus Flow, summarizes notes & PDFs, enhanced OCR.",
    accent: "primary",
  },
  {
    icon: ScanEye,
    title: "Smart Vision (OCR)",
    description: "Extract text from PDFs. Point your camera at a whiteboard or schedule and Toolz builds your calendar instantly.",
    accent: "accent",
  },
  {
    icon: Shield,
    title: "Focus Flow",
    description: "Smart app usage info boosted by AI that limits distractions for a more productive you.",
    accent: "primary",
  },
  {
    icon: Wrench,
    title: "30+ Tools",
    description: "Unit converter, timer, pomodoro, password gen, calculator, QR scanner, compass, ruler, and much more.",
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
          <span className="text-xs uppercase tracking-widest text-accent font-medium">Features</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3">
            Everything you need,{" "}
            <span className="text-gradient">one app.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Toolz packs 30+ powerful tools into a single, beautifully designed Android app.
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
