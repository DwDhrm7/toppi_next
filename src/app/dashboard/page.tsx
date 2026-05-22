"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useMqtt } from "@/hooks/useMqtt";
import { useLogs } from "@/hooks/useLogs";
import { Log } from "@/lib/api/log.service";

const DEVICES = ["Semua Perangkat", "TOPPI-001", "TOPPI-002", "TOPPI-003", "TOPPI-004"];
const TODAY = new Date().toISOString().split('T')[0];

/* ── elegant sparkline ── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 200, h = 60, pts = data.length;
  const points = data.map((v, i) => `${(i / (pts - 1)) * w},${h - (v / max) * (h - 8) - 4}`).join(" ");
  const fill = `${points} ${w},${h} 0,${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#g${color})`}/>
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── elegant bar chart ── */
function BarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 200, h = 60, gap = 6;
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / max) * (h - 4);
        return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx="3" fill={color} fillOpacity={0.4 + i * 0.05}/>;
      })}
    </svg>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { republish, isRepublishing } = useMqtt();
  const { logs: MOCK } = useLogs();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [device, setDevice] = useState("Semua Perangkat");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selected, setSelected] = useState<Log | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const todayRows = MOCK.filter(d => d.date.startsWith(TODAY));
  const okCount = todayRows.filter(d => d.status === "success").length;
  const errCount = todayRows.filter(d => d.status === "failed").length;

  const filtered = MOCK.filter(d => {
    if (search && !d.deviceId.toLowerCase().includes(search.toLowerCase()) && !d.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (device !== "Semua Perangkat" && d.deviceId !== device) return false;
    if (dateFrom && !d.date.startsWith(dateFrom)) return false;

    if (statusFilter !== "Semua Status") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize today to midnight
      
      const recordDate = new Date(d.date.split(" ")[0]);
      recordDate.setHours(0, 0, 0, 0); // normalize record to midnight
      
      const diffDays = (today.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);

      if (statusFilter === "Sukses (3 Hari)") {
        if (d.status !== "success" || diffDays > 3 || diffDays < 0) return false;
      } else if (statusFilter === "Gagal (3 Hari)") {
        if (d.status !== "failed" || diffDays > 3 || diffDays < 0) return false;
      }
    }
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const openDetail = (row: Log) => { setSelected(row); setShowDetail(true); };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased text-gray-800">
      <Navbar />

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            { label: "Total Toppi", val: "12", sub: "Perangkat Aktif", icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg> },
            { label: "Pelanggan", val: "5", sub: "Pengguna Terdaftar", icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { label: "MQTT Hari Ini", val: String(okCount + errCount), sub: <><span className="text-gray-800 font-semibold">{okCount}</span> sukses • <span className="text-red-500 font-semibold">{errCount}</span> gagal</>, icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> },
            { label: "Data Terakhir", val: "TOPPI-001", sub: "19 Mei · 14:30 WITA", icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
          ].map((c, i) => (
            <div key={c.label} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 flex items-start justify-between transition-transform duration-300 hover:-translate-y-1">
              <div>
                <p className="text-[13px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">{c.label}</p>
                <p className={`font-black text-gray-900 tracking-tight mb-2 ${i === 3 ? "text-xl mt-1" : "text-3xl"}`}>{c.val}</p>
                <p className="text-[12px] text-gray-400 font-medium">{c.sub}</p>
              </div>
              <div className="w-12 h-12 bg-[#F97316]/10 rounded-2xl flex items-center justify-center text-[#F97316] shrink-0 border border-[#F97316]/20">
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 flex flex-col">
          
          <div className="px-6 lg:px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Catatan Pembacaan TOPPI</h2>
                <p className="text-sm text-gray-500 font-medium">Data pemantauan meteran air yang terhubung ke sistem MQTT.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center">
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Cari alat / company..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-[220px] pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 placeholder-gray-400 bg-gray-50 hover:bg-white transition-all font-medium" />
                </div>

                {/* Date Picker (Native for simplicity and robustness) */}
                <div className="relative w-full sm:w-auto">
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="w-full sm:w-[150px] px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 bg-gray-50 hover:bg-white transition-all font-medium cursor-pointer" />
                </div>

                {/* Device dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select value={device} onChange={e => setDevice(e.target.value)}
                    className="appearance-none w-full sm:w-[170px] border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm text-gray-600 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 cursor-pointer bg-gray-50 hover:bg-white font-medium transition-all">
                    {DEVICES.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                {/* Status 3 Hari dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="appearance-none w-full sm:w-[170px] border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm text-gray-600 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 cursor-pointer bg-gray-50 hover:bg-white font-medium transition-all">
                    <option>Semua Status</option>
                    <option>Sukses (3 Hari)</option>
                    <option>Gagal (3 Hari)</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

            </div>
          </div>

          {/* Table Container (Scrollable on small screens) */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-[14px] min-w-[800px]">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 lg:px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-20">NO</th>
                  <th className="px-6 lg:px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">PERANGKAT</th>
                  <th className="px-6 lg:px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">COMPANY</th>
                  <th className="px-6 lg:px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">KIRIMAN TERAKHIR</th>
                  <th className="px-6 lg:px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">FLOW RATE</th>
                  <th className="px-6 lg:px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">TANGGAL</th>
                  <th className="px-6 lg:px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest w-32">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row, i) => (
                  <tr key={row.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 lg:px-8 py-5 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-6 lg:px-8 py-5 font-bold text-gray-800">{row.deviceId}</td>
                    <td 
                      className="px-6 lg:px-8 py-5 text-[#F97316] font-bold cursor-pointer hover:underline"
                      onClick={() => router.push(`/companies/${encodeURIComponent(row.company)}`)}
                    >
                      {row.company}
                    </td>
                    <td className="px-6 lg:px-8 py-5">
                      {row.status === "success"
                        ? <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Sukses</span>
                        : <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">Gagal</span>
                      }
                    </td>
                    <td className="px-6 lg:px-8 py-5 text-gray-600 font-semibold">{row.flow} <span className="text-gray-400 font-normal">m³/h</span></td>
                    <td className="px-6 lg:px-8 py-5 text-gray-500 font-medium">{row.date}</td>
                    <td className="px-6 lg:px-8 py-5 text-center">
                      <button onClick={() => openDetail(row)}
                        className="bg-[#F97316] hover:bg-[#E85D04] text-white text-[12px] font-bold px-6 py-2.5 rounded-full transition-all shadow-[0_4px_12px_-4px_rgba(249,115,22,0.4)] active:scale-95">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                      Tidak ada data yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 lg:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
            <span className="text-xs font-semibold text-gray-500">Menampilkan {filtered.length} dari {MOCK.length} data</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">Prev</button>
              <button className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F97316] text-white shadow-sm transition-colors">1</button>
              <button className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">Next</button>
            </div>
          </div>
        </div>

      </main>

      {/* ── DETAIL DRAWER (Overlay on Right) ── */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDetail(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-[420px] w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            
            {/* Drawer Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="font-black text-gray-900 text-xl tracking-tight mb-1">Detail Perangkat</h3>
                <p className="text-sm font-semibold text-[#F97316]">{selected.deviceId}</p>
              </div>
              <button onClick={() => setShowDetail(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
              
              {/* Line chart */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] font-bold text-gray-700">Grafik Flow Rate (m³/h)</p>
                </div>
                <div className="h-24 w-full mb-2">
                  <Sparkline data={[10, 14, 8, 18, 12, 20, 15, 22, 16, selected.flow]} color="#F97316" />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 px-1">
                  {["Jan","Feb","Mar","Apr","Mei"].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                  <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-2">Total Volume</p>
                  <p className="text-3xl font-black text-gray-800 tracking-tight">{selected.volume} <span className="text-base text-gray-400 font-semibold">L</span></p>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                  <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-2">Temperatur</p>
                  <p className="text-3xl font-black text-gray-800 tracking-tight">{selected.temp ?? "-"} <span className="text-base text-gray-400 font-semibold">°C</span></p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] font-bold text-gray-700">Akumulasi Volume (L)</p>
                </div>
                <div className="h-28 w-full mb-3">
                  <BarChart data={[60, 130, 95, 180, 110, 160, 145, 90, 170, selected.volume]} color="#F97316" />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 px-1">
                  {["Jan","Feb","Mar","Apr","Mei"].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-[13px] text-gray-500 font-semibold">Status Sistem</span>
                  {selected.status === "success"
                    ? <span className="text-[#10B981] font-bold text-sm">Online / Sukses</span>
                    : <span className="text-[#EF4444] font-bold text-sm">Offline / Gagal</span>}
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-[13px] text-gray-500 font-semibold">Waktu Update</span>
                  <span className="font-bold text-gray-800 text-sm">{selected.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500 font-semibold">Firmware Ver.</span>
                  <span className="font-bold text-gray-800 text-sm">v2.1.4</span>
                </div>
              </div>

              {/* Log 3 Hari Terakhir */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] font-bold text-gray-700">Log 3 Hari Terakhir</p>
                </div>
                <div className="space-y-3">
                  {MOCK
                    .filter(l => l.deviceId === selected.deviceId)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 3)
                    .map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-[13px] text-gray-600 font-medium">{log.date}</span>
                      {log.status === "success" 
                        ? <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#10B981]/10 text-[#10B981]">Berhasil</span>
                        : <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444]">Gagal</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-white shrink-0">
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push("/toppi-log")}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-700 text-[14px] font-bold hover:bg-gray-200 transition-colors text-center">
                  Lihat Log Lengkap
                </button>
                <button 
                  onClick={async () => {
                    const res = await republish(selected.deviceId);
                    alert(res.message);
                  }}
                  disabled={isRepublishing}
                  className="flex-1 py-3.5 rounded-2xl bg-[#F97316] text-white text-[14px] font-bold hover:bg-[#E85D04] shadow-[0_4px_12px_-4px_rgba(249,115,22,0.4)] transition-all active:scale-95 text-center disabled:opacity-50">
                  {isRepublishing ? "Loading..." : "Re-Publish MQTT"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
