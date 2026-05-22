"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useMqtt } from "@/hooks/useMqtt";
import { useLogs } from "@/hooks/useLogs";
import { Log } from "@/lib/api/log.service";

export default function ToppiLogScreen() {
  const { republish, isRepublishing } = useMqtt();
  const { logs: MOCK_DATA } = useLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredData = MOCK_DATA.filter(row => {
    const matchSearch = row.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (row.company && row.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchDate = dateFilter ? row.date.startsWith(dateFilter) : true;

    return matchSearch && matchDate;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const [selected, setSelected] = useState<Log | null>(null);

  // Resizable layout states
  const [leftWidth, setLeftWidth] = useState(60); // percentage (table is slightly wider here)
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const dividerElement = e.currentTarget;
    const parentContainer = dividerElement.parentElement;
    if (!parentContainer) return;

    const containerRect = parentContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const initialPercent = leftWidth;

    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      // limit range between 40% and 80%
      setLeftWidth(Math.max(40, Math.min(80, initialPercent + deltaPercent)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-0">
        
        {/* Left Table Section */}
        <div 
          className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0"
          style={{ width: isDesktop ? `calc(${leftWidth}% - 12px)` : "100%" }}
        >
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">TOPPI Log</h2>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 text-gray-600" 
              />
              <input 
                type="text" 
                placeholder="Search ID atau Perusahaan" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[250px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10" 
              />
              <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none">
                <option>Page Size 30</option>
                <option>Page Size 50</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-12">NO</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">DEVICE ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">OCR</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">CONF.</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">TYPE</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">BAT-1</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((row, index) => (
                  <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors ${selected?.id === row.id ? "bg-orange-50/50 border-l-4 border-l-[#F97316]" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{row.deviceId}</td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{row.ocr}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">{row.ocrConf}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{row.type}</td>
                    <td className="px-6 py-4 text-gray-600">{row.bat1}</td>
                    <td className="px-6 py-4 text-gray-500">{row.timestamp}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                      Tidak ada data yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Draggable Divider (visible on desktop only) */}
        <div 
          onMouseDown={handleMouseDown}
          className="hidden lg:flex items-center justify-center w-6 cursor-col-resize select-none group self-stretch py-2 z-20"
        >
          <div className={`w-1 h-20 rounded-full transition-all duration-200 ${
            isResizing 
              ? "bg-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.6)] h-28 w-1.5" 
              : "bg-gray-200 group-hover:bg-[#F97316]/60 group-hover:h-24 group-hover:w-1.5"
          }`} />
        </div>

        {/* Right Detail Panel */}
        {selected ? (
          <div 
            className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0"
            style={{ width: isDesktop ? `calc(${100 - leftWidth}% - 12px)` : "100%" }}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Log Details</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">DELETE</button>
                <button 
                  onClick={async () => {
                    const res = await republish(selected.deviceId);
                    alert(res.message);
                  }}
                  disabled={isRepublishing}
                  className="px-4 py-2 bg-[#F97316]/10 text-[#F97316] text-xs font-bold rounded-lg hover:bg-[#F97316]/20 transition-colors disabled:opacity-50">
                  {isRepublishing ? "LOADING..." : "REPUBLISH"}
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Capture Result Placeholder */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Capture Result</p>
                <div className="w-full h-48 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border border-gray-200 relative overflow-hidden group">
                  <span className="text-4xl font-black text-gray-300">TOPPI</span>
                  <span className="text-xs text-gray-400 mt-1 font-medium">Smart Water Meter Reading</span>
                  <button className="absolute bottom-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    DOWNLOAD IMAGE
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400 mb-1">DEVICE ID</p><p className="font-bold text-gray-800">{selected.deviceId}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">FILENAME</p><p className="font-bold text-gray-800">-</p></div>
                <div><p className="text-xs text-gray-400 mb-1">TIMESTAMP</p><p className="font-bold text-gray-800 text-sm">{selected.timestamp}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">SYS. ENTRY</p><p className="font-bold text-gray-800 text-sm">{selected.timestamp}</p></div>
              </div>

              <hr className="border-gray-100" />

              {/* OCR Detail */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">OCR Details</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div><p className="text-xs text-gray-500 mb-1">OCR VALUE</p><p className="font-bold text-gray-900">{selected.ocr}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">OCR CONF.</p><p className="font-bold text-emerald-600">{selected.ocrConf}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">AREA</p><p className="font-bold text-gray-900">[ 0, 0, 0, 0 ]</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">ROTATION</p><p className="font-bold text-gray-900">0°</p></div>
                </div>
              </div>

              {/* Telemetry Detail */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Telemetry</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div><p className="text-xs text-gray-500 mb-1">VOLTAGE BAT 1</p><p className="font-bold text-gray-900">{selected.bat1 || "-"}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">VOLTAGE BAT 2</p><p className="font-bold text-gray-900">0 V</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">TEMPERATURE</p><p className="font-bold text-gray-900">{selected.temp || "28"} °C</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">FIRMWARE</p><p className="font-bold text-gray-900">2.20</p></div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2">
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium text-gray-600">
                <option>Engine Selection (Default)</option>
              </select>
              <div className="flex gap-2">
                <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold py-3 rounded-xl transition-colors">REDO OCR (TEST)</button>
                <button className="flex-1 bg-[#F97316] hover:bg-[#E85D04] text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm">RECON & PUBLISH</button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col items-center justify-center p-8 text-center min-w-0"
            style={{ width: isDesktop ? `calc(${100 - leftWidth}% - 12px)` : "100%" }}
          >
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-gray-500 font-medium">Pilih log untuk melihat detail</p>
          </div>
        )}

      </main>
    </div>
  );
}

