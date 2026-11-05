# Mine Safety Decision Support System (Mine Safety DSS)

A decision support system for Directorate General of Mines Safety (DGMS) compliance and Coal Mines Regulations (CMR 2017) statutory hazard auditing. Rewritten as a modern React application.

## Overview

The Mine Safety DSS analyzes underground and opencast shift inspection reports, methanometer readings, strata observations, ventilation logs, and machinery audits using text mining and domain-specific rules.

### Key Capabilities

- **Hazard Classification**: Automatically detects occurrences of 6 statutory DGMS hazards:
  - Methane Accumulation (CH4, inflammable gas, firedamp)
  - Roof / Strata Instability (roof fall, spalling, support failure)
  - Ventilation Failure (fan stoppage, stagnant air current)
  - Respirable Dust (coal dust, silica, water spray deficit)
  - Water Inrush (seepage, inundation, old workings)
  - Machinery Accident (haulage, conveyor guarding, HEMM)
- **Threshold Detection**: Scans for statutory limits under CMR 2017 (e.g., Methane > 1.25% danger, > 2.0% evacuation limit) and emergency orders.
- **Risk Scoring**: Generates an authoritative score (0–100) and maps it to safety statuses:
  - **HIGH (🔴)**: Risk score ≥ 70 → Mandatory Form IV-A filing (Dangerous Occurrence / Accident Notice)
  - **MEDIUM (🟡)**: Risk score 35–69 → Form J register entry
  - **LOW (🟢)**: Risk score < 35 → Form K routine shift record
- **Visual Analytics**: Interactive hazard distribution bars and text-mining word cloud of key mining terms.
- **Recommendations**: Instant statutory directives under DGMS guidelines and one-click compliance summary copy.
- **Document Support**: Paste inspection text directly or upload PDF, DOCX, and TXT inspection dossiers.

## Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Document Processing**: Mammoth (DOCX) + PDF.js (PDF)

## Running Locally

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.
