"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

import { useLogs } from "@/hooks/useLogs";
import { Log } from "@/lib/api/log.service";

export default function MqttLogScreen() {
  const { logs } = useLogs();
  
  // Sort logs by timestamp descending
  const MOCK_DATA = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const [selected, setSelected] = useState<Log | null>(null);
  const activeSelected = selected || MOCK_DATA[0] || null;

  // Resizable layout states
  const [leftWidth, setLeftWidth] = useState(55); // percentage
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
      // limit range between 30% and 70%
      setLeftWidth(Math.max(30, Math.min(70, initialPercent + deltaPercent)));
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
      
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-0">
        
        {/* Left Table Section */}
        <div 
          className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0"
          style={{ width: isDesktop ? `calc(${leftWidth}% - 12px)` : "100%" }}
        >
          <div className="p-6 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">MQTT Log</h2>
            <p className="text-sm text-gray-500 font-medium">Riwayat publikasi data ke broker MQTT.</p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16">NO</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">DEVICE ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">TOPIC PUBLISH</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">PUBLISHED AT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_DATA.map((row, index) => (
                  <tr key={row.id} onClick={() => setSelected(row)} className={`cursor-pointer transition-colors ${activeSelected?.id === row.id ? "bg-orange-50/50 border-l-4 border-l-[#F97316]" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{row.deviceId}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">toppi-log/created</td>
                    <td className="px-6 py-4 text-gray-500">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500 font-medium">
            <span>Showing 1 to 50 of 56,843 records</span>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50">First</button>
              <button className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50">&lt;</button>
              <button className="px-3 py-1.5 rounded bg-[#F97316] text-white font-bold">1</button>
              <button className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50">2</button>
              <button className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50">3</button>
              <button className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50">&gt;</button>
              <button className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50">Last</button>
            </div>
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
        <div 
          className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0"
          style={{ width: isDesktop ? `calc(${100 - leftWidth}% - 12px)` : "100%" }}
        >
          <div className="p-4 bg-[#F97316]/10 border-b border-[#F97316]/20 flex items-start gap-3">
            <svg className="h-5 w-5 text-[#F97316] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-[13px] text-[#E85D04] font-medium leading-relaxed">
              Contains entry of logs of MQTT broadcasts, if the broadcast is success, then it will be logged to the monitoring backend.
            </p>
          </div>

          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Capture Result & Device Meta */}
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">CAPTURE RESULT</p>
                {activeSelected?.image ? (
                  <div className="w-full h-56 rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner bg-gray-50">
                    <Image 
                      src={activeSelected.image} 
                      alt="Water Meter Capture" 
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 relative">
                    <span className="text-4xl font-black text-[#F97316]">TOPPI</span>
                    <span className="text-xs text-gray-400 mt-1 font-medium">Smart Water Meter Reading</span>
                  </div>
                )}
              </div>

              {/* Metadata Grey Box */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3.5 shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">DEVICE ID</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.deviceId || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">CAPT. TIMESTAMP</p>
                  <p className="text-xs font-bold text-gray-800">{activeSelected?.captTimestamp || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">SYS. ENTRY</p>
                  <p className="text-xs font-bold text-gray-800">{activeSelected?.sysEntry || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">FILENAME</p>
                  <p className="text-xs font-bold text-gray-800 break-all leading-normal">{activeSelected?.filename || "-"}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Detail Parameters */}
            <div className="flex flex-col">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">DETAIL</p>
              
              <div className="grid grid-cols-2 gap-y-4.5 gap-x-6 flex-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">OCR VALUE:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.ocr || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">OCR CONF. :</p>
                  <p className="text-sm font-extrabold text-emerald-600">{activeSelected?.ocrConf || "-"}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">MODEL:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.model || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">MODEL CONF.:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.modelConf || "-"}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">AREA:</p>
                  <p className="text-sm font-extrabold text-gray-800 leading-normal">{activeSelected?.area || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">ROTATION ADJUST:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.rotationAdjust || "-"}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">NO. SEGEL:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.noSegel || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">SERI METER:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.seriMeter || "-"}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">VOLTAGE - BAT 1:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.bat1 || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">VOLTAGE - BAT 2:</p>
                  <div className="flex items-center">
                    <p className="text-sm font-extrabold text-gray-800">{activeSelected?.bat2 || "-"}</p>
                    {activeSelected?.bat2 === "0 V" && (
                      <span className="ml-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-100 text-red-600 font-black text-[10px] animate-pulse shadow-sm border border-red-200">
                        !
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">BATTERY:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.battery || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">TEMPERATURE:</p>
                  <p className="text-sm font-extrabold text-gray-800">
                    {activeSelected?.temp !== undefined && activeSelected?.temp !== null 
                      ? `${activeSelected.temp} C` 
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">FIRMWARE:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.firmware || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">VERSION:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.version || "-"}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">CUSTOM DATA:</p>
                  <p className="text-sm font-extrabold text-gray-800 break-all">{activeSelected?.customData || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">UTC:</p>
                  <p className="text-sm font-extrabold text-gray-800">{activeSelected?.utc || "-"}</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

