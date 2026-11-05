import { RiskLevel } from '../types';

export interface CalculatedRisk {
  score: number;
  level: RiskLevel;
  icon: string;
  form: string;
  formDescription: string;
}

export function calculateRisk(
  hazards: Record<string, string>,
  alerts: string[]
): CalculatedRisk {
  let score = 0; // Fresh start

  const hazardCount = Object.keys(hazards).length;
  score += hazardCount * 15;

  for (const alert of alerts) {
    if (alert.includes('CRITICAL')) {
      score += 50;
    } else if (alert.includes('DANGER')) {
      score += 30;
    }
  }

  score = Math.min(score, 100);

  // If it's a safe report (Case 3), force it below 20
  if (hazardCount === 0 && alerts.length === 0) {
    score = 10;
  }

  if (score >= 70) {
    return {
      score,
      level: 'HIGH',
      icon: '🔴',
      form: 'Form IV-A',
      formDescription: 'Dangerous Occurrence / Major Hazard Notice (CMR 2017 Reg 166/8)'
    };
  } else if (score >= 35) {
    return {
      score,
      level: 'MEDIUM',
      icon: '🟡',
      form: 'Form J',
      formDescription: 'Register of Minor Accidents & Inspection Observations'
    };
  } else {
    return {
      score,
      level: 'LOW',
      icon: '🟢',
      form: 'Form K',
      formDescription: 'Routine Shift Safety & Safety Committee Record'
    };
  }
}
