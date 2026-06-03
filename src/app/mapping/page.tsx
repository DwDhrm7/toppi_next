"use client";

import Navbar from "@/components/layout/Navbar";

export default function MappingScreen() {
  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25L3.75 15m0 0L9 9.75M3.75 15h16.5M15 3.75L20.25 9m0 0L15 14.25M20.25 9H3.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Mapping</h1>
          <p className="text-gray-500 font-medium">Fitur pemetaan perangkat sedang dalam pengembangan.</p>
          <p className="text-gray-400 text-sm mt-1">Coming soon</p>
        </div>
      </main>
    </div>
  );
}
