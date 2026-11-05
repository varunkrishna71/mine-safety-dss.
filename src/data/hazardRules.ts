import { HazardRules } from '../types';

export const DGMS_HAZARD_RULES: HazardRules = {
  hazards: {
    "Methane Accumulation": ["methane", "ch4", "inflammable gas", "firedamp", "gas buildup"],
    "Roof/Strata Instability": ["roof fall", "side fall", "spalling", "strata", "pot hole", "support failure"],
    "Ventilation Failure": ["ventilation", "fan stop", "air current", "stoppage", "auxiliary fan", "stagnant"],
    "Respirable Dust": ["dust", "coal dust", "silica", "sampling", "water spray", "mist"],
    "Water Inrush": ["water", "seepage", "inundation", "old workings", "pumping", "dewatering"],
    "Machinery Accident": ["haulage", "conveyor", "dumper", "shovels", "guarding", "sdl", "ldt"]
  },
  recommendations: {
    "Methane Accumulation": "Check Main Mechanical Ventilator (MMV) water gauge; increase air quantity in the district.",
    "Roof/Strata Instability": "Immediately implement Systematic Support Rules (SSR); check roof bolt torque.",
    "Ventilation Failure": "Verify auxiliary fan positioning; ensure air velocity > 0.5 m/s at face.",
    "Respirable Dust": "Enhance water infusion at the face; ensure dust extractors are operational.",
    "Water Inrush": "Drill advance boreholes as per CMR 2017; verify barrier thickness.",
    "Machinery Accident": "Enforce 'No-Go' zones; inspect audio-visual alarms (AVA) on HEMM."
  }
};

export const SAMPLE_REPORTS = [
  {
    id: 'case-1-critical-methane',
    title: 'District 4B - Gas Influx & Strata Spalling',
    category: 'Underground Coal Mine',
    riskExpectation: 'HIGH' as const,
    description: 'High methane accumulation detected with roof spalling and auxiliary fan stoppage.',
    text: `INSPECTION REPORT: Underground Working District 4B (Panel C)
Date: 2026-10-18 | Shift: Second Shift
Inspected by: Safety Officer K. Verma (DGMS Certified)

Observations:
1. Methanometer sampling revealed 2.4% methane inflammable gas buildup at the return airway near face 3.
2. Strata conditions are deteriorating; severe roof fall warning signs observed with visible side fall spalling along pillar 12.
3. The auxiliary fan had an abrupt stoppage at 14:30 hrs, causing stagnant ventilation and air current reduction below statutory threshold.
4. Immediate evacuation order given to withdrawal face crew until MMV adjustments are complete.

Form IV-A statutory notification initiated under CMR 2017 Regulation 166.`
  },
  {
    id: 'case-2-respirable-dust',
    title: 'District 2A - Haulage & Dust Hazard',
    category: 'Continuous Miner Section',
    riskExpectation: 'MEDIUM' as const,
    description: 'Respirable coal dust exceeding threshold, water spray clogged, missing conveyor guarding.',
    text: `WEEKLY SAFETY SURVEILLANCE REPORT: Section 2A
Mine: Central Colliery Seam III

Findings:
- Sampling conducted at continuous miner transfer point showed heavy airborne respirable dust and coal dust accumulation.
- Water spray nozzles at cutting drum were partially blocked; mist suppressors offline during second half of shift.
- On the main haulage belt conveyor, physical safety guarding was detached near drive head.
- Recommend servicing spray lines and reinstalling conveyor guarding prior to next production cycle.`
  },
  {
    id: 'case-3-safe-routine',
    title: 'Seam 5 - Regular Compliant Inspection',
    category: 'Longwall Panel',
    riskExpectation: 'LOW' as const,
    description: 'All statutory parameters compliant. Normal ventilation, zero inflammable gas detected.',
    text: `ROUTINE STATUTORY SHIFT INSPECTION REPORT
Section: Longwall Panel 01
Date: 2026-11-01

Summary:
- Adequate air circulation observed throughout travel roads. Air velocity measured at 0.85 m/s at tailgate.
- Multi-gas detector readings: 0.0% methane, 0 ppm CO, 20.8% O2.
- Powered support shields operating normally; hydraulic leg pressure steady. No strata spalling or convergence noticed.
- Dust suppression sprinklers fully operational with uniform water distribution.
- All machinery operating within safe limits. Overall working environment safe and compliant with Coal Mines Regulations.`
  },
  {
    id: 'case-4-water-inrush-evacuation',
    title: 'Panel North - Old Workings Water Inrush Risk',
    category: 'Depillaring Section',
    riskExpectation: 'HIGH' as const,
    description: 'Active water seepage near unmapped old workings, manual evacuation declared.',
    text: `SPECIAL HAZARD AUDIT: North Barrier District
Seam: Zero Seam (Adjoining Abandoned 1978 Colliery)

Critical Observations:
1. Significant water seepage detected through coal rib at junction 9, indicative of potential inundation risk from old workings.
2. Advanced boreholes not completed ahead of heading progress. Dewatering and pumping capacity struggling to handle ingress.
3. Because of risk of water inrush, emergency emergency manual evacuation order was declared by the Overman.
4. Pumping crew deployed to stabilize sump levels; barrier thickness verification required before resuming work.`
  }
];
