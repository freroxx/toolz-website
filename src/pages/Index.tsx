import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Showcase from "@/components/landing/Showcase";
import Gallery from "@/components/landing/Gallery";
import Discord from "@/components/landing/Discord";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";
import StatusPill from "@/components/landing/StatusPill";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <main className="relative">
        <Hero />
        <div className="relative z-10 bg-background">
          <Features />
          <Showcase />
          <Gallery />
          <HowItWorks />
          <Discord />
        </div>
      </main>
      <StatusPill />
      <Footer />
    </div>
  );
};

export default Index;
