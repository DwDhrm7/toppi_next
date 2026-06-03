import { apiClient } from "./client";
import { ENV } from "../env";
import { Log } from "./log.service";

export const MqttService = {
  getLogs: async (params?: any): Promise<Log[]> => {
    const searchVal = params?.search || params?.q || params?.deviceId;
    if (searchVal && /^[a-zA-Z0-9]{8,}$/.test(searchVal)) {
      try {
        const res = await apiClient.get<any>(`${ENV.endpoints.mqttLog}/${searchVal}`);
        const logs: any = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : (res?.data?.data && Array.isArray(res.data.data) ? res.data.data : []));
        logs.paginate = { page: 1, page_size: logs.length, total: logs.length };
        return logs;
      } catch {
        // Fallback
      }
    }

    const requestedSize = params?.page_size || 50;
    const fetchChunk = async (p: any): Promise<Log[] & { paginate?: any }> => {
      try {
        const res = await apiClient.get<any>(ENV.endpoints.mqttLog, p);
        let logs: any = [];
        if (Array.isArray(res)) logs = res;
        else if (res?.data && Array.isArray(res.data)) logs = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) logs = res.data.data;
        else {
          const possibleArray = Object.values(res?.data || {}).find(val => Array.isArray(val));
          if (possibleArray) logs = possibleArray;
        }

        if (res && res.paginate) {
          logs.paginate = res.paginate;
        }
        return logs;
      } catch {
        // Silently ignore 404s
      }
      const emptyLogs: any = [];
      return emptyLogs;
    };

    if (requestedSize > 100) {
      const limit = 100;
      const pages = Math.ceil(requestedSize / limit);
      const promises = [];
      for (let i = 1; i <= pages; i++) {
        promises.push(fetchChunk({ ...params, page: i, page_size: limit }));
      }
      const results = await Promise.all(promises);
      const allLogs: any = results.flat();
      if (results[0] && results[0].paginate) {
        allLogs.paginate = {
          ...results[0].paginate,
          page_size: requestedSize,
        };
      }
      return allLogs.slice(0, requestedSize);
    }

    return await fetchChunk(params);
  },
  getLogsToday: async (params?: Record<string, unknown>): Promise<Log[]> => {
    const requestedSize = params?.page_size as number || 50;
    const fetchChunk = async (p: any): Promise<Log[] & { paginate?: any }> => {
      try {
        const res = await apiClient.get<any>(ENV.endpoints.mqttLogToday, p);
        let logs: any = [];
        if (Array.isArray(res)) logs = res;
        else {
          const logsData = res?.data?.data || res?.data?.logs || res?.data || res || [];
          logs = Array.isArray(logsData) ? logsData : [];
        }

        if (res && res.paginate) {
          logs.paginate = res.paginate;
        }
        return logs;
      } catch {
        // Silently ignore 404s
      }
      const emptyLogs: any = [];
      return emptyLogs;
    };

    if (requestedSize > 100) {
      const limit = 100;
      const pages = Math.ceil(requestedSize / limit);
      const promises = [];
      for (let i = 1; i <= pages; i++) {
        promises.push(fetchChunk({ ...params, page: i, page_size: limit }));
      }
      const results = await Promise.all(promises);
      const allLogs: any = results.flat();
      if (results[0] && results[0].paginate) {
        allLogs.paginate = {
          ...results[0].paginate,
          page_size: requestedSize,
        };
      }
      return allLogs.slice(0, requestedSize);
    }

    return await fetchChunk(params);
  },
  republish: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Berhasil re-publish MQTT untuk perangkat ${deviceId}` });
      }, 800);
    });
  },
  exportCsv: async (options: {
    type: 'mqtt-log' | 'mqtt-only';
    filterBy: 'date' | 'device';
    from?: string;
    to?: string;
    deviceId?: string;
    logs?: Log[];
  }): Promise<Blob> => {
    // Client-side CSV generation only since we need complex custom logic
    let rows = options.logs ?? [];

    if (options.filterBy === 'device' && options.deviceId) {
      rows = rows.filter(r => r.device_id === options.deviceId);
      // add capture_index (chronological) and capture_count
      const total = rows.length;
      rows = rows.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
        .map((r, i) => ({ ...r, capture_index: i + 1, capture_count: total }));
    } else if (options.filterBy === 'date' && options.from && options.to) {
      rows = rows.filter(r => {
        const d = r.created_at?.split(' ')[0] || '';
        return d >= options.from! && d <= options.to!;
      });
    }
    const headersMqttOnly = [
      'No', 'Device ID', 'Company', 'OCR', 'OCR Confidence',
      'Model', 'Area', 'Rotation', 'Battery', 'Battery Gateway',
      'Voltage Bat 1', 'Voltage Bat 2', 'Temperature', 'Firmware', 'Version',
      'No Segel', 'Seri Meter', 'Custom', 'Timestamp', 'Created At',
      ...(options.filterBy === 'device' ? ['Capture Index', 'Total Capture'] : [])
    ];

    const headersMqttLog = [
      'No', 'Device ID', 'Company', 'Topic', 'Message', 'OCR', 'OCR Confidence',
      'Model', 'Area', 'Rotation', 'Battery', 'Battery Gateway',
      'Voltage Bat 1', 'Voltage Bat 2', 'Temperature', 'Firmware', 'Version',
      'No Segel', 'Seri Meter', 'Custom', 'Timestamp', 'Created At',
      ...(options.filterBy === 'device' ? ['Capture Index', 'Total Capture'] : [])
    ];

    const headers = options.type === 'mqtt-only' ? headersMqttOnly : headersMqttLog;

    const escape = (v: any) => {
      if (v === undefined || v === null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const lines = [
      headers.join(','),
      ...rows.map((r: any, i: number) => {
        const baseData = [
          i + 1,
          r.device_id,
          r.company?.name ?? '',
        ];

        if (options.type === 'mqtt-log') {
          baseData.push(r.topic ?? '', r.message ?? '');
        }

        baseData.push(
          r.ocr,
          r.ocr_confidence,
          r.model,
          r.area,
          r.adjust_rotation,
          r.battery,
          r.battery_gateway,
          r.voltage_battery1,
          r.voltage_battery2,
          r.temperature,
          r.firmware,
          r.version,
          r.no_segel,
          r.seri_meter,
          r.custom,
          r.timestamp,
          r.created_at
        );

        if (options.filterBy === 'device') {
          baseData.push(r.capture_index, r.capture_count);
        }

        return baseData.map(escape).join(',');
      })
    ];

    return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  }
};
