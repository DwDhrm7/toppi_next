/**
 * Global state management for Authentication using Zustand.
 */
import { create } from "zustand";
import { CONSTANTS } from "../lib/constants";

interface AuthState {
  username: string | null;
  role: string | null;
  token: string | null;
  setAuth: (username: string, role: string, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  username: typeof window !== "undefined" ? localStorage.getItem(CONSTANTS.USER_KEY) : null,
  role: typeof window !== "undefined" ? localStorage.getItem(CONSTANTS.ROLE_KEY) : null,
  token: typeof window !== "undefined" ? localStorage.getItem(CONSTANTS.TOKEN_KEY) : null,
  
  setAuth: (username, role, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONSTANTS.USER_KEY, username);
      localStorage.setItem(CONSTANTS.ROLE_KEY, role);
      localStorage.setItem(CONSTANTS.TOKEN_KEY, token);
    }
    set({ username, role, token });
  },
  
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CONSTANTS.USER_KEY);
      localStorage.removeItem(CONSTANTS.ROLE_KEY);
      localStorage.removeItem(CONSTANTS.TOKEN_KEY);
    }
    set({ username: null, role: null, token: null });
  },
}));
