import { HazardRules } from '../types';

/**
 * Detects hazard categories based on keyword rules.
 * Preserves exact logic from Python utils/hazard_classifier.py
 */
export function detectHazards(
  text: string,
  rules: HazardRules
): Record<string, string> {
  const detected: Record<string, string> = {};
  if (!text || text.trim().length < 10) {
    return detected;
  }

  const textLower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(rules.hazards)) {
    for (const kw of keywords) {
      if (textLower.includes(kw.toLowerCase())) {
        detected[category] = kw;
        break;
      }
    }
  }

  return detected;
}

/**
 * Detects critical threshold violations (e.g. Methane % in Coal Mines Regulations 2017)
 * and manual evacuation orders.
 * Preserves exact logic from Python utils/hazard_classifier.py
 */
export function detectSpecificThresholds(text: string): string[] {
  const alerts: string[] = [];
  if (!text) return alerts;

  const textLower = text.toLowerCase();

  // Methane patterns matching regex r"(\d+\.?\d*)\s*%\s*methane" or "methane[^\d]*(\d+\.?\d*)\s*%"
  const regexPattern1 = /(\d+\.?\d*)\s*%\s*(?:of\s*)?methane/gi;
  const regexPattern2 = /methane[^\d\n\r]{1,15}(\d+\.?\d*)\s*%/gi;

  const matches: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = regexPattern1.exec(textLower)) !== null) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) matches.push(val);
  }

  while ((match = regexPattern2.exec(textLower)) !== null) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) matches.push(val);
  }

  // Evaluate highest methane level detected
  if (matches.length > 0) {
    const maxVal = Math.max(...matches);
    if (maxVal > 2.0) {
      alerts.push(`CRITICAL: Methane at ${maxVal}% exceeds CMR 2017 evacuation limits!`);
    } else if (maxVal >= 1.25) {
      alerts.push(`DANGER: Methane at ${maxVal}% requires immediate ventilation adjustment.`);
    }
  }

  if (textLower.includes('evacuation') || textLower.includes('emergency')) {
    alerts.push('CRITICAL: Manual evacuation order detected in report.');
  }

  return alerts;
}
