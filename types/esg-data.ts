export interface ESGData {
  id?: string;
  company_name: string;
  reporting_year: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e?: number;
  energy_consumption_kwh?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
