import { useQuery } from "@tanstack/react-query";
import { LogService } from "@/lib/api/log.service";

export const useLogsMobile = () => {
  const query = useQuery({
    queryKey: ["logsMobile"],
    queryFn: () => LogService.getLogsMobile(),
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
