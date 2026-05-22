/**
 * Custom hook for authentication using TanStack Query and Zustand.
 * Acts as the bridge between UI components and backend services.
 */
import { useMutation } from "@tanstack/react-query";
import { authService, LoginCredentials, AuthResponse } from "../lib/api/auth.service";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => {
      // MOCK logic specifically for the Demo login requirements without actually hitting API yet
      if ((credentials.login === "admin@toppi.com" || credentials.login === "admin@demo.com") && credentials.password === "admin") {
         return Promise.resolve({
           fullname: "Admin Demo",
           role: "Superadmin",
           access_token: "mock-token-12345"
         } as AuthResponse);
      }
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      const d = data.data || data;
      const username = d.fullname || d.username || "User";
      const role = d.role || "Operator";
      const token = d.access_token || "";
      
      setAuth(username, role, token);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
    }
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};
