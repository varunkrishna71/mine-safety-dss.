export type HazardCategory =
  | 'Methane Accumulation'
  | 'Roof/Strata Instability'
  | 'Ventilation Failure'
  | 'Respirable Dust'
  | 'Water Inrush'
  | 'Machinery Accident';

export interface HazardRules {
  hazards: Record<HazardCategory, string[]>;
  recommendations: Record<HazardCategory, string>;
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskAnalysisResult {
  score: number;
  level: RiskLevel;
  icon: string;
  form: string;
  cleanedText: string;
  hazards: Record<string, string>;
  alerts: string[];
  reportName: string;
  wordFrequencies: { text: string; value: number }[];
}

export interface SampleReport {
  id: string;
  title: string;
  category: string;
  riskExpectation: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  text: string;
}
