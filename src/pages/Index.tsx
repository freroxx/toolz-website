import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Showcase from "@/components/landing/Showcase";
import Gallery from "@/components/landing/Gallery";
import Discord from "@/components/landing/Discord";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import DownloadDialog from "@/components/landing/DownloadDialog";

const Index = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar onDownloadClick={() => setDownloadOpen(true)} />
      <main className="relative">
        <Hero onDownloadClick={() => setDownloadOpen(true)} />
        <div className="relative z-10 bg-background">
          <Features />
          <Showcase />
          <Gallery />
          <HowItWorks />
          <CTA onDownloadClick={() => setDownloadOpen(true)} />
          <Discord />
        </div>
      </main>
      <Footer />
      <DownloadDialog open={downloadOpen} onOpenChange={setDownloadOpen} />
    </div>
  );
};

export default Index;
