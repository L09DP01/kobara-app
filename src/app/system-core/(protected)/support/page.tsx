export default async function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-b border-slate-800 pb-4">SUPPORT TICKETS</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-300 mb-2">Ticketing System</h2>
        <p className="text-slate-500 max-w-md">
          This module is currently under construction. It will allow you to manage support tickets created by merchants directly from this secure interface.
        </p>
      </div>
    </div>
  );
}
