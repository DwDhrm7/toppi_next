import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { LogService } from "@/lib/api/log.service";
import { toast } from "sonner";

export const useLogs = (queryParams?: Record<string, unknown>) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["logs", queryParams],
    queryFn: () => LogService.getLogs({ sequences: "desc", order: "created_at", page: 1, page_size: 100, ...queryParams }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: LogService.createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("Log berhasil ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan log");
    }
  });

  return {
    logs: query.data ?? [],
    paginate: (query.data as any)?.paginate,
    isLoading: query.isLoading,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
