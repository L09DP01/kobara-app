import { signup } from '../actions'
import Link from 'next/link'
import { ArrowRight, Store } from 'lucide-react'

export default function RegisterPage(props: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-500 mb-8">Start accepting MonCash payments in minutes.</p>

          <form action={signup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="business_name">
                Business Name
              </label>
              <input 
                id="business_name"
                name="business_name"
                type="text" 
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="Acme Corp"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input 
                id="password"
                name="password"
                type="password" 
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-2">Must be at least 8 characters long.</p>
            </div>

            <button 
              type="submit"
              className="w-full bg-black text-white rounded-lg px-4 py-2.5 font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              Create account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
