import { MOCK_DB } from "./db.mock";

export interface Log {
  id: number;
  deviceId: string;
  company: string;
  status: "success" | "failed";
  flow: number;
  volume: number;
  temp: number | null;
  date: string;
  ocr: string;
  ocrConf: string;
  bat1: string;
  type: string;
  timestamp: string;

  // New synchronised fields from the old website
  model?: string;
  modelConf?: string;
  area?: string;
  rotationAdjust?: string;
  noSegel?: string;
  seriMeter?: string;
  bat2?: string;
  battery?: string;
  firmware?: string;
  version?: string;
  customData?: string;
  utc?: string;
  filename?: string;
  captTimestamp?: string;
  sysEntry?: string;
  image?: string;
}

export const LogService = {
  getLogs: async (): Promise<Log[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DB.logs]), 300));
  },
  createLog: async (log: Omit<Log, "id">): Promise<Log> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLog: Log = {
          ...log,
          id: Math.max(...MOCK_DB.logs.map(l => l.id), 0) + 1,
        };
        MOCK_DB.logs.push(newLog);
        resolve(newLog);
      }, 300);
    });
  }
};
