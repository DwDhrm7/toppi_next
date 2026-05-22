import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceService } from "@/lib/api/device.service";

export const useDevices = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["devices"],
    queryFn: DeviceService.getDevices,
  });

  const createMutation = useMutation({
    mutationFn: DeviceService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: DeviceService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  return {
    devices: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createDevice: createMutation.mutateAsync,
    deleteDevice: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
