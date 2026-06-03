import { apiClient } from "./client";
import { ENV } from "../env";

export interface Log {
  id: string | number;
  device_id?: string;
  customer_id?: string;
  ocr?: string;
  ocr_confidence?: string;
  battery?: string;
  voltage_battery1?: string;
  voltage_battery2?: string;
  volume_from_meter?: string;
  temperature?: string;
  humidity?: string;
  water_temperature?: string;
  valve_status?: string;
  magnetic_status?: string;
  leak_status?: string;
  rtc_error?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  message?: any;
  timestamp?: string;
  area?: string;
  adjust_rotation?: number;
  version?: string;
  model_confidence?: number | string;
  no_segel?: string;
  seri_meter?: string;
  number_digit?: string | number;
  number_decimal?: string | number;
  custom?: string;
  battery_gateway?: number | string;
  firmware?: string;
  company_id?: string;
  customer?: { name?: string };
  toppi?: any;
  company?: { name?: string };
  model?: string;
  topic?: string;
}

export const LogService = {
  getLogs: async (params?: { page?: number; page_size?: number; order?: string; sequences?: string; search?: string; q?: string }): Promise<Log[]> => {
    const searchVal = params?.search || params?.q;
    if (searchVal && /^[a-zA-Z0-9]{8,}$/.test(searchVal)) {
      try {
        const res = await apiClient.get<any>(`${ENV.endpoints.toppiLog}/${searchVal}`);
        const data = res?.data || res;
        if (data && (data.device_id || data.id)) {
          const logsArray: any = [data];
          logsArray.paginate = { page: 1, page_size: 1, total: 1 };
          return logsArray;
        }
      } catch {
        // Fallback to normal logging query if specific lookup fails
      }
    }

    const requestedSize = params?.page_size || 50;
    const fetchChunk = async (p: any): Promise<Log[] & { paginate?: any }> => {
      try {
        const res = await apiClient.get<any>(ENV.endpoints.toppiLog, p);
        let logs: any = [];
        if (Array.isArray(res)) logs = res;
        else if (res?.data && Array.isArray(res.data)) logs = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) logs = res.data.data;
        else if (res?.data?.toppi_logs && Array.isArray(res.data.toppi_logs)) logs = res.data.toppi_logs;
        else {
          const possibleArray = Object.values(res?.data || {}).find(val => Array.isArray(val));
          if (possibleArray) logs = possibleArray;
        }

        if (res && res.paginate) {
          logs.paginate = res.paginate;
        }
        return logs;
      } catch {
        // Silently ignore 404s which happen when paginating past the end
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
  createLog: async (log: Omit<Log, "id">): Promise<Log> => {
    return apiClient.post<Log>(ENV.endpoints.toppiLog, log);
  },
  getLogsMobile: async (): Promise<Log[]> => {
    const res = await apiClient.get<any>(ENV.endpoints.toppiLogMobile);
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  }
};
