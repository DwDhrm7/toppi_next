"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

import { useMqtt } from "@/hooks/useMqtt";
import { useDevices } from "@/hooks/useDevices";
import { Log } from "@/lib/api/log.service";

export default function MqttLogScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const { logs, paginate, isLoadingLogs, republish, isRepublishing, exportCsv, isExporting } = useMqtt({
    page: currentPage,
    page_size: 10
  });
  const router = useRouter();
  const { devices } = useDevices();

  const deviceMap = useMemo(() => {
    const map = new Map<string, any>();
    devices.forEach(d => {
      if (d.device_id) map.set(d.device_id, d);
    });
    return map;
  }, [devices]);

  const logsWithCompany = useMemo(() => {
    return logs.map(log => {
      const matchedDevice = deviceMap.get(log.device_id || "");
      let decodedData = {};
      if (log.message) {
        let msgObj = log.message;
        if (typeof msgObj === 'string') {
          try { msgObj = JSON.parse(msgObj); } catch {}
        }
        if (msgObj && typeof msgObj === 'object' && msgObj.Data) {
          try {
            const jsonStr = atob(msgObj.Data);
            decodedData = JSON.parse(jsonStr);
          } catch (e) {
            console.error("Failed to decode MQTT message data", e);
          }
        }
      }
      return {
        ...log,
        ...decodedData,
        company: matchedDevice?.company || log.company
      };
    });
  }, [logs, deviceMap]);

  const MOCK_DATA = [...logsWithCompany]
    .filter(log => log.device_id && log.device_id.trim() !== "")
    .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());

  const itemsPerPage = 10;
  const totalItems = paginate?.total ?? MOCK_DATA.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = paginate ? MOCK_DATA : MOCK_DATA.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [selected, setSelected] = useState<Log | null>(null);
  const activeSelected = selected;

  const selectedIndex = selected ? MOCK_DATA.findIndex(r => r.id === selected.id) : -1;
  const hasNext = selectedIndex >= 0 && selectedIndex < MOCK_DATA.length - 1;
  const hasPrev = selectedIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelected(MOCK_DATA[selectedIndex + 1]);
  };

  const handlePrev = () => {
    if (hasPrev) setSelected(MOCK_DATA[selectedIndex - 1]);
  };

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [exportFrom, setExportFrom] = useState(today);
  const [exportTo, setExportTo] = useState(today);
  const [exportType, setExportType] = useState<'mqtt-log' | 'mqtt-only'>('mqtt-log');
  const [exportFilterBy, setExportFilterBy] = useState<'date' | 'device'>('date');
  const [exportDeviceId, setExportDeviceId] = useState<string>('');

  const deviceCaptures = exportFilterBy === 'device' && exportDeviceId 
    ? MOCK_DATA.filter(r => r.device_id === exportDeviceId).sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
    : [];

  const handleExport = async () => {
    if (exportFilterBy === 'device' && !exportDeviceId) {
      alert('Pilih Device ID terlebih dahulu');
      return;
    }
    try {
      const blob = await exportCsv({ 
        type: exportType, 
        filterBy: exportFilterBy, 
        from: exportFrom, 
        to: exportTo, 
        deviceId: exportDeviceId, 
        logs: MOCK_DATA 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilterBy === 'device' ? `mqtt-${exportDeviceId}.csv` : `mqtt-log-${exportFrom}-to-${exportTo}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err: any) {
      alert('Gagal mengekspor data: ' + (err?.message || 'Unknown error'));
    }
  };

  const [leftWidth, setLeftWidth] = useState(65); // percentage
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
        
        {/* Left Table Panel */}
        <div 
          className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0 transition-all duration-300"
          style={{ width: isDesktop ? (activeSelected ? `${leftWidth}%` : "100%") : "100%" }}
        >
          <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">MQTT Log</h2>
              <p className="text-sm text-gray-500 font-medium">Riwayat publikasi data ke broker MQTT.</p>
            </div>
            <button
              id="btn-export-mqtt"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16">NO</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">DEVICE ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">COMPANY</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">TOPIC PUBLISH</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">PUBLISHED AT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingLogs ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">
                      Tidak ada data log MQTT yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr 
                      key={row.id} 
                      onClick={() => setSelected(activeSelected?.id === row.id ? null : row)}
                      className={`cursor-pointer transition-colors ${activeSelected?.id === row.id ? "bg-orange-50/50 border-l-4 border-l-[#F97316]" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 text-gray-400 font-medium">{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          {row.device_id}
                          {(!row.ocr || row.ocr === "0" || Number(row.voltage_battery1) < 3.0) && (
                            <span title="Baterai rendah atau gagal kirim" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[11px] font-black animate-pulse">!</span>
                          )}
                        </div>
                      </td>
                      <td 
                        className="px-6 py-4 text-[#F97316] font-bold cursor-pointer hover:underline"
                        onClick={(e) => { e.stopPropagation(); router.push(`/companies/${encodeURIComponent(row.company?.name || "")}`); }}
                      >
                        {row.company?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{row.topic || "-"}</td>
                      <td className="px-6 py-4 text-gray-500">{row.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="px-6 lg:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
            <span className="text-xs font-semibold text-gray-500">
              Menampilkan {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
            </span>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoadingLogs}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Prev
              </button>
              <div className="px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-lg shadow-sm">
                {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoadingLogs}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {activeSelected && (
          <>
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

            <div 
              className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0"
              style={{ width: isDesktop ? `calc(${100 - leftWidth}% - 12px)` : "100%" }}
            >
              <div className="p-5 flex items-center justify-between pb-4">
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">Log Details</h3>
                <div className="flex gap-2 items-center">
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden mr-2">
                    <button 
                      onClick={handlePrev} 
                      disabled={!hasPrev}
                      className="px-2.5 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
                    >
                      ← PREV
                    </button>
                    <button 
                      onClick={handleNext} 
                      disabled={!hasNext}
                      className="px-2.5 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      NEXT →
                    </button>
                  </div>
                  <button className="px-3 py-1.5 bg-transparent text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors uppercase">DELETE</button>
                  <button 
                    onClick={async () => {
                      if (selected.device_id) {
                        const res = await republish(selected.device_id);
                        alert(res.message);
                      }
                    }}
                    disabled={isRepublishing}
                    className="px-3 py-1.5 bg-orange-50 text-[#F97316] text-[10px] font-bold rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 uppercase"
                  >
                    {isRepublishing ? "LOADING..." : "REPUBLISH"}
                  </button>
                </div>
              </div>

              <div className="px-5 pb-5 overflow-y-auto flex-1 space-y-6">
                
                {/* Capture Result Placeholder */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">CAPTURE RESULT</p>
                  {activeSelected?.image ? (
                    <div className="w-full h-[180px] rounded-2xl overflow-hidden relative shadow-inner bg-black flex justify-center">
                      <Zoom>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={activeSelected.image} 
                          alt="Water Meter Capture" 
                          className="object-contain w-full h-[180px]"
                        />
                      </Zoom>
                    </div>
                  ) : (
                    <div className="w-full h-[180px] bg-gray-100 rounded-2xl flex flex-col items-center justify-center border border-gray-200 relative overflow-hidden group">
                      <span className="text-4xl font-black text-gray-300">TOPPI</span>
                      <span className="text-xs text-gray-400 mt-1 font-medium">Smart Water Meter Reading</span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">DEVICE ID</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.device_id || "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">CUSTOMER ID</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.customer_id || "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">TIMESTAMP</p><p className="font-bold text-gray-900 text-[11px] break-all pr-2">{activeSelected?.timestamp || activeSelected?.created_at || "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">SYS. ENTRY</p><p className="font-bold text-gray-900 text-[11px] break-all">{activeSelected?.created_at || "-"}</p></div>
                </div>

                {/* Meter Info */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">METER INFO</p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-[#F9FAFB] rounded-[20px] p-4 border border-gray-100/50">
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">MODEL</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.model || "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">MODEL CONF.</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.model_confidence ?? "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">NO SEGEL</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.no_segel || "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">SERI METER</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.seri_meter || "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">DIGIT / DECIMAL</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.number_digit || "0"} / {activeSelected?.number_decimal || "0"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">CUSTOM</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.custom || "-"}</p></div>
                  </div>
                </div>

                {/* OCR Detail */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">OCR DETAILS</p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-[#F9FAFB] rounded-[20px] p-4 border border-gray-100/50">
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">OCR VALUE</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.ocr ?? "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">OCR CONF.</p><p className="font-extrabold text-emerald-500 text-[13px]">{activeSelected?.ocr_confidence ?? "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">AREA</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.area || "[ 0, 0, 0, 0 ]"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">ROTATION</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.adjust_rotation ? `${activeSelected.adjust_rotation}°` : "0°"}</p></div>
                  </div>
                </div>

                {/* Telemetry Detail */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">TELEMETRY & HARDWARE</p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">BATTERY</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.battery ?? "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">BATTERY GATEWAY</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.battery_gateway ?? "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">VOLTAGE BAT 1</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.voltage_battery1 ?? "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">VOLTAGE BAT 2</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.voltage_battery2 ? `${activeSelected.voltage_battery2} V` : "0 V"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">TEMPERATURE</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.temperature !== undefined && activeSelected?.temperature !== null ? `${activeSelected.temperature} °C` : "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">FIRMWARE / VER</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected?.firmware || "TOPPI"} v{activeSelected?.version || "2.20"}</p></div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 animate-[fadeInUp_0.2s_ease]">
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Export MQTT Log</h3>
            <p className="text-sm text-gray-500 mb-6">Pilih format dan filter untuk mengekspor data ke file CSV.</p>

            <div className="space-y-5">
              {/* Export Type */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tipe Export</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setExportType('mqtt-log')}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl border transition-all ${exportType === 'mqtt-log' ? 'bg-orange-50 border-[#F97316] text-[#F97316]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    MQTT Log (Raw)
                  </button>
                  <button
                    onClick={() => setExportType('mqtt-only')}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl border transition-all ${exportType === 'mqtt-only' ? 'bg-orange-50 border-[#F97316] text-[#F97316]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    MQTT Only
                  </button>
                </div>
              </div>

              {/* Filter By */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Filter Berdasarkan</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setExportFilterBy('date')}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${exportFilterBy === 'date' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                  >
                    Per Hari
                  </button>
                  <button
                    onClick={() => setExportFilterBy('device')}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${exportFilterBy === 'device' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                  >
                    Per Device ID
                  </button>
                </div>
              </div>

              {exportFilterBy === 'date' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Dari Tanggal</label>
                    <input
                      id="export-from-date"
                      type="date"
                      value={exportFrom}
                      onChange={e => setExportFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sampai Tanggal</label>
                    <input
                      id="export-to-date"
                      type="date"
                      value={exportTo}
                      onChange={e => setExportTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Masukkan Device ID</label>
                    <input
                      type="text"
                      placeholder="Contoh: 256E000117"
                      value={exportDeviceId}
                      onChange={e => setExportDeviceId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] bg-white"
                    />
                  </div>
                  
                  {exportDeviceId && deviceCaptures.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">Capture Summary</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-500 mb-0.5">Total Capture</p>
                          <p className="text-xl font-extrabold text-gray-900">{deviceCaptures.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-0.5">Baris Export</p>
                          <p className="text-xl font-extrabold text-[#F97316]">{deviceCaptures.length}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-500 mb-0.5">Rentang Waktu</p>
                          <p className="text-xs font-bold text-gray-700">
                            {deviceCaptures[0].created_at} — {deviceCaptures[deviceCaptures.length - 1].created_at}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {exportDeviceId && deviceCaptures.length === 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Tidak ada data untuk device ini.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn-confirm-export"
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Mengekspor...
                  </>
                ) : (
                  <>Download CSV</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
