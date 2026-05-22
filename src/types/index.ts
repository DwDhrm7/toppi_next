/**
 * Kontrak data dari backend (Device, Sensor, Setting)
 */

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

export interface Sensor {
  id: number;
  deviceId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}
