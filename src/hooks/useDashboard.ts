import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../lib/api/dashboard.service";

export const useDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: dashboardService.getSummary,
  });

  return {
    summary: data?.data || { toppi: 0, customer: 0 },
    isLoading,
    error,
  };
};
