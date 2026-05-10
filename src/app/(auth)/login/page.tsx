import { login } from '../actions'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'

export default function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  // Use a simple form for Server Actions
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your Kobara dashboard.</p>

          <form action={login} className="space-y-4">
            {/* The error message will need client-side logic to access searchParams properly in Next.js 15, or we can just ignore it for now or make it a Client Component wrapper if needed, but since it's a Server Component, wait searchParams is passed as props */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email address
              </label>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="you@company.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Forgot password?
                </a>
              </div>
              <input 
                id="password"
                name="password"
                type="password" 
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-black text-white rounded-lg px-4 py-2.5 font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-black hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
