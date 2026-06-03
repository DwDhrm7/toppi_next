import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { MqttService } from "@/lib/api/mqtt.service";

export const useMqtt = (queryParams?: Record<string, unknown>) => {
  const queryLogs = useQuery({
    queryKey: ["mqttLogs", queryParams],
    queryFn: () => MqttService.getLogs({ sequences: "desc", order: "created_at", page: 1, page_size: 100, ...queryParams }),
    placeholderData: keepPreviousData,
  });

  const queryToday = useQuery({
    queryKey: ["mqttLogsToday", queryParams],
    queryFn: () => MqttService.getLogsToday({ sequences: "desc", order: "created_at", page: 1, page_size: 100, ...queryParams }),
    placeholderData: keepPreviousData,
  });
  const republishMutation = useMutation({
    mutationFn: MqttService.republish,
  });

  const exportMutation = useMutation({
    mutationFn: (options: {
      type: 'mqtt-log' | 'mqtt-only';
      filterBy: 'date' | 'device';
      from?: string;
      to?: string;
      deviceId?: string;
      logs?: any[];
    }) => MqttService.exportCsv(options),
  });

  return {
    republish: republishMutation.mutateAsync,
    isRepublishing: republishMutation.isPending,
    exportCsv: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending,
    logs: queryLogs.data ?? [],
    paginate: (queryLogs.data as any)?.paginate,
    isLoadingLogs: queryLogs.isLoading,
    logsToday: queryToday.data ?? [],
    paginateToday: (queryToday.data as any)?.paginate,
    isLoadingToday: queryToday.isLoading,
  };
};
