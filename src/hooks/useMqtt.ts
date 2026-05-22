import { useMutation } from "@tanstack/react-query";
import { MqttService } from "@/lib/api/mqtt.service";

export const useMqtt = () => {
  const republishMutation = useMutation({
    mutationFn: MqttService.republish,
  });

  const exportMutation = useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => MqttService.exportCsv(from, to),
  });

  return {
    republish: republishMutation.mutateAsync,
    isRepublishing: republishMutation.isPending,
    exportCsv: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending,
  };
};
