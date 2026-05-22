/**
 * Auth Service
 * Responsible for handling all authentication-related API calls.
 */
import { apiClient } from "./client";
import { ENV } from "../env";

export interface LoginCredentials {
  login: string;
  password?: string;
}

export interface AuthResponse {
  data?: {
    fullname?: string;
    username?: string;
    role?: string;
    access_token?: string;
  };
  fullname?: string;
  username?: string;
  role?: string;
  access_token?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // This connects to the backend
    return apiClient.post<AuthResponse>(ENV.AUTH_ENDPOINT, credentials);
  },
};
