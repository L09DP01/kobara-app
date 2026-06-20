import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { SixWays } from "@/components/landing/SixWays";
import { PayButton } from "@/components/landing/PayButton";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ApiProcessing } from "@/components/landing/ApiProcessing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background-color: #020B14 !important;
        }
      `}} />
      <main className="relative min-h-[100dvh] bg-[#020B14] selection:bg-[#FF4A1C] selection:text-white font-sans text-white">
      <Navbar />
      <Hero />
      <TrustedBy />
      <SixWays />
      <PayButton />
      <HowItWorks />
      <ApiProcessing />
      <CTA />
      <Footer />
    </main>
    </>
  );
}
