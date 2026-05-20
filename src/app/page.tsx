import { FloatingBackground } from "@/components/landing/FloatingBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DeveloperSection } from "@/components/landing/DeveloperSection";
import { Reviews } from "@/components/landing/Reviews";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen selection:bg-rose-100 selection:text-rose-900">
      <FloatingBackground />
      <Navbar />
      <Hero />
      <Features />
      <DeveloperSection />
      <Reviews />
      <FinalCTA />
      <Footer />
    </main>
  );
}
