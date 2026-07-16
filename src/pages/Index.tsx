import { useEffect } from "react";
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
  useEffect(() => {
    // Advanced Scroll Reveal with staggered entries
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));

    // High-Precision Tactile Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      const targets = document.querySelectorAll(".tactile-feedback");
      targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        // Only track if mouse is near the element for performance
        const distance = Math.hypot(
          e.clientX - (rect.left + rect.width / 2),
          e.clientY - (rect.top + rect.height / 2)
        );
        
        if (distance < 500) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          (target as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
          (target as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary selection:text-black antialiased">
      <Navbar />
      <main className="relative">
        <Hero />
        <div className="relative z-10 bg-black">
          <div className="scroll-reveal">
            <Features />
          </div>
          <div className="scroll-reveal">
            <Showcase />
          </div>
          <div className="scroll-reveal">
            <HowItWorks />
          </div>
          <div className="scroll-reveal">
            <Gallery />
          </div>
          <div className="scroll-reveal">
            <Discord />
          </div>
        </div>
      </main>
      <StatusPill />
      <Footer />
    </div>
  );
};

export default Index;
