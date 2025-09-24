import type { ReactNode } from "react";

export interface Appointment {
  id: string;
  date: Date;
  financialData: FinancialData;
}

export interface Client {
  id: string;
  name: string;
  dob?: Date;
  appointments: Appointment[];
  planData: PlanData;
}

export interface FinancialData {
  income: IncomeEntry[];
  assets: AssetEntry[];
  pensions: PensionEntry[];
}

export interface IncomeEntry {
  id:string;
  type: 'Reddito Netto' | 'Spesa Media' | 'Altro';
  description: string;
  amount: number;
}

export interface AssetEntry {
  id: string;
  type: 'Immobile' | 'Capitale Mobiliare' | 'Capitale in Consulenza' | 'Liquidità' | 'Liquidità in Consulenza' | 'Altro';
  description: string;
  details: string;
  amount: number;
  mortgage?: number;
}

export interface PensionEntry {
  id: string;
  type: 'Fondo Pensione' | 'TFR' | 'Assicurazione Vita' | 'Altro';
  description: string;
  amount: number;
}

export interface PlanData {
  annualReturn: number;
  minLiquidity: number;
  semesters: SemesterData[];
  externalAssetReturns?: { [assetId: string]: number };
}

// Represents an override for a specific semester/appointment
export interface SemesterData {
  id: string; // Can be appointment ID for historical or semester ID for future
  // FIX: Made 'change' property optional to match its usage pattern, where it might not be present for all semester overrides.
  change?: number; // For historical: change since last appointment. For future: change for the semester.
  savings?: number; // Only for future projections
  consultantLiquidityOverride?: number; // Only for future projections
  externalCapitalOverrides?: { [assetId: string]: number }; // For future projections
  portfolioOverride?: number; // For future projections
}


export interface ChartDataPoint {
  date: string;
  timestamp: number;
  generalLiquidity: number;
  consultantLiquidity: number;
  totalLiquidity: number;
  capitaleVersato: number;
  rendimenti: number;
  portafoglio: number;
  capitaleTotale: number;
  isProjection: boolean;
  periodChange?: number;
  periodSavings?: number;
  externalCapital: number; // For chart aggregation
  externalCapitalValues: { [assetId: string]: number }; // For table details
}

export interface IconProps {
    className?: string;
    children?: ReactNode;
}