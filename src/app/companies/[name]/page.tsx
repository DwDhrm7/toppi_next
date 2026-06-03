"use client";

import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useCompanies } from "@/hooks/useCompanies";
import { useDevices } from "@/hooks/useDevices";
import { useLogs } from "@/hooks/useLogs";

export default function CompanySummaryScreen() {
  const router = useRouter();
  const params = useParams();
  const companyName = decodeURIComponent(params.name as string);

  const { companies, isLoading: isLoadingCompanies } = useCompanies();
  const { devices } = useDevices();
  const { logs } = useLogs();

  const company = companies.find((c) => c.name === companyName);
  const companyDevices = devices.filter((d) => d.company?.name === companyName);
  const companyLogs = logs.filter((l) => l.company?.name === companyName);

  if (!company && !isLoadingCompanies) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center font-sans">
        <h1 className="text-2xl font-bold text-gray-800">Perusahaan tidak ditemukan</h1>
        <button onClick={() => router.push("/dashboard")} className="mt-4 px-6 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#E85D04]">Kembali ke Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased text-gray-800">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Summary Perusahaan</h1>
            <p className="text-sm font-semibold text-gray-500">{companyName}</p>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{company?.name || "Memuat..."}</h2>
              <span className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-100">
                {"AKTIF"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Perangkat</p>
              <p className="text-2xl font-black text-gray-800">{companyDevices.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Transmisi Log</p>
              <p className="text-2xl font-black text-gray-800">{companyLogs.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">No. Telepon</p>
              <p className="text-base font-bold text-gray-700">{company?.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat</p>
              <p className="text-base font-bold text-gray-700">{company?.address || "-"}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Devices Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 flex flex-col overflow-hidden h-[500px]">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Daftar Perangkat (TOPPI)</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-white sticky top-0 border-b border-gray-100 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Device ID</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nama</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {companyDevices.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">Tidak ada perangkat terdaftar</td></tr>
                  )}
                  {companyDevices.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">{d.device_id}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{d.name}</td>
                      <td className="px-6 py-4 text-gray-500">{d.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 flex flex-col overflow-hidden h-[500px]">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Riwayat Transmisi Data</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-white sticky top-0 border-b border-gray-100 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Device ID</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {companyLogs.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada transmisi data</td></tr>
                  )}
                  {companyLogs.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">{l.device_id}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{l.created_at}</td>
                      <td className="px-6 py-4">
                        {l.ocr 
                          ? <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#10B981]/10 text-[#10B981]">Berhasil</span>
                          : <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444]">Gagal</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
