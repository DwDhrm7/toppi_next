import { apiClient } from "./client";
import { ENV } from "../env";

export interface DashboardData {
  toppi: number;
  customer: number;
}

export const dashboardService = {
  getSummary: async (): Promise<{ data: DashboardData }> => {
    const res = await apiClient.get<any>(ENV.endpoints.dashboard);
    const dashboardData = res?.data?.data || res?.data || res || { toppi: 0, customer: 0, mqtt_success: 0, mqtt_failed: 0 };
    return { data: dashboardData as DashboardData };
  }
};
