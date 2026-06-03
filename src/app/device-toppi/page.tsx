"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useDevices } from "@/hooks/useDevices";
import { useCompanies } from "@/hooks/useCompanies";

function DeviceContent() {
  const { devices, isLoading, isCreating, isDeleting, deleteDevice, createDevice } = useDevices();
  const { companies } = useCompanies();
  const searchParams = useSearchParams();
  const companyQuery = searchParams.get("company");
  const router = useRouter();
  
  const filteredDevices = companyQuery ? devices.filter(d => d.company?.name === companyQuery) : devices;

  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({ deviceId: "", name: "", type: "GTWY(0)", company_id: "" });

  const handleDelete = async () => {
    if (selectedId && confirm("Apakah Anda yakin ingin menghapus perangkat ini?")) {
      await deleteDevice(selectedId);
      setSelectedId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.deviceId || !newDevice.name) return;
    
    await createDevice({
      device_id: newDevice.deviceId,
      name: newDevice.name,
      type: newDevice.type,
      company_id: newDevice.company_id || "1",
      version: 1,
      connectivity: "N/A",
      production_no: "1",
      serial_no: `SN-NEW-${Math.floor(Math.random() * 1000)}`,
      floating: "0",
      phone: "-",
    });
    setIsModalOpen(false);
    setNewDevice({ deviceId: "", name: "", type: "GTWY(0)", company_id: "" });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 flex flex-col overflow-hidden">
          
          <div className="px-6 lg:px-8 py-5 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#F97316]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Perangkat TOPPI</h2>
              </div>
              {companyQuery && (
                <div className="mt-2 text-sm text-gray-500 font-medium">
                  Menampilkan data untuk: <span className="font-bold text-[#F97316]">{companyQuery}</span>
                  <a href="/device-toppi" className="ml-3 text-indigo-500 hover:underline text-xs bg-indigo-50 px-2 py-1 rounded">Reset Filter</a>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors">
                + CREATE
              </button>
              <button className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-xl transition-colors">
                IMPORT
              </button>
              <button className={`flex-1 lg:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${selectedId ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
                DETAIL
              </button>
              <button className={`flex-1 lg:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${selectedId ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
                EDIT
              </button>
              <button onClick={handleDelete} disabled={!selectedId || isDeleting} className={`flex-1 lg:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${selectedId ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'} disabled:opacity-50`}>
                {isDeleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[1400px]">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  {["NO", "DEVICE ID", "NAME", "COMPANY", "TYPE", "FIRMWARE", "CONNECTIVITY", "P/N", "S/N", "FLOATING (COMMA)", "PHONE", "CREATED AT"].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 w-6 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-8 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-10 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))
                ) : filteredDevices.length === 0 ? (
                  <tr><td colSpan={12} className="px-6 py-12 text-center text-gray-400 font-medium">Tidak ada perangkat ditemukan.</td></tr>
                ) : (
                  filteredDevices.map((row, index) => (
                    <tr key={row.id} onClick={() => setSelectedId(row.id === selectedId ? null : row.id)} 
                        className={`cursor-pointer transition-colors ${selectedId === row.id ? "bg-orange-50/50 border-l-4 border-l-[#F97316]" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-5 text-gray-400 font-medium">{index + 1}</td>
                      <td className="px-6 py-5 font-bold text-gray-800">{row.device_id}</td>
                      <td className="px-6 py-5 text-gray-700 font-semibold">{row.name}</td>
                      <td 
                        className="px-6 py-5 text-[#F97316] font-bold cursor-pointer hover:underline"
                        onClick={(e) => { e.stopPropagation(); router.push(`/companies/${encodeURIComponent(row.company?.name || "")}`); }}
                      >
                        {row.company?.name || "-"}
                      </td>
                      <td className="px-6 py-5 text-gray-500">{row.type}</td>
                      <td className="px-6 py-5 text-gray-500">{row.version}</td>
                      <td className="px-6 py-5 text-gray-500">{row.connectivity}</td>
                      <td className="px-6 py-5 text-gray-500">{row.production_no}</td>
                      <td className="px-6 py-5 text-gray-500">{row.serial_no}</td>
                      <td className="px-6 py-5 text-gray-500">{row.floating}</td>
                      <td className="px-6 py-5 text-gray-500">{row.phone}</td>
                      <td className="px-6 py-5 text-gray-500">{row.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 lg:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
            <span className="text-xs font-semibold text-gray-500">Menampilkan {devices.length} data perangkat</span>
          </div>

        </div>

      </main>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Perangkat Baru</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Device ID</label>
                <input required type="text" value={newDevice.deviceId} onChange={e => setNewDevice({...newDevice, deviceId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" placeholder="e.g. 0000000099" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Nama Perangkat</label>
                <input required type="text" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" placeholder="e.g. TOPPI-NEW-DEMO" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Perusahaan</label>
                <select value={newDevice.company_id} onChange={e => setNewDevice({...newDevice, company_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10">
                  <option value="">Pilih Perusahaan...</option>
                  {companies?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Tipe</label>
                <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10">
                  <option>GTWY(0)</option>
                  <option>GTWY(1)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isCreating} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isCreating} className="flex-1 py-3 rounded-xl bg-[#F97316] text-white font-bold text-sm hover:bg-[#E85D04] transition-colors shadow-sm disabled:opacity-50">
                  {isCreating ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DeviceToppiScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">Loading...</div>}>
      <DeviceContent />
    </Suspense>
  );
}
