"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useMqtt } from "@/hooks/useMqtt";
import { useLogs } from "@/hooks/useLogs";
import { useDevices } from "@/hooks/useDevices";
import { Log } from "@/lib/api/log.service";
import { Suspense, useState, useEffect, useMemo } from "react";

type SortField = "timestamp" | "battery1" | "battery2";
type SortDirection = "asc" | "desc";

const tableTimestampFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const detailTimestampFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function parseDateValue(value: unknown) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return null;

  const normalizedValue = rawValue.replace(/(\.\d{3})\d+/, "$1");
  const parsedDate = new Date(normalizedValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatTableTimestamp(value: unknown) {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) {
    return { dateLabel: "-", timeLabel: "" };
  }

  const formatted = tableTimestampFormatter.formatToParts(parsedDate);
  const dateLabel = `${formatted.find((part) => part.type === "day")?.value || ""} ${
    formatted.find((part) => part.type === "month")?.value || ""
  } ${formatted.find((part) => part.type === "year")?.value || ""}`.trim();
  const timeLabel = `${formatted.find((part) => part.type === "hour")?.value || ""}:${
    formatted.find((part) => part.type === "minute")?.value || ""
  }`;

  return { dateLabel, timeLabel };
}

function formatDetailTimestamp(value: unknown) {
  const parsedDate = parseDateValue(value);
  return parsedDate ? detailTimestampFormatter.format(parsedDate) : "-";
}

function getBatteryValue(value: unknown) {
  const batteryValue = Number(value);
  return Number.isFinite(batteryValue) ? batteryValue : Number.NEGATIVE_INFINITY;
}

function getCreatedAtTime(value: unknown) {
  return parseDateValue(value)?.getTime() || 0;
}

function isRowSuccess(row: Partial<Log>) {
  return Boolean(row.ocr && row.ocr !== "0" && Number(row.voltage_battery1) >= 3.0);
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <span className={`inline-flex text-[10px] ${active ? "text-[#F97316]" : "text-gray-300"}`}>
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

function ToppiLogContent() {
  const { republish, isRepublishing } = useMqtt();
  const searchParams = useSearchParams();
  const companyParam = searchParams.get("company") || "";
  const [searchQuery, setSearchQuery] = useState(companyParam);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [device, setDevice] = useState("Semua Perangkat");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(companyParam);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const searchParam = debouncedSearch || (device !== "Semua Perangkat" ? device : "");

  const { logs: MOCK_DATA, isLoading } = useLogs({
    page: 1,
    page_size: 1000,
    search: searchParam,
    q: searchParam,
  });
  const { devices } = useDevices();
  const router = useRouter();

  const deviceMap = useMemo(() => {
    const map = new Map<string, any>();
    devices.forEach(d => {
      if (d.device_id) map.set(d.device_id, d);
    });
    return map;
  }, [devices]);

  const installedDeviceCounts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchingDeviceIds = new Set(
      devices
        .filter((deviceRow) => {
          const matchSearch =
            !normalizedSearch ||
            deviceRow.device_id?.toLowerCase().includes(normalizedSearch) ||
            deviceRow.company?.name?.toLowerCase().includes(normalizedSearch);

          const matchDevice = device === "Semua Perangkat" || deviceRow.device_id === device;

          return matchSearch && matchDevice && Boolean(deviceRow.device_id?.trim());
        })
        .map((deviceRow) => deviceRow.device_id as string)
    );

    return {
      installedDevices: matchingDeviceIds.size,
    };
  }, [device, devices, searchQuery]);

  const logsWithCompany = useMemo(() => {
    return MOCK_DATA.map(log => {
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
  }, [MOCK_DATA, deviceMap]);

  const handleSortChange = (field: SortField) => {
    setCurrentPage(1);
    setSortDirection((currentDirection) => {
      if (sortField === field) {
        return currentDirection === "asc" ? "desc" : "asc";
      }
      return field === "timestamp" ? "desc" : "asc";
    });
    setSortField(field);
  };

  const baseFilteredData = logsWithCompany.filter((row: any) => {
    const matchSearch = row.device_id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (row.company?.name && row.company.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchDate = true;
    const rowTime = getCreatedAtTime(row.created_at);
    if (startDate) {
      const startTime = new Date(`${startDate}T00:00:00`).getTime();
      if (rowTime < startTime) matchDate = false;
    }
    if (endDate) {
      const endTime = new Date(`${endDate}T23:59:59`).getTime();
      if (rowTime > endTime) matchDate = false;
    }

    const matchDevice = device === "Semua Perangkat" || row.device_id === device;
    return matchSearch && matchDate && matchDevice && Boolean(row.device_id && row.device_id.trim() !== "");
  });

  const deviceStatusSummary = useMemo(() => {
    const summary = new Map<string, { success: number; failed: number; aggregateStatus: "Sukses" | "Gagal" }>();

    baseFilteredData.forEach((row: any) => {
      const deviceId = row.device_id || "";
      if (!deviceId) return;

      const current = summary.get(deviceId) || { success: 0, failed: 0, aggregateStatus: "Sukses" as const };

      if (isRowSuccess(row)) {
        current.success += 1;
      } else {
        current.failed += 1;
      }

      current.aggregateStatus = current.failed > 0 ? "Gagal" : "Sukses";
      summary.set(deviceId, current);
    });

    return summary;
  }, [baseFilteredData]);

  const statusCounts = useMemo(() => {
    let successDevices = 0;
    let failedDevices = 0;

    deviceStatusSummary.forEach((summary) => {
      if (summary.aggregateStatus === "Sukses") {
        successDevices += 1;
      } else {
        failedDevices += 1;
      }
    });

    return {
      successDevices,
      failedDevices,
      totalDevices: deviceStatusSummary.size,
    };
  }, [deviceStatusSummary]);

  const filteredData = useMemo(() => {
    const statusScopedData = baseFilteredData.filter((row: any) => {
      if (statusFilter === "Semua Status") return true;
      return deviceStatusSummary.get(row.device_id || "")?.aggregateStatus === statusFilter;
    });

    const sortedRows = [...statusScopedData].sort((a: any, b: any) => {
      if (sortField === "battery1") {
        return sortDirection === "asc"
          ? getBatteryValue(a.voltage_battery1) - getBatteryValue(b.voltage_battery1)
          : getBatteryValue(b.voltage_battery1) - getBatteryValue(a.voltage_battery1);
      }

      if (sortField === "battery2") {
        return sortDirection === "asc"
          ? getBatteryValue(a.voltage_battery2) - getBatteryValue(b.voltage_battery2)
          : getBatteryValue(b.voltage_battery2) - getBatteryValue(a.voltage_battery2);
      }

      return sortDirection === "asc"
        ? getCreatedAtTime(a.created_at) - getCreatedAtTime(b.created_at)
        : getCreatedAtTime(b.created_at) - getCreatedAtTime(a.created_at);
    });

    return sortedRows;
  }, [baseFilteredData, deviceStatusSummary, sortDirection, sortField, statusFilter]);

  const DEVICES = ["Semua Perangkat", ...Array.from(new Set(devices.map(d => d.device_id || "").filter(Boolean)))];

  const itemsPerPage = 10;
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [selected, setSelected] = useState<Log | null>(null);
  const activeSelected = selected && filteredData.some((row: any) => row.id === selected.id) ? selected : null;

  const selectedIndex = activeSelected ? filteredData.findIndex((r: any) => r.id === activeSelected.id) : -1;
  const hasNext = selectedIndex >= 0 && selectedIndex < filteredData.length - 1;
  const hasPrev = selectedIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelected(filteredData[selectedIndex + 1]);
  };

  const handlePrev = () => {
    if (hasPrev) setSelected(filteredData[selectedIndex - 1]);
  };

  // Resizable layout states
  const [leftWidth, setLeftWidth] = useState(75); // percentage (default position as requested)
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
          className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col min-w-0 transition-all duration-300"
          style={{ width: isDesktop ? (selected ? `calc(${leftWidth}% - 12px)` : "100%") : "100%" }}
        >
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">TOPPI Log</h2>
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="relative w-full sm:w-auto">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Cari alat / company..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[220px] pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 placeholder-gray-400 bg-gray-50 hover:bg-white transition-all font-medium" 
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-[140px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 text-gray-600 bg-gray-50 hover:bg-white transition-all font-medium cursor-pointer" 
                  title="Start Date"
                />
                <span className="text-gray-400 font-medium">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-[140px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 text-gray-600 bg-gray-50 hover:bg-white transition-all font-medium cursor-pointer" 
                  title="End Date"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <input 
                  list="devices-list"
                  value={device} 
                  onChange={e => {
                    setDevice(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Semua Perangkat"
                  className="w-full sm:w-[160px] border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-600 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 cursor-pointer bg-gray-50 hover:bg-white font-medium transition-all"
                />
                <datalist id="devices-list">
                  {DEVICES.map(d => <option key={d} value={d} />)}
                </datalist>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              <div className="relative w-full sm:w-auto">
                <select 
                  value={statusFilter} 
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-[160px] border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-600 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 cursor-pointer bg-gray-50 hover:bg-white font-medium transition-all appearance-none"
                >
                  <option value="Semua Status">Semua Status ({statusCounts.totalDevices})</option>
                  <option value="Sukses">Sukses ({statusCounts.successDevices})</option>
                  <option value="Gagal">Gagal ({statusCounts.failedDevices})</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          <div className="px-6 lg:px-8 py-3 border-b border-gray-100 bg-gray-50/40 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-500">
            <span>Total TOPPI terpasang: {installedDeviceCounts.installedDevices}</span>
            <span className="text-sky-600">Muncul di log: {statusCounts.totalDevices}</span>
            <span className="text-amber-600">Belum muncul di log: {Math.max(installedDeviceCounts.installedDevices - statusCounts.totalDevices, 0)}</span>
            <span className="text-emerald-600">Sukses: {statusCounts.successDevices}</span>
            <span className="text-red-600">Gagal: {statusCounts.failedDevices}</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-12">NO</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">DEVICE ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">COMPANY</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">STATUS</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">CONF.</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => handleSortChange("battery1")}
                      className={`inline-flex items-center gap-1 ${sortField === "battery1" ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <span>BAT-1 (REGULAR)</span>
                      <SortIndicator active={sortField === "battery1"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => handleSortChange("battery2")}
                      className={`inline-flex items-center gap-1 ${sortField === "battery2" ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <span>BAT-2 (GATEWAY)</span>
                      <SortIndicator active={sortField === "battery2"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => handleSortChange("timestamp")}
                      className={`inline-flex items-center gap-1 ${sortField === "timestamp" ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <span>TIMESTAMP</span>
                      <SortIndicator active={sortField === "timestamp"} direction={sortDirection} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400 font-medium">
                      Tidak ada data log TOPPI yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row: any, index: number) => {
                    const { dateLabel, timeLabel } = formatTableTimestamp(row.created_at);

                    return (
                    <tr key={row.id} onClick={() => setSelected(activeSelected?.id === row.id ? null : row)} className={`cursor-pointer transition-colors ${activeSelected?.id === row.id ? "bg-orange-50/50 border-l-4 border-l-[#F97316]" : "hover:bg-gray-50"}`}>
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
                      <td className="px-6 py-4">
                        {deviceStatusSummary.get(row.device_id || "")?.aggregateStatus === "Sukses" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Sukses
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                            Gagal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{row.ocr_confidence ? (Number(row.ocr_confidence) * 100).toFixed(2) + "%" : "-"}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{row.voltage_battery1 ? Number(row.voltage_battery1).toFixed(2) : "-"}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{row.voltage_battery2 ? Number(row.voltage_battery2).toFixed(2) : "-"}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-gray-700">{dateLabel}</div>
                        <div className="text-gray-400">{timeLabel || "-"}</div>
                      </td>
                    </tr>
                    );
                  })
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
                onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Prev
              </button>
              <div className="px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-lg shadow-sm">
                {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Draggable Divider (visible on desktop only) */}
        {activeSelected && (
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
        )}

        {/* Right Detail Panel */}
        {activeSelected ? (
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
                    if (activeSelected.device_id) {
                      const res = await republish(activeSelected.device_id);
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
                {activeSelected.image ? (
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
                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">DEVICE ID</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected.device_id}</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">TYPE / MODEL</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected.model || "Onda"}</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">TIMESTAMP</p><p className="font-bold text-gray-900 text-[11px] pr-2">{formatDetailTimestamp((activeSelected as any).timestamp || activeSelected.created_at)}</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">SYS. ENTRY</p><p className="font-bold text-gray-900 text-[11px]">{formatDetailTimestamp(activeSelected.created_at)}</p></div>
              </div>

              {/* OCR Detail */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">OCR DETAILS</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-[#F9FAFB] rounded-[20px] p-4">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">OCR VALUE</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected.ocr || "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">OCR CONF.</p><p className="font-extrabold text-emerald-500 text-[13px]">{activeSelected.ocr_confidence ? (Number(activeSelected.ocr_confidence) * 100).toFixed(2) + "%" : "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">AREA</p><p className="font-extrabold text-gray-900 text-[13px]">[ 0, 0, 0, 0 ]</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">ROTATION</p><p className="font-extrabold text-gray-900 text-[13px]">0°</p></div>
                </div>
              </div>

              {/* Telemetry Detail */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">TELEMETRY</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">VOLTAGE BAT 1</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected.voltage_battery1 ? Number(activeSelected.voltage_battery1).toFixed(2) : "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">VOLTAGE BAT 2</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected.voltage_battery2 ? Number(activeSelected.voltage_battery2).toFixed(2) : "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">TEMPERATURE</p><p className="font-extrabold text-gray-900 text-[13px]">{activeSelected.temperature !== undefined && activeSelected.temperature !== null ? `${activeSelected.temperature} °C` : "-"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">FIRMWARE</p><p className="font-extrabold text-gray-900 text-[13px]">2.20</p></div>
                </div>
              </div>

            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function ToppiLogScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex items-center justify-center">
          <div className="text-gray-400 font-medium animate-pulse">Memuat log...</div>
        </main>
      </div>
    }>
      <ToppiLogContent />
    </Suspense>
  );
}
