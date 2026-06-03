import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceService } from "@/lib/api/device.service";
import { toast } from "sonner";

export const useDevices = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["devices"],
    queryFn: () => DeviceService.getDevices(),
  });

  const createMutation = useMutation({
    mutationFn: DeviceService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Perangkat berhasil ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan perangkat");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: DeviceService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Perangkat berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus perangkat");
    }
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
