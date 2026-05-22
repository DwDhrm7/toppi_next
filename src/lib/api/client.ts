/**
 * Utility class untuk menangani request API ke backend.
 * Akan secara otomatis menyisipkan Authorization Header (Bearer Token)
 * dari localStorage, dan mengatur Base URL berdasarkan Environment.
 */

import { ENV } from "../env";
import { CONSTANTS } from "../constants";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

export const apiClient = {
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = new URL(`${ENV.apiUrl}/${endpoint.replace(/^\//, '')}`);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Ambil token dari local storage (Catatan: untuk Next.js App Router murni SSR, gunakan Cookies)
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem(CONSTANTS.TOKEN_KEY) || "";
    }

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    // Auto-logout jika token expired (401)
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(CONSTANTS.TOKEN_KEY);
      localStorage.removeItem(CONSTANTS.USER_KEY);
      localStorage.removeItem(CONSTANTS.ROLE_KEY);
      window.location.href = "/login";
      throw new Error("Sesi telah berakhir. Silakan login kembali.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Terjadi kesalahan pada server");
    }

    return data as T;
  },

  get<T>(endpoint: string, params?: FetchOptions["params"], options?: Omit<FetchOptions, "method" | "params">) {
    return this.fetch<T>(endpoint, { method: "GET", params, ...options });
  },

  post<T>(endpoint: string, body: unknown, options?: Omit<FetchOptions, "method" | "body">) {
    return this.fetch<T>(endpoint, { method: "POST", body: JSON.stringify(body), ...options });
  },

  put<T>(endpoint: string, body: unknown, options?: Omit<FetchOptions, "method" | "body">) {
    return this.fetch<T>(endpoint, { method: "PUT", body: JSON.stringify(body), ...options });
  },

  delete<T>(endpoint: string, options?: Omit<FetchOptions, "method">) {
    return this.fetch<T>(endpoint, { method: "DELETE", ...options });
  },
};
