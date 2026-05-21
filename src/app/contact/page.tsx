import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingBackground } from "@/components/landing/FloatingBackground";
import { Mail, MessageCircle, MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact — Kobara",
  description: "Get in touch with the Kobara team. We're here to help.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen">
      <FloatingBackground />
      <Navbar />

      <section className="pt-40 pb-24 relative">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-sm font-bold text-kobara-red mb-6">
              Get in touch
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-kobara-primary tracking-tighter leading-[1.05] mb-4">
              We&apos;d love to hear<br />
              <span className="text-kobara-red">from you.</span>
            </h1>
            <p className="text-lg text-kobara-secondary font-medium max-w-xl mx-auto leading-relaxed">
              Have a question, need support, or want to partner with Kobara? Reach out and we&apos;ll get back to you quickly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact info */}
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "support@kobara.app", href: "mailto:support@kobara.app" },
                { icon: MessageCircle, label: "WhatsApp", value: "+509 4003 5664", href: "tel:+50940035664" },
                { icon: MapPin, label: "Location", value: "Port-au-Prince, Haïti", href: "#" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="flex items-center gap-5 p-6 bg-white/60 backdrop-blur-md border border-white/90 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-kobara-red shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-kobara-secondary font-semibold">{item.label}</div>
                    <div className="text-kobara-primary font-bold">{item.value}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-kobara-secondary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}

              <div className="p-6 bg-kobara-primary rounded-2xl text-white">
                <h3 className="font-bold text-lg mb-2">Business Hours</h3>
                <p className="text-white/70 font-medium leading-relaxed">
                  Monday – Friday: 8:00 AM – 6:00 PM (EST)<br />
                  Saturday: 9:00 AM – 1:00 PM (EST)<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            {/* Contact form */}
            <form className="bg-white/60 backdrop-blur-md border border-white/90 rounded-[24px] p-8 space-y-5" action="mailto:support@kobara.app" method="get" encType="text/plain">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-kobara-primary mb-2">First name</label>
                  <input name="firstname" type="text" placeholder="Jean" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-kobara-primary placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-kobara-red/30 focus:border-kobara-red transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-kobara-primary mb-2">Last name</label>
                  <input name="lastname" type="text" placeholder="Pierre" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-kobara-primary placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-kobara-red/30 focus:border-kobara-red transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-kobara-primary mb-2">Email address</label>
                <input name="email" type="email" placeholder="jean@example.com" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-kobara-primary placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-kobara-red/30 focus:border-kobara-red transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-kobara-primary mb-2">Subject</label>
                <select name="subject" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-kobara-primary font-medium focus:outline-none focus:ring-2 focus:ring-kobara-red/30 focus:border-kobara-red transition-all">
                  <option value="">Select a topic...</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales &amp; Pricing</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-kobara-primary mb-2">Message</label>
                <textarea name="body" rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-kobara-primary placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-kobara-red/30 focus:border-kobara-red transition-all resize-none" />
              </div>
              <button type="submit" className="w-full h-13 rounded-xl bg-kobara-primary hover:bg-slate-900 text-white font-bold text-[16px] transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2.5 shadow-xl shadow-kobara-primary/10">
                Send Message
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
