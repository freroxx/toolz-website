import { motion } from "framer-motion";
import settingsImg from "@/assets/settings-screenshot.png";
import toolsImg from "@/assets/tools-screenshot.png";

const showcaseItems = [
  {
    image: toolsImg,
    title: "A Real Daily Driver",
    description:
      "Toolz is designed for people who want one fast home for the tools they actually use. A polished dashboard with quick access, pinned tools, and a universal floating status pill keeps you productive.",
    label: "Experience",
    reverse: false,
  },
  {
    image: settingsImg,
    title: "Powerful & Integrated",
    description:
      "From Focus Flow usage analytics to a secure Password Vault with biometric unlock, Toolz leverages Android-native integrations like Autofill, Quick Settings tiles, and App Widgets.",
    label: "System Native",
    reverse: true,
  },
];

const Showcase = () => {
  return (
    <section id="showcase" className="relative py-28 overflow-hidden">
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10 space-y-28">
        {showcaseItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`flex flex-col ${
              item.reverse ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-12 md:gap-20`}
          >
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
                <img
                  src={item.image}
                  alt={item.title}
                  className="relative rounded-2xl w-[280px] md:w-[320px] shadow-2xl border border-white/5"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&q=80&w=1000";
                  }}
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-xs uppercase tracking-widest text-accent font-medium"
              >
                {item.label}
              </motion.span>
              <h3 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Showcase;
