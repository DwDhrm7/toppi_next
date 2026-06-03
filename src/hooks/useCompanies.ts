import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyService } from "@/lib/api/company.service";
import { toast } from "sonner";

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["companies"],
    queryFn: () => CompanyService.getCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: CompanyService.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Perusahaan berhasil ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan perusahaan");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CompanyService.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Perusahaan berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus perusahaan");
    }
  });

  return {
    companies: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createCompany: createMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
