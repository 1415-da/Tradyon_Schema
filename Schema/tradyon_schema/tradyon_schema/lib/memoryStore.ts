import { CompanyData } from './store/companyStore';

// Global in-memory storage for server-side operations
// Note: This resets on server restart, which is fine for this use case
class MemoryStore {
  private companies: Map<string, CompanyData> = new Map();

  setCompany(companyName: string, data: CompanyData): void {
    this.companies.set(companyName.toLowerCase(), data);
  }

  getCompany(companyName: string): CompanyData | undefined {
    return this.companies.get(companyName.toLowerCase());
  }

  updateCompany(companyName: string, updater: (data: CompanyData) => CompanyData): boolean {
    const current = this.getCompany(companyName);
    if (!current) return false;

    const updated = updater(current);
    this.setCompany(companyName, updated);
    return true;
  }

  deleteCompany(companyName: string): boolean {
    return this.companies.delete(companyName.toLowerCase());
  }

  getAllCompanies(): CompanyData[] {
    return Array.from(this.companies.values());
  }

  clear(): void {
    this.companies.clear();
  }
}

// Export singleton instance
export const memoryStore = new MemoryStore();
