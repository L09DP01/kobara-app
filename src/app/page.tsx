import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ApiFeatures } from "@/components/landing/ApiFeatures";
import { DeveloperSection } from "@/components/landing/DeveloperSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { FloatingBackground } from "@/components/landing/FloatingBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <FloatingBackground />
      <Navbar />
      
      <main>
        <Hero />
        <HowItWorks />
        <ApiFeatures />
        <DeveloperSection />
        <PricingPreview />
        <FinalCTA />
      </main>

      <footer className="py-20 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kobara-red to-kobara-orange flex items-center justify-center text-white font-bold">
                  K
                </div>
                <span className="text-xl font-bold text-kobara-primary">Kobara</span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                Modern payment infrastructure for digital businesses in Haiti. Accept MonCash payments securely via API, SDKs, and payment links.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-kobara-primary mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li><a href="/developers" className="hover:text-kobara-primary">Developers</a></li>
                <li><a href="/pricing" className="hover:text-kobara-primary">Pricing</a></li>
                <li><a href="/docs" className="hover:text-kobara-primary">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-kobara-primary mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li><a href="/contact" className="hover:text-kobara-primary">Contact</a></li>
                <li><a href="/terms" className="hover:text-kobara-primary">Terms</a></li>
                <li><a href="/privacy" className="hover:text-kobara-primary">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-slate-200/60 text-center text-sm font-bold text-slate-400">
            © {new Date().getFullYear()} Kobara.app — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
