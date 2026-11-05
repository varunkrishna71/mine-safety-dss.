from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field, field_validator
except ImportError:
    # Lightweight adapter fallback for environments where pydantic is not yet installed
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return self.__dict__
        def dict(self):
            return self.__dict__

    def Field(*args, **kwargs):
        default = kwargs.get("default", None)
        if args and args[0] is not ...:
            default = args[0]
        return default

    def field_validator(*args, **kwargs):
        def decorator(fn):
            return fn
        return decorator

class AnalysisRequest(BaseModel):
    """
    Request payload for manual incident narrative analysis.
    """
    incident_text: str = Field(
        ...,
        description="Raw narrative of the mining incident, inspection notes, or monitoring observation."
    )
    report_name: Optional[str] = Field(
        default="Manual_Report",
        description="Optional identifier or title for the inspection report."
    )

    @field_validator("incident_text")
    def validate_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Incident description text cannot be empty or solely whitespace.")
        return v.strip()

class RiskAssessmentResponse(BaseModel):
    """
    Quantified safety risk and statutory compliance category.
    """
    risk_score: int = Field(
        ...,
        description="Calculated composite risk score between 0 and 100."
    )
    safety_status: str = Field(
        ...,
        description="Safety status tier: HIGH, MEDIUM, or LOW."
    )
    status_icon: str = Field(
        ...,
        description="Unicode indicator icon corresponding to safety tier (🔴, 🟡, 🟢)."
    )
    statutory_form: str = Field(
        ...,
        description="Statutory reporting form mandated under Coal Mines Regulations (CMR 2017)."
    )

class DetectedHazardItem(BaseModel):
    """
    Individual detected DGMS hazard category details.
    """
    category: str = Field(
        ...,
        description="Name of the statutory hazard category."
    )
    matched_keyword: str = Field(
        ...,
        description="Trigger keyword found in the inspection text."
    )
    recommendation: str = Field(
        ...,
        description="DGMS circular directive and technical recommendation for this hazard."
    )

class DocumentMetadata(BaseModel):
    """
    Document extraction quality gate and physical file metadata (Phase 5).
    """
    filename: str = Field(..., description="Original filename of the uploaded report")
    file_format: str = Field(..., description="Detected document format: PDF, DOCX, or TXT")
    file_size_bytes: int = Field(..., description="File size in bytes")
    file_size_formatted: str = Field(..., description="Human-readable file size (e.g. 184 KB)")
    total_pages: Optional[int] = Field(default=None, description="Number of document pages (if PDF)")
    extracted_character_count: int = Field(..., description="Total extracted character length")
    extracted_word_count: int = Field(..., description="Total extracted word count")
    quality_status: str = Field(default="VERIFIED", description="Quality Gate status: VERIFIED, OCR_REQUIRED, WARNING")
    tables_extracted: Optional[int] = Field(default=None, description="Number of table rows extracted (if DOCX)")

class AnalysisResponse(BaseModel):
    """
    Comprehensive structured response for mining safety analysis.
    """
    status: str = Field(
        default="success",
        description="Operation status."
    )
    request_id: str = Field(
        ...,
        description="Unique UUID tracking this analysis operation."
    )
    source_type: str = Field(
        ...,
        description="Origin modality of input: 'manual_text' or 'uploaded_file'."
    )
    report_name: str = Field(
        ...,
        description="Name or title of the evaluated document."
    )
    cleaned_text_sample: str = Field(
        ...,
        description="Truncated sample of the normalized, cleaned text evaluated by the NLP engine."
    )
    risk_assessment: RiskAssessmentResponse = Field(
        ...,
        description="Composite risk evaluation and statutory filing determination."
    )
    hazard_count: int = Field(
        ...,
        description="Number of distinct hazard categories detected."
    )
    detected_hazards: List[DetectedHazardItem] = Field(
        default_factory=list,
        description="List of detected hazard details."
    )
    alerts: List[str] = Field(
        default_factory=list,
        description="List of critical threshold or emergency evacuation alerts detected."
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Actionable mitigation recommendations corresponding to detected hazards."
    )
    summary: str = Field(
        ...,
        description="Executive statutory compliance summary directive."
    )
    document_metadata: Optional[DocumentMetadata] = Field(
        default=None,
        description="Detailed document extraction and quality gate metrics (if source_type is 'uploaded_file')."
    )
    authenticated_user_id: Optional[str] = Field(
        default=None,
        description="Authenticated Firebase UID of the safety officer associated with this report."
    )

class HealthResponse(BaseModel):
    """
    Health check status response.
    """
    status: str = Field(default="healthy")
    application: str = Field(default="Mine Safety DSS")
    version: str = Field(default="1.0.0")
    message: str = Field(default="Backend is running successfully")

class ErrorResponse(BaseModel):
    """
    Standard error envelope.
    """
    status: str = Field(default="error")
    error_code: str = Field(...)
    message: str = Field(...)
    details: Optional[Dict[str, Any]] = Field(default=None)
