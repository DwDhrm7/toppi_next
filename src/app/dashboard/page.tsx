"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useCompanies } from "@/hooks/useCompanies";
import { useDevices } from "@/hooks/useDevices";
import { useLogsMobile } from "@/hooks/useLogsMobile";
import { Company } from "@/lib/api/company.service";
import { useRouter } from "next/navigation";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function DashboardScreen() {
  const router = useRouter();
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { devices, isLoading: devicesLoading } = useDevices();
  const { logs, isLoading: logsLoading } = useLogsMobile();
  
  const isLoading = companiesLoading || devicesLoading || logsLoading;

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Helper functions
  const getLatestLog = (deviceId: string) => {
     return logs.find(l => l.device_id === deviceId) || null;
  };
  
  const getDeviceStatus = (deviceId: string) => {
    const latest = getLatestLog(deviceId);
    if (!latest) return { text: "Belum ada data", color: "bg-gray-100 text-gray-600" };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const logDate = new Date(latest.created_at?.split(" ")[0] || "");
    logDate.setHours(0,0,0,0);
    const diffDays = (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    
    if (diffDays <= 3 && latest.ocr && latest.ocr !== "0" && Number(latest.voltage_battery1) >= 3.0) {
      return { text: "Sukses (Aktif)", color: "bg-emerald-100 text-emerald-700" };
    }
    return { text: "Gagal / Baterai Rendah", color: "bg-red-100 text-red-700" };
  };

  const getCompanyDevices = (companyName: string) => {
    return devices.filter(d => d.company?.name === companyName || String(d.company_id) === String(selectedCompany?.id));
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased text-gray-800">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        
        {/* Breadcrumb / Navigation */}
        <div className="mb-8 flex items-center gap-2 text-sm font-semibold text-gray-500">
          <button onClick={() => { setSelectedCompany(null); setSelectedDevice(null); }} className={`hover:text-[#F97316] transition-colors ${!selectedCompany ? 'text-[#F97316] font-bold' : ''}`}>
            Dashboard Perusahaan
          </button>
          {selectedCompany && (
            <>
              <span className="text-gray-300">/</span>
              <button onClick={() => setSelectedDevice(null)} className={`hover:text-[#F97316] transition-colors ${!selectedDevice ? 'text-[#F97316] font-bold' : ''}`}>
                {selectedCompany.name}
              </button>
            </>
          )}
          {selectedDevice && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-[#F97316] font-bold">Device {selectedDevice}</span>
            </>
          )}
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {Array(6).fill(0).map((_, i) => (
               <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 animate-pulse h-32"></div>
             ))}
           </div>
        ) : (
          <>
            {/* VIEW 1: Company List */}
            {!selectedCompany && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Daftar Perusahaan</h2>
                  <p className="text-gray-500 font-medium mt-1">Pilih perusahaan untuk melihat daftar alat TOPPI yang terpasang.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...companies]
                    .map(company => ({
                      ...company,
                      devCount: devices.filter(d => d.company?.name === company.name || String(d.company_id) === String(company.id)).length
                    }))
                    .sort((a, b) => b.devCount - a.devCount)
                    .map(company => {
                    const devCount = company.devCount;
                    return (
                      <div 
                        key={company.id} 
                        onClick={() => router.push(`/toppi-log?company=${encodeURIComponent(company.name || "")}`)}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 cursor-pointer hover:border-[#F97316]/50 hover:shadow-md transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{company.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{devCount} Perangkat Terpasang</p>
                      </div>
                    );
                  })}
                  {companies.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-200/60">
                      <p className="text-gray-500 font-medium">Belum ada perusahaan terdaftar.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Device List for Selected Company */}
            {selectedCompany && !selectedDevice && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Perangkat TOPPI di {selectedCompany.name}</h2>
                  <p className="text-gray-500 font-medium mt-1">Pilih salah satu perangkat untuk melihat log terakhirnya.</p>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-12">NO</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">DEVICE ID</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">STATUS PENGIRIMAN</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">KIRIMAN TERAKHIR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {getCompanyDevices(selectedCompany.name || "").map((device, idx) => {
                        const status = getDeviceStatus(device.device_id || "");
                        const latestLog = getLatestLog(device.device_id || "");
                        return (
                          <tr 
                            key={device.id} 
                            onClick={() => setSelectedDevice(device.device_id || null)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{device.device_id}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                {status.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-medium">
                              {latestLog?.created_at || "-"}
                            </td>
                          </tr>
                        );
                      })}
                      {getCompanyDevices(selectedCompany.name || "").length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                            Tidak ada perangkat untuk perusahaan ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 3: Device Detail */}
            {selectedCompany && selectedDevice && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Detail Perangkat: {selectedDevice}</h2>
                  <p className="text-gray-500 font-medium mt-1">Menampilkan data log terakhir yang dikirimkan oleh perangkat ini.</p>
                </div>
                
                {(() => {
                  const log = getLatestLog(selectedDevice);
                  if (!log) return (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-200/60">
                      <p className="text-gray-500 font-medium">Belum ada data log yang terekam untuk perangkat ini.</p>
                    </div>
                  );

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Image */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 lg:col-span-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">GAMBAR TERAKHIR</p>
                        {log.image ? (
                          <div className="w-full h-[240px] rounded-2xl overflow-hidden relative shadow-inner bg-black flex justify-center items-center">
                            <Zoom>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={log.image} alt="Water Meter Capture" className="object-contain w-full h-[240px]" />
                            </Zoom>
                          </div>
                        ) : (
                          <div className="w-full h-[240px] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <span className="text-xs font-medium">NO IMAGE</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Details Grid */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">INFORMASI DASAR</p>
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">DEVICE ID</p><p className="font-extrabold text-gray-900 text-sm">{log.device_id}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">PERUSAHAAN</p><p className="font-extrabold text-[#F97316] text-sm">{selectedCompany.name}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">WAKTU KIRIM</p><p className="font-extrabold text-gray-900 text-sm">{log.created_at}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">MODEL / TYPE</p><p className="font-extrabold text-gray-900 text-sm">{log.model || "Onda"}</p></div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">HASIL PEMBACAAN</p>
                          <div className="space-y-4">
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">OCR VALUE</p><p className="font-extrabold text-gray-900 text-sm">{log.ocr || "-"}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">OCR CONFIDENCE</p><p className="font-extrabold text-emerald-500 text-sm">{log.ocr_confidence ? (Number(log.ocr_confidence) * 100).toFixed(2) + "%" : "-"}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">FLOW RATE</p><p className="font-extrabold text-gray-900 text-sm">{log.volume_from_meter ? Number(log.volume_from_meter).toFixed(2) : "-"}</p></div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">BAT-1 (REGULAR)</p><p className="font-extrabold text-gray-900 text-sm">{log.voltage_battery1 ? Number(log.voltage_battery1).toFixed(2) : "-"}</p></div>
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">BAT-GATEWAY</p><p className="font-extrabold text-gray-900 text-sm">{log.battery_gateway ? Number(log.battery_gateway).toFixed(2) : "-"}</p></div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
