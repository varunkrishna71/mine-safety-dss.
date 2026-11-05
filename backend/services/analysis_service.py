import os
import io
import json
import uuid
import logging
from typing import Dict, Any, Optional

try:
    from fastapi import UploadFile, HTTPException, status
except ImportError:
    # Lightweight compatibility adapter for standalone unit testing without FastAPI installed
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail
            super().__init__(detail)

    class status:
        HTTP_200_OK = 200
        HTTP_400_BAD_REQUEST = 400
        HTTP_413_REQUEST_ENTITY_TOO_LARGE = 413
        HTTP_415_UNSUPPORTED_MEDIA_TYPE = 415
        HTTP_422_UNPROCESSABLE_ENTITY = 422
        HTTP_500_INTERNAL_SERVER_ERROR = 500

    class UploadFile:
        def __init__(self, filename: str, file: Any = None):
            self.filename = filename
            self.file = file
        async def read(self):
            return self.file.read() if self.file else b""

# Import existing domain logic from utils
from utils.text_preprocessor import extract_text_from_pdf, extract_text_from_docx, clean_text
from utils.hazard_classifier import detect_hazards, detect_specific_thresholds
from utils.risk_scorer import calculate_risk

from backend.schemas.analysis import (
    AnalysisResponse,
    RiskAssessmentResponse,
    DetectedHazardItem,
    DocumentMetadata
)
from backend.services.document_processor import DocumentProcessor, format_file_size

logger = logging.getLogger("mine_safety_dss.service")

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB upload ceiling
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

class AnalysisService:
    """
    Central orchestration service reusing verified Python modules for
    hazard detection, threshold alerts, risk scoring, and document analysis.
    """
    _cached_rules: Optional[Dict[str, Any]] = None

    def __init__(self, rules_path: Optional[str] = None):
        if rules_path:
            self.rules_path = rules_path
        else:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.rules_path = os.path.join(base_dir, "assets", "dgms_hazard_rules.json")

    def get_rules(self) -> Dict[str, Any]:
        """
        Loads and caches hazard rules from dgms_hazard_rules.json in memory
        to avoid redundant disk I/O on every request.
        """
        if AnalysisService._cached_rules is not None:
            return AnalysisService._cached_rules

        if not os.path.exists(self.rules_path):
            logger.error(f"Hazard rules configuration file not found at: {self.rules_path}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"DGMS hazard rules configuration missing from {self.rules_path}"
            )

        try:
            with open(self.rules_path, "r", encoding="utf-8") as f:
                rules = json.load(f)
                AnalysisService._cached_rules = rules
                logger.info(f"Successfully loaded DGMS hazard rules from {self.rules_path}")
                return rules
        except Exception as e:
            logger.error(f"Error reading dgms_hazard_rules.json: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to parse DGMS hazard rules JSON."
            )

    def analyze_text(
        self,
        raw_text: str,
        report_name: str = "Manual_Report",
        source_type: str = "manual_text",
        document_metadata: Optional[DocumentMetadata] = None,
        user_id: Optional[str] = None
    ) -> AnalysisResponse:
        """
        Coordinates the complete NLP and safety evaluation pipeline:
        1. Validates input
        2. Cleans and normalizes text
        3. Detects hazard occurrences via dgms_hazard_rules
        4. Scans for specific threshold violations (methane %, evacuation orders)
        5. Computes composite risk score and statutory form
        6. Constructs and returns structured AnalysisResponse with document metadata & authenticated user ID
        """
        if not raw_text or not raw_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incident description text is empty."
            )

        rules = self.get_rules()

        # Step 1: Text Preprocessing using existing clean_text()
        cleaned = clean_text(raw_text)
        if len(cleaned.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provided text does not contain sufficient alphanumeric characters for evaluation."
            )

        # Step 2: Hazard Detection using existing detect_hazards()
        detected_dict = detect_hazards(cleaned, rules)

        # Step 3: Specific Threshold Detection using existing detect_specific_thresholds()
        alerts = detect_specific_thresholds(cleaned)

        # Step 4: Risk Scoring using existing calculate_risk()
        score, level, icon, form = calculate_risk(detected_dict, alerts)

        # Step 5: Format detected hazards and recommendations
        detected_hazards_list = []
        recommendations_list = []

        recommendations_dict = rules.get("recommendations", {})
        for category, matched_keyword in detected_dict.items():
            rec_text = recommendations_dict.get(category, "Follow Standard Safety Procedures.")
            detected_hazards_list.append(
                DetectedHazardItem(
                    category=category,
                    matched_keyword=matched_keyword,
                    recommendation=rec_text
                )
            )
            recommendations_list.append(f"{category}: {rec_text}")

        # Summary directive matching original Streamlit app
        summary = (
            f"Analysis of {report_name} indicates {level} risk. "
            f"Filing {form} is recommended under CMR 2017."
        )

        return AnalysisResponse(
            status="success",
            request_id=str(uuid.uuid4()),
            source_type=source_type,
            report_name=report_name,
            cleaned_text_sample=cleaned[:250] + ("..." if len(cleaned) > 250 else ""),
            risk_assessment=RiskAssessmentResponse(
                risk_score=score,
                safety_status=level,
                status_icon=icon,
                statutory_form=form
            ),
            hazard_count=len(detected_dict),
            detected_hazards=detected_hazards_list,
            alerts=alerts,
            recommendations=recommendations_list,
            summary=summary,
            document_metadata=document_metadata,
            authenticated_user_id=user_id
        )

    async def extract_and_analyze_file(self, file: UploadFile, user_id: Optional[str] = None) -> AnalysisResponse:
        """
        Executes complete automated document processing pipeline (Phase 5):
        1. Validates file header, magic bytes, and size
        2. Extracts text from PDF, DOCX (with tables), or TXT
        3. Enforces text extraction quality gate
        4. Compiles document metadata metrics
        5. Evaluates through the unified hazard detection & risk scoring engine
        """
        filename = file.filename or "Uploaded_Document"

        # 1. Read Contents
        try:
            contents = await file.read()
        except Exception as e:
            logger.error(f"Failed to read uploaded file stream: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to read uploaded file contents."
            )

        # 2. File Signature & Format Validation
        doc_format = DocumentProcessor.validate_document_header(contents, filename)

        # 3. Document Text Extraction
        extracted_text = ""
        total_pages: Optional[int] = None
        tables_extracted: Optional[int] = None

        if doc_format == "PDF":
            extracted_text, total_pages = DocumentProcessor.extract_pdf(contents)

        elif doc_format == "DOCX":
            extracted_text, tables_extracted = DocumentProcessor.extract_docx(contents)

        elif doc_format == "TXT":
            extracted_text = DocumentProcessor.extract_txt(contents)

        # 4. Text Extraction Quality Gate
        DocumentProcessor.quality_gate(extracted_text, doc_format)

        # 5. Compile Document Metadata Metrics
        words_count = len(extracted_text.split())
        doc_meta = DocumentMetadata(
            filename=filename,
            file_format=doc_format,
            file_size_bytes=len(contents),
            file_size_formatted=format_file_size(len(contents)),
            total_pages=total_pages,
            extracted_character_count=len(extracted_text),
            extracted_word_count=words_count,
            quality_status="VERIFIED",
            tables_extracted=tables_extracted
        )

        # 6. Delegate to unified safety evaluation pipeline
        return self.analyze_text(
            raw_text=extracted_text,
            report_name=filename,
            source_type="uploaded_file",
            document_metadata=doc_meta,
            user_id=user_id
        )


# Global singleton factory
_service_instance: Optional[AnalysisService] = None

def get_analysis_service() -> AnalysisService:
    global _service_instance
    if _service_instance is None:
        _service_instance = AnalysisService()
    return _service_instance
