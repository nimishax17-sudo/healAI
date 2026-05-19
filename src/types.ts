export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  date: string;
}

export interface HealthValue {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: "Normal" | "Abnormal" | "Critical";
}

export interface RiskProfile {
  level: "Low" | "Moderate" | "High";
  description: string;
  factors: string[];
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface AnalysisResult {
  patientInfo: PatientInfo;
  values: HealthValue[];
  summary: string;
  abnormalities: Array<{ finding: string; meaning: string }>;
  recommendations: string[];
  riskProfile: RiskProfile;
  charts: {
    type: "bar" | "pie";
    data: ChartData[];
  };
  note: string;
}

export interface VitalData {
  bp: string;
  pulse: string;
  oxygen: string;
  sleep: string;
}

export interface PredictionResult {
  possibleConditions: Array<{
    condition: string;
    probability: "Low" | "Medium" | "High";
    reason: string;
  }>;
  riskLevel: "Normal" | "Warning" | "Emergency";
  actionPlan: string;
  doctorNote: string;
  dietAdvice: string;
  emergencyAlert: boolean;
}

export interface HealthHistoryEntry {
  id: string;
  timestamp: number;
  type: "Report" | "Prediction";
  data: AnalysisResult | PredictionResult;
  vitals?: VitalData;
}
