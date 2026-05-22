import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogService } from "@/lib/api/log.service";

export const useLogs = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["logs"],
    queryFn: LogService.getLogs,
  });

  const createMutation = useMutation({
    mutationFn: LogService.createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
