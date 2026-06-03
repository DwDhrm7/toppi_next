import { apiClient } from "./client";
import { ENV } from "../env";

export interface Device {
  id: string | number;
  device_id?: string;
  customer_id?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  production_no?: string;
  serial_no?: string;
  connectivity?: string;
  version?: number | string;
  type?: string;
  phone?: string;
  no_segel?: string;
  seri_meter?: string;
  company_id?: string;
  floating?: any;
  customer?: { name?: string; };
  company?: { name?: string; };
}

export const DeviceService = {
  getDevices: async (params?: { page?: number; size?: number }): Promise<Device[]> => {
    const res = await apiClient.get<any>(ENV.endpoints.toppi, params);
    
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    if (res?.data?.toppis && Array.isArray(res.data.toppis)) return res.data.toppis;
    
    const possibleArray = Object.values(res?.data || {}).find(val => Array.isArray(val));
    if (possibleArray) return possibleArray as Device[];
    
    return [];
  },
  createDevice: async (device: Omit<Device, "id" | "created_at" | "updated_at">): Promise<Device> => {
    return apiClient.post<Device>(ENV.endpoints.toppi, device);
  },
  deleteDevice: async (id: string | number): Promise<void> => {
    return apiClient.delete<void>(`${ENV.endpoints.toppi}/${id}`);
  }
};
