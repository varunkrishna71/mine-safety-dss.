export interface HazardDetail {
  id: string;
  name: string;
  categoryCode: string;
  icon: string;
  shortDescription: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  consequences: string[];
  safetyPrecautions: string[];
  recommendations: string[];
  matchedKeyword?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  mineLocation: string;
  date: string;
  shift: string;
  riskScore: number;
  safetyStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  statutoryForm: 'Form IV-A' | 'Form J' | 'Form K';
  hazardCount: number;
  hazards: HazardDetail[];
  alerts: string[];
  summary: string;
  reportText: string;
  timestamp?: string;
  sourceType?: string;
  fileName?: string;
  recommendations?: string[];
  documentMetadata?: {
    filename: string;
    file_format: string;
    file_size_bytes: number;
    file_size_formatted: string;
    total_pages?: number | null;
    extracted_character_count: number;
    extracted_word_count: number;
    quality_status: string;
    tables_extracted?: number | null;
  } | null;
}


export const SIX_HAZARDS: HazardDetail[] = [
  {
    id: 'methane-accumulation',
    name: 'Methane Accumulation',
    categoryCode: 'CMR-REG-166',
    icon: '🔥',
    shortDescription: 'Buildup of inflammable firedamp (CH4) gas in underground airways or face headings.',
    severity: 'CRITICAL',
    consequences: [
      'Violent firedamp explosion if ignited (5%–15% flammability range).',
      'Atmospheric oxygen displacement causing rapid asphyxiation of miners.',
      'Coal dust explosion propagation triggered by gas ignition.'
    ],
    safetyPrecautions: [
      'Continuous methanometer monitoring at return air roadways and working faces.',
      'Auxiliary ventilation velocity maintained strictly above 0.5 m/s.',
      'Mandatory withdrawal of workers if methane exceeds 1.25% in the general body of air.'
    ],
    recommendations: [
      'Check Main Mechanical Ventilator (MMV) water gauge and fan performance.',
      'Increase volumetric air quantity delivered to District 4B face.',
      'Inspect flameproof electrical apparatus enclosures in return airway.'
    ]
  },
  {
    id: 'roof-strata-instability',
    name: 'Roof/Strata Instability',
    categoryCode: 'CMR-REG-123',
    icon: '🪨',
    shortDescription: 'Deterioration of strata integrity, roof delamination, pot holes, or side spalling.',
    severity: 'HIGH',
    consequences: [
      'Major roof fall accidents causing fatal entrapment or crush injuries.',
      'Disruption of district ventilation due to airway blockage.',
      'Damage to continuous haulage conveyors and electrical substations.'
    ],
    safetyPrecautions: [
      'Strict adherence to Directorate-approved Systematic Support Rules (SSR).',
      'Daily torque testing of resin-grouted roof bolts (> 150 Nm torque target).',
      'Installation of tell-tale dual-height convergence indicators.'
    ],
    recommendations: [
      'Immediately implement Systematic Support Rules (SSR); install breaker props.',
      'Check resin bolt anchoring and perform pull-out tests.',
      'Erect temporary hydraulic props before clearing any fallen debris.'
    ]
  },
  {
    id: 'ventilation-failure',
    name: 'Ventilation Failure',
    categoryCode: 'CMR-REG-153',
    icon: '💨',
    shortDescription: 'Stoppage or impairment of main or auxiliary mechanical ventilation fans.',
    severity: 'HIGH',
    consequences: [
      'Rapid accumulation of noxious and inflammable gases in dead ends.',
      'Severe thermal stress and oxygen deficiency at coal cutting faces.',
      'Loss of statutory positive airflow required for dust extraction.'
    ],
    safetyPrecautions: [
      'Automated fan-stop interlocks on all face electrical power circuits.',
      'Dual electrical supply feeds for Main Mechanical Ventilators.',
      'Hourly inspection of auxiliary ducting for leaks or pinch points.'
    ],
    recommendations: [
      'Verify auxiliary fan positioning; ensure air velocity > 0.5 m/s at face.',
      'Inspect ventilation brattice cloths and air-crossing seals.',
      'Perform urgent electrical checks on the auxiliary fan starter panel.'
    ]
  },
  {
    id: 'respirable-dust',
    name: 'Respirable Dust',
    categoryCode: 'CMR-REG-143',
    icon: '🌫️',
    shortDescription: 'High concentrations of airborne coal and silica particulates in breathing zones.',
    severity: 'MEDIUM',
    consequences: [
      'Long-term occupational lung diseases: Coal Workers’ Pneumoconiosis & Silicosis.',
      'Severe loss of sightline visibility for operators of heavy earth-moving machinery.',
      'Secondary airborne coal dust explosion hazard.'
    ],
    safetyPrecautions: [
      'Routine gravimetric dust sampling per DGMS Technical Circular guidelines.',
      'High-pressure water sprays synchronized with shearer/miner drum engagement.',
      'Mandatory use of N95/FFP2 certified personal dust respirators.'
    ],
    recommendations: [
      'Enhance water infusion at the face; clean clogged spray nozzles.',
      'Ensure dry dust extractors and wet scrubbers are operational.',
      'Schedule deep roadway washing and stone dusting application.'
    ]
  },
  {
    id: 'water-inrush',
    name: 'Water Inrush',
    categoryCode: 'CMR-REG-148',
    icon: '🌊',
    shortDescription: 'Inundation risk from abandoned waterlogged old workings or surface water bodies.',
    severity: 'CRITICAL',
    consequences: [
      'Catastrophic flooding of active dip headings and pump stations.',
      'Sudden entrapment of underground workforce in submerged districts.',
      'Washing out of ventilation stoppings and structural barriers.'
    ],
    safetyPrecautions: [
      'Maintenance of statutory safety barriers against old unmapped workings (> 60m).',
      'Advance exploration boreholes drilled ahead of heading advance (> 30m).',
      'Telemetry monitoring of main sump water levels and backup dewatering capacity.'
    ],
    recommendations: [
      'Drill advance boreholes as per CMR 2017 Regulation 148; verify barrier thickness.',
      'Immediately halt heading advance until hydrogeological survey confirms dryness.',
      'Deploy auxiliary submersible dewatering pumps to district sump.'
    ]
  },
  {
    id: 'machinery-accident',
    name: 'Machinery Accident',
    categoryCode: 'CMR-REG-85',
    icon: '⚙️',
    shortDescription: 'Risks from heavy earth moving machinery (HEMM), haulage conveyors, or loader equipment.',
    severity: 'MEDIUM',
    consequences: [
      'Severe mechanical entanglement in unguarded conveyor return rollers.',
      'Collision injuries involving shuttle cars, dumpers, and pedestrians.',
      'High-pressure hydraulic hose burst or electrical flashover incidents.'
    ],
    safetyPrecautions: [
      'Full physical safety guarding along all moving belts and tail pulleys.',
      'Functioning Audio-Visual Alarms (AVA) and proximity detection sensors.',
      'Strict enforcement of "No-Go" pedestrian clearance zones.'
    ],
    recommendations: [
      'Enforce "No-Go" zones; inspect audio-visual alarms (AVA) on HEMM.',
      'Replace missing wire mesh guarding around conveyor drive drum.',
      'Conduct pre-shift mechanical brake and steering inspection on loaders.'
    ]
  }
];

export const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'REP-2026-001',
    title: 'District 4B - Gas Influx & Strata Spalling',
    mineLocation: 'Central Colliery Seam III',
    date: '2026-11-02',
    shift: 'Second Shift (14:00 - 22:00)',
    riskScore: 85,
    safetyStatus: 'HIGH',
    statutoryForm: 'Form IV-A',
    hazardCount: 3,
    hazards: [
      { ...SIX_HAZARDS[0], matchedKeyword: 'methane' },
      { ...SIX_HAZARDS[1], matchedKeyword: 'spalling' },
      { ...SIX_HAZARDS[2], matchedKeyword: 'auxiliary fan' }
    ],
    alerts: [
      'CRITICAL: Methane at 2.4% exceeds CMR 2017 evacuation limits!',
      'CRITICAL: Manual evacuation order detected in report.'
    ],
    summary: 'Analysis of District 4B report indicates HIGH risk. Immediate evacuation initiated and mandatory Form IV-A filing required under Regulation 166.',
    reportText: 'Methanometer sampling revealed 2.4% methane inflammable gas buildup at the return airway near face 3. Strata conditions are deteriorating; severe roof fall warning signs observed with visible side fall spalling along pillar 12. The auxiliary fan had an abrupt stoppage at 14:30 hrs, causing stagnant ventilation and air current reduction below statutory threshold. Immediate evacuation order given to withdrawal face crew until MMV adjustments are complete.'
  },
  {
    id: 'REP-2026-002',
    title: 'Section 2A - Haulage & Dust Hazard',
    mineLocation: 'South Bharat Deep Mine',
    date: '2026-10-30',
    shift: 'General Shift (08:00 - 16:00)',
    riskScore: 55,
    safetyStatus: 'MEDIUM',
    statutoryForm: 'Form J',
    hazardCount: 2,
    hazards: [
      { ...SIX_HAZARDS[3], matchedKeyword: 'coal dust' },
      { ...SIX_HAZARDS[5], matchedKeyword: 'conveyor' }
    ],
    alerts: [
      'DANGER: Respirable dust accumulation exceeds statutory 8-hour shift permissible exposure.'
    ],
    summary: 'Analysis indicates MEDIUM risk. High dust concentration and missing conveyor guard. Filing Form J register entry recommended.',
    reportText: 'Sampling conducted at continuous miner transfer point showed heavy airborne respirable dust and coal dust accumulation. Water spray nozzles at cutting drum were partially blocked; mist suppressors offline during second half of shift. On the main haulage belt conveyor, physical safety guarding was detached near drive head. Recommend servicing spray lines and reinstalling conveyor guarding.'
  },
  {
    id: 'REP-2026-003',
    title: 'Longwall Panel 01 - Compliant Routine',
    mineLocation: 'Singareni Seam V',
    date: '2026-10-28',
    shift: 'First Shift (06:00 - 14:00)',
    riskScore: 10,
    safetyStatus: 'LOW',
    statutoryForm: 'Form K',
    hazardCount: 0,
    hazards: [],
    alerts: [],
    summary: 'Analysis indicates LOW risk. All ventilation, gas, and strata parameters comply with CMR 2017 statutory guidelines. Standard Form K logging verified.',
    reportText: 'Adequate air circulation observed throughout travel roads. Air velocity measured at 0.85 m/s at tailgate. Multi-gas detector readings: 0.0% methane, 0 ppm CO, 20.8% O2. Powered support shields operating normally; hydraulic leg pressure steady. No strata spalling or convergence noticed. Dust suppression sprinklers fully operational with uniform water distribution. All machinery operating within safe limits.'
  },
  {
    id: 'REP-2026-004',
    title: 'North Barrier - Inundation Seepage',
    mineLocation: 'Rani Colliery Dip Section',
    date: '2026-10-25',
    shift: 'Third Shift (22:00 - 06:00)',
    riskScore: 90,
    safetyStatus: 'HIGH',
    statutoryForm: 'Form IV-A',
    hazardCount: 2,
    hazards: [
      { ...SIX_HAZARDS[4], matchedKeyword: 'water seepage' },
      { ...SIX_HAZARDS[1], matchedKeyword: 'roof fall' }
    ],
    alerts: [
      'CRITICAL: Water inrush seepage detected adjacent to unmapped waterlogged old workings.',
      'CRITICAL: Manual evacuation order detected in report.'
    ],
    summary: 'High water inrush danger and strata instability. Emergency evacuation executed. Statutory Form IV-A notification transmitted to DGMS Regional Inspector.',
    reportText: 'Significant water seepage detected through coal rib at junction 9, indicative of potential inundation risk from old workings. Advanced boreholes not completed ahead of heading progress. Dewatering and pumping capacity struggling to handle ingress. Emergency evacuation was declared by the Overman. Pumping crew deployed to stabilize sump levels; barrier thickness verification required before resuming work.'
  },
  {
    id: 'REP-2026-005',
    title: 'Shaft 2 Bottom - Auxiliary Fan Tripping',
    mineLocation: 'Western Coalfields District 1',
    date: '2026-10-21',
    shift: 'Second Shift',
    riskScore: 60,
    safetyStatus: 'MEDIUM',
    statutoryForm: 'Form J',
    hazardCount: 1,
    hazards: [
      { ...SIX_HAZARDS[2], matchedKeyword: 'fan stop' }
    ],
    alerts: [
      'DANGER: Methane at 1.30% requires immediate ventilation adjustment.'
    ],
    summary: 'Elevated methane and fan stoppage required prompt electrical restoration. Medium risk classified under Form J observation register.',
    reportText: 'Auxiliary fan stoppage occurred due to relay overload. Return airway velocity dropped to 0.2 m/s. Handheld methanometer registered 1.30% methane in localized roof cavity. Breaker reset and air restored within 35 minutes. Work paused until gas cleared.'
  }
];

export const DASHBOARD_STATS = {
  totalAnalyzed: 48,
  highRiskCount: 12,
  mediumRiskCount: 22,
  lowRiskCount: 14,
  highRiskPercentage: 25,
  mediumRiskPercentage: 46,
  lowRiskPercentage: 29
};
