# Mine Safety DSS - Python Backend & REST API Layer

Production-ready **FastAPI** backend service for the **Mine Safety Decision Support System (DSS)**. This service encapsulates natural language processing, automated document processing, statutory hazard classification, and Coal Mines Regulations (CMR 2017) risk assessment into high-performance RESTful API endpoints.

---

## 1. Architecture Overview

The backend orchestrates the domain modules and document processing pipeline without altering original regulatory logic:

```text
               CLIENT (Android / Web / Inspector CLI)
                                 │
                            HTTPS / JSON & Multipart
                                 ▼
                     FASTAPI REST APPLICATION
                     (backend/main.py & routes.py)
                                 │
                                 ▼
                          ANALYSIS SERVICE
                  (backend/services/analysis_service.py)
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
Document Processor       Hazard Classifier          Risk Scorer
(services.document_       (utils.hazard_classifier) (utils.risk_scorer)
 processor & utils)              │                        │
        │                        └──────────┬─────────────┘
        ▼                                   ▼
Text Quality Gate              DGMS Statutory Rules & Score
(PDF/DOCX/TXT Verify)          (assets/dgms_hazard_rules.json)
        │                                   │
        └────────────────────────┬──────────┘
                                 ▼
                     Structured JSON Response
                   (backend/schemas/analysis.py)
```

---

## 2. Directory Structure

```text
Mine_Safety_DSS/
│
├── app.py                             # Original Streamlit application (unmodified)
├── requirements.txt                   # Streamlit dependencies
├── assets/
│   └── dgms_hazard_rules.json         # Central hazard rule taxonomy & recommendations
├── utils/
│   ├── __init__.py
│   ├── text_preprocessor.py           # Multi-page PDF, DOCX tables & clean_text
│   ├── hazard_classifier.py           # Rule matching & CMR 2017 threshold alerts
│   └── risk_scorer.py                 # Arithmetic risk scoring & statutory form mapping
│
└── backend/
    ├── __init__.py
    ├── main.py                        # FastAPI initialization, CORS, exception handlers
    ├── standalone_server.py           # Standalone Python HTTP API server daemon
    ├── requirements.txt               # Backend dependencies (FastAPI, Uvicorn, Pydantic)
    ├── README.md                      # Backend operational & API documentation
    ├── api/
    │   ├── __init__.py
    │   └── routes.py                  # REST endpoints (/health, /analyze, /analyze-file)
    ├── services/
    │   ├── __init__.py
    │   ├── analysis_service.py        # Core orchestration service & caching
    │   └── document_processor.py      # Phase 5: PDF/DOCX/TXT validation & quality gate
    ├── schemas/
    │   ├── __init__.py
    │   └── analysis.py                # Pydantic models (AnalysisResponse, DocumentMetadata)
    └── tests/
        ├── __init__.py
        ├── test_api.py                # API and risk scoring tests (6 tests)
        └── test_document_processing.py# Document pipeline & consistency tests (9 tests)
```

---

## 3. Automated Document Processing Pipeline (Phase 5)

The document processing pipeline (`backend/services/document_processor.py`) guarantees that report files are validated, extracted, and evaluated with safety-grade reliability:

### A. Document Validation & Security
1. **Magic Bytes Verification:**
   - **PDF:** Validates `%PDF-` signature within the first 1024 bytes.
   - **DOCX:** Validates standard ZIP headers `PK\x03\x04`.
   - **TXT:** Scans for null byte characters (`\x00`) to reject renamed binary executables.
2. **File Size Enforcement:** Rejects documents exceeding 10MB (`HTTP 413 Payload Too Large`).
3. **Empty File Detection:** Rejects 0-byte uploads (`HTTP 400 Bad Request`).

### B. Multi-Modal Text Extraction
1. **Multi-Page PDFs:** Iterates through all pages, extracts text streams, handles empty pages, preserves paragraph separation with newlines, and catches password encryption.
2. **DOCX Documents with Tables:** Extracts standard paragraphs and iterates through table cells (`doc.tables`) to capture gas readings and tabular inspection logs. Includes XML package fallback parser.
3. **Plain Text Documents:** Robust encoding resolution (UTF-8 with BOM, standard UTF-8, Latin-1, and CP1252) with newline normalization.

### C. Text Extraction Quality Gate
- **Empty / Whitespace Check:** Rejects unreadable extractions immediately.
- **Scanned Image Detection:** For PDFs with zero readable characters, returns an explicit advisory:  
  `"No readable text extracted. Document appears to be a scanned image and requires Optical Character Recognition (OCR)."`
- **Minimum Word/Length Gate:** Requires at least 3 words and 15 characters to prevent false positive evaluations on blank pages.
- **Printable Character Ratio:** Rejects corrupted fonts or binary noise if printable ratio $< 75\%$.

### D. Analysis Consistency
The underlying Python safety analysis pipeline is identical across all modalities. Submitting an identical report via manual text, PDF, DOCX, or TXT produces the exact same:
- Composite Risk Score
- Safety Status (`HIGH`, `MEDIUM`, `LOW`)
- Statutory Form (`Form IV-A`, `Form J`, `Form K`)
- Hazard Counts & Keywords
- CMR 2017 Threshold Alerts

---

## 4. API Endpoints Reference

### 1. Health Check
- **Endpoint:** `GET /health`
- **Response:**
```json
{
  "status": "healthy",
  "application": "Mine Safety DSS",
  "version": "1.0.0",
  "message": "Backend is running successfully"
}
```

### 2. Manual Incident Analysis
- **Endpoint:** `POST /api/v1/analyze`
- **Payload:** `{"incident_text": "...", "report_name": "..."}`

### 3. Document Upload and Analysis
- **Endpoint:** `POST /api/v1/analyze-file`
- **Content-Type:** `multipart/form-data`
- **Supported Formats:** `.pdf`, `.docx`, `.txt`
- **Example Response with Document Metadata:**
```json
{
  "status": "success",
  "request_id": "d4f8f522-2594-45a7-91f1-e0ed6236105c",
  "source_type": "uploaded_file",
  "report_name": "District_4B_Audit.pdf",
  "cleaned_text_sample": "methanometer sampling at tailgate recorded 2.4% methane inflammable gas buildup and auxiliary fan stop...",
  "risk_assessment": {
    "risk_score": 95,
    "safety_status": "HIGH",
    "status_icon": "🔴",
    "statutory_form": "Form IV-A"
  },
  "hazard_count": 3,
  "detected_hazards": [
    {
      "category": "Methane Accumulation",
      "matched_keyword": "methane",
      "recommendation": "Check Main Mechanical Ventilator (MMV) water gauge; increase air quantity in the district."
    },
    {
      "category": "Ventilation Failure",
      "matched_keyword": "fan stop",
      "recommendation": "Verify auxiliary fan positioning; ensure air velocity > 0.5 m/s at face."
    }
  ],
  "alerts": [
    "CRITICAL: Methane at 2.4% exceeds CMR 2017 evacuation limits!"
  ],
  "recommendations": [
    "Methane Accumulation: Check Main Mechanical Ventilator (MMV) water gauge; increase air quantity in the district.",
    "Ventilation Failure: Verify auxiliary fan positioning; ensure air velocity > 0.5 m/s at face."
  ],
  "summary": "Analysis of District_4B_Audit.pdf indicates HIGH risk. Filing Form IV-A is recommended under CMR 2017.",
  "document_metadata": {
    "filename": "District_4B_Audit.pdf",
    "file_format": "PDF",
    "file_size_bytes": 184320,
    "file_size_formatted": "180.0 KB",
    "total_pages": 3,
    "extracted_character_count": 1420,
    "extracted_word_count": 218,
    "quality_status": "VERIFIED",
    "tables_extracted": null
  }
}
```

---

## 5. Automated Testing

Run the automated test suite discovering all unit tests:
```bash
python3 -m unittest discover backend/tests
```

**Test Execution Output:**
```text
...............
----------------------------------------------------------------------
Ran 15 tests in 0.005s

OK
```
- **6 tests in `test_api.py`:** Rules caching, critical methane, medium risk, compliant shift, empty text rejection, taxonomy coverage.
- **9 tests in `test_document_processing.py`:** PDF/DOCX/TXT header validation, corrupted PDF/DOCX rejection, unsupported file rejection, scanned image OCR detection, quality gate length check, DOCX table extraction, encoding resilience, and analysis consistency across modalities.
