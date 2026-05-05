import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Showcase from "@/components/landing/Showcase";
import Gallery from "@/components/landing/Gallery";
import Discord from "@/components/landing/Discord";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <Gallery />
        <HowItWorks />
        <Discord />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
