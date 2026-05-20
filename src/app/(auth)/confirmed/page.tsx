import Link from 'next/link'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export const metadata = {
  title: "Email Confirmed — Kobara",
  description: "Your email has been successfully confirmed.",
};

export default function ConfirmedPage() {
  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-1000 ease-out text-center">
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full animate-pulse" />
          <ShieldCheck className="w-12 h-12 text-green-500 relative z-10" />
        </div>
      </div>

      <h1 className="text-3xl font-black text-kobara-primary tracking-tight mb-4">
        Account verified
      </h1>
      
      <p className="text-kobara-secondary font-medium leading-relaxed mb-10 max-w-sm mx-auto">
        Your email has been successfully verified. Your account is now active and ready to accept payments.
      </p>

      <Link 
        href="/dashboard"
        className="w-full bg-gradient-to-r from-kobara-red to-kobara-orange text-white rounded-xl px-4 py-4 font-bold text-[15px] hover:shadow-lg hover:shadow-kobara-red/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}
