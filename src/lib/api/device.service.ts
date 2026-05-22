import { MOCK_DB } from "./db.mock";

export interface Device {
  id: number;
  deviceId: string;
  name: string;
  company: string;
  type: string;
  fw: string;
  conn: string;
  pn: string;
  sn: string;
  float: string;
  phone: string;
  created: string;
}

export const DeviceService = {
  getDevices: async (): Promise<Device[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DB.devices]), 300));
  },
  createDevice: async (device: Omit<Device, "id" | "created">): Promise<Device> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDevice: Device = {
          ...device,
          id: Math.max(...MOCK_DB.devices.map(d => d.id), 0) + 1,
          created: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        MOCK_DB.devices.push(newDevice);
        resolve(newDevice);
      }, 300);
    });
  },
  deleteDevice: async (id: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_DB.devices = MOCK_DB.devices.filter(d => d.id !== id);
        resolve();
      }, 300);
    });
  }
};
