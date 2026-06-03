"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useMqtt } from "@/hooks/useMqtt";

export default function MqttExportScreen() {
  const { exportCsv, isExporting } = useMqtt();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleExport = async () => {
    if (!dateFrom || !dateTo) {
      alert("Harap pilih Start Date dan End Date");
      return;
    }
    try {
      const blob = await exportCsv({ type: 'mqtt-log', filterBy: 'date', from: dateFrom, to: dateTo });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mqtt_export_${dateFrom}_to_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan export data");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Export Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F97316] uppercase tracking-widest">MQTT Counter</h2>
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Date</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Date</label>
                <div className="flex gap-2">
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" />
                  <button className="w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                  <button onClick={handleExport} disabled={isExporting} className="w-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
                    {isExporting ? (
                      <span className="text-[10px] font-bold">...</span>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 pb-4 flex items-center justify-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest">No Data Found!</p>
            </div>
          </div>
        </div>

        {/* Right Side: Stats */}
        <div className="space-y-6">
          
          <div className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl p-4 flex items-start gap-3">
            <svg className="h-5 w-5 text-[#F97316] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-sm text-[#E85D04] font-medium">
              MQTT EXPORT is a menu to export MQTT publish logs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-lg shadow-orange-200">
              <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-4">TTL. Device</p>
              <p className="text-5xl font-black text-white">0</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-3xl p-6 shadow-lg shadow-cyan-200">
              <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest mb-4">TTL. Data Sent</p>
              <p className="text-5xl font-black text-white">0</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
