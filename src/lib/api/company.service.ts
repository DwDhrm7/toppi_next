import { MOCK_DB } from "./db.mock";

export interface Company {
  id: number;
  name: string;
  status: string;
  date: string;
  phone: string;
  address: string;
}

export const CompanyService = {
  getCompanies: async (): Promise<Company[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DB.companies]), 300));
  },
  createCompany: async (company: Omit<Company, "id" | "date">): Promise<Company> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany: Company = {
          ...company,
          id: Math.max(...MOCK_DB.companies.map(c => c.id), 0) + 1,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        MOCK_DB.companies.push(newCompany);
        resolve(newCompany);
      }, 300);
    });
  },
  deleteCompany: async (id: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_DB.companies = MOCK_DB.companies.filter(c => c.id !== id);
        resolve();
      }, 300);
    });
  }
};
