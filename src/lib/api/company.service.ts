import { apiClient } from "./client";
import { ENV } from "../env";

export interface Company {
  id: string | number;
  customer_number?: string;
  name?: string;
  address?: string;
  phone?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export const CompanyService = {
  getCompanies: async (params?: { page?: number; size?: number }): Promise<Company[]> => {
    const res = await apiClient.get<any>(ENV.endpoints.company, params);
    
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    if (res?.data?.customers && Array.isArray(res.data.customers)) return res.data.customers;
    
    const possibleArray = Object.values(res?.data || {}).find(val => Array.isArray(val));
    if (possibleArray) return possibleArray as Company[];
    
    return [];
  },
  createCompany: async (company: Omit<Company, "id" | "created_at" | "updated_at">): Promise<Company> => {
    return apiClient.post<Company>(ENV.endpoints.company, company);
  },
  deleteCompany: async (id: string | number): Promise<void> => {
    return apiClient.delete<void>(`${ENV.endpoints.company}/${id}`);
  }
};
