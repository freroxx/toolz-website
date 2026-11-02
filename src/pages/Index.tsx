import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ToolCatalog from "@/components/landing/ToolCatalog";
import DownloadzSection from "@/components/landing/DownloadzSection";
import Gallery from "@/components/landing/Gallery";
import HowItWorks from "@/components/landing/HowItWorks";
import CatalogSection from "@/components/landing/CatalogSection";
import NewsSection from "@/components/landing/NewsSection";
import Discord from "@/components/landing/Discord";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import LazyDownloadDialog from "@/components/landing/LazyDownloadDialog";

const Index = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface font-sans selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar onDownloadClick={() => setDownloadOpen(true)} />
      <main>
        <Hero onDownloadClick={() => setDownloadOpen(true)} />
        <ToolCatalog />
        <DownloadzSection onDownloadClick={() => setDownloadOpen(true)} />
        <Gallery />
        <HowItWorks />
        <CatalogSection />
        <NewsSection />
        <Discord />
        <CTA onDownloadClick={() => setDownloadOpen(true)} />
      </main>
      <Footer />
      <LazyDownloadDialog open={downloadOpen} onOpenChange={setDownloadOpen} />
    </div>
  );
};

export default Index;
