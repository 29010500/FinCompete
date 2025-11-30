export interface FinancialMetrics {
  name: string;
  ticker: string;
  price: string;
  marketCap: string;
  roe: string;
  roic: string;
  evEbit: string;
  per: string;
  fcfPerShare: string;
  beta: string;
  ke: string; // Cost of Equity
  kd: string; // Cost of Debt
  wacc: string; // Weighted Average Cost of Capital
}

export interface AnalysisResult {
  companies: FinancialMetrics[];
  sources: Array<{ title: string; uri: string }>;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}