import Link from 'next/link'
import { MailCheck, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: "Verify your email — Kobara",
  description: "Check your email to activate your account.",
};

export default async function VerifyEmailPage(props: { searchParams: Promise<{ email?: string }> }) {
  const searchParams = await props.searchParams;
  const email = searchParams.email || 'your email address';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out text-center">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-kobara-red/10 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-kobara-red/20 blur-xl rounded-full animate-pulse" />
          <MailCheck className="w-10 h-10 text-kobara-red relative z-10" />
        </div>
      </div>

      <h1 className="text-3xl font-black text-kobara-primary tracking-tight mb-4">
        Check your email
      </h1>
      
      <p className="text-kobara-secondary font-medium leading-relaxed mb-8 max-w-sm mx-auto">
        We've sent a verification link to <span className="text-kobara-primary font-bold">{email}</span>. Please click the link to activate your account.
      </p>

      <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 mb-8 text-sm text-kobara-secondary font-medium">
        Didn't receive the email? Check your spam folder or try resending.
      </div>

      <div className="space-y-4">
        <Link 
          href="/login"
          className="w-full bg-white border border-gray-200 text-kobara-primary rounded-xl px-4 py-4 font-bold text-[15px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
