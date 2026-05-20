import { AuthVisual } from "@/components/auth/AuthVisual";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F4F6] p-4 sm:p-8">
      <div className="w-full max-w-[1300px] min-h-[750px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex relative">
        
        {/* Left Panel - The Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 sm:px-16 lg:px-20 py-12 relative z-10">
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-[400px] mx-auto">
              {children}
            </div>
          </div>
          
          {/* Footer links */}
          <div className="flex justify-between items-center mt-12 text-xs font-medium text-gray-400">
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
            <div>© {new Date().getFullYear()} Kobara</div>
          </div>
        </div>
        
        {/* Right Panel - Immersive Visual */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#0B101E]">
          <AuthVisual />
        </div>
        
      </div>
    </div>
  );
}
