import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { ENV } from "../env";
import { CONSTANTS } from "../constants";

type FetchOptions = AxiosRequestConfig & {
  params?: Record<string, string | number | boolean>;
};

// Konfigurasi instance axios
const axiosInstance = axios.create({
  baseURL: ENV.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor untuk menyisipkan token
axiosInstance.interceptors.request.use(
  (config) => {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem(CONSTANTS.TOKEN_KEY) || "";
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle auto-logout
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(CONSTANTS.TOKEN_KEY);
      localStorage.removeItem(CONSTANTS.USER_KEY);
      localStorage.removeItem(CONSTANTS.ROLE_KEY);
      window.location.href = "/login";
      return Promise.reject(new Error("Sesi telah berakhir. Silakan login kembali."));
    }
    let errorMessage = "Terjadi kesalahan pada server";
    if (!error.response && error.message === "Network Error") {
      errorMessage = "Gagal terhubung ke server (Network Error). Silakan periksa koneksi internet Anda atau server mungkin sedang tidak merespons.";
    } else {
      errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiClient = {
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const response = await axiosInstance({
      url: endpoint,
      ...options,
    });
    return response.data;
  },

  get<T>(endpoint: string, params?: FetchOptions["params"], options?: Omit<FetchOptions, "method" | "params">) {
    return this.fetch<T>(endpoint, { method: "GET", params, ...options });
  },

  post<T>(endpoint: string, data: unknown, options?: Omit<FetchOptions, "method" | "data">) {
    return this.fetch<T>(endpoint, { method: "POST", data, ...options });
  },

  put<T>(endpoint: string, data: unknown, options?: Omit<FetchOptions, "method" | "data">) {
    return this.fetch<T>(endpoint, { method: "PUT", data, ...options });
  },

  delete<T>(endpoint: string, options?: Omit<FetchOptions, "method">) {
    return this.fetch<T>(endpoint, { method: "DELETE", ...options });
  },
};
