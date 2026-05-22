"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useCompanies } from "@/hooks/useCompanies";
import type { Company } from "@/lib/api/company.service";

export default function CompaniesScreen() {
  const { companies, isLoading, deleteCompany, createCompany } = useCompanies();
  const [selected, setSelected] = useState<Company | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", phone: "", address: "" });

  const handleDelete = async () => {
    if (selected && confirm("Apakah Anda yakin ingin menghapus perusahaan ini?")) {
      await deleteCompany(selected.id);
      setSelected(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) return;
    
    await createCompany({
      name: newCompany.name,
      status: "POTENTIAL",
      phone: newCompany.phone || "-",
      address: newCompany.address || "-",
    });
    setIsModalOpen(false);
    setNewCompany({ name: "", phone: "", address: "" });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Companies List */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden w-full">
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#F97316]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              <h2 className="text-sm font-bold uppercase tracking-widest">COMPANY</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(true)} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm">+ Add Data</button>
              <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm cursor-not-allowed opacity-50">Edit</button>
              <button onClick={handleDelete} disabled={!selected} className={`px-3 py-1.5 ${selected ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300'} text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm`}>Delete</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-800">Name</th>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-800">Entry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">Memuat data...</td></tr>
                ) : companies.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">Tidak ada perusahaan.</td></tr>
                ) : (
                  companies.map((row) => (
                    <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors ${selected?.id === row.id ? "bg-orange-50/30" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-4 text-gray-700 font-medium">{row.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">{row.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Company Detail */}
        {selected ? (
          <div className="w-full lg:w-[450px] bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden shrink-0">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
              <h2 className="text-sm font-bold text-[#F97316] uppercase tracking-widest">COMPANY DETAIL</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">COMPANY:</p>
                <p className="font-bold text-gray-800">{selected.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">PHONE:</p>
                <p className="font-bold text-gray-800">{selected.phone}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">STATUS:</p>
                <span className="inline-flex items-center px-3 py-1 rounded bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider">{selected.status}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">ADDRESS:</p>
                <p className="font-bold text-gray-800">{selected.address}</p>
              </div>

              <div className="mt-6">
                <div className="w-full h-48 bg-[#BDE3ED] border border-gray-200 flex items-center justify-center relative">
                  <p className="text-gray-500 font-medium text-sm">Leaflet | © OpenStreetMap contributors</p>
                  <div className="absolute top-2 right-2 bg-white/80 px-2 py-0.5 text-[10px] text-gray-600 rounded">1 km</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-[450px] bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden shrink-0 flex items-center justify-center p-8 text-center min-h-[400px]">
            <div>
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <p className="text-gray-500 font-medium">Pilih perusahaan untuk melihat detail</p>
            </div>
          </div>
        )}

      </main>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Perusahaan Baru</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Nama Perusahaan</label>
                <input required type="text" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" placeholder="PT. Nama Perusahaan" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">No. Telepon (Opsional)</label>
                <input type="text" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" placeholder="08123456789" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Alamat (Opsional)</label>
                <textarea rows={2} value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" placeholder="Alamat lengkap..."></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#F97316] text-white font-bold text-sm hover:bg-[#E85D04] transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
