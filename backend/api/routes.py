from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Header, status
from backend.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    HealthResponse,
    ErrorResponse
)
from backend.services.analysis_service import AnalysisService, get_analysis_service
from backend.services.auth_service import get_current_user, AuthenticatedUser

router = APIRouter(tags=["Mining Safety Analysis"])

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Verifies operational readiness of the Mine Safety DSS backend service.",
    status_code=status.HTTP_200_OK
)
def health_check() -> HealthResponse:
    """
    Returns system health status and version metadata without requiring inspection input.
    """
    return HealthResponse(
        status="healthy",
        application="Mine Safety DSS",
        version="1.0.0",
        message="Backend is running successfully"
    )

@router.post(
    "/api/v1/analyze",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid or empty incident text"},
        401: {"model": ErrorResponse, "description": "Missing, invalid or expired Firebase Bearer token"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server configuration error"}
    },
    summary="Analyse Manual Incident Description (Protected)",
    description="Processes raw mining incident descriptions, runs NLP preprocessing, scans for DGMS statutory hazards, detects CMR 2017 thresholds, and calculates composite risk under authenticated Firebase UID.",
    status_code=status.HTTP_200_OK
)
def analyze_incident(
    payload: AnalysisRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: AnalysisService = Depends(get_analysis_service)
) -> AnalysisResponse:
    """
    Evaluates manual incident text using existing Python modules and tags analysis to verified Firebase UID:
    - Preprocessing: utils.text_preprocessor.clean_text
    - Classification: utils.hazard_classifier.detect_hazards & detect_specific_thresholds
    - Scoring: utils.risk_scorer.calculate_risk
    """
    return service.analyze_text(
        raw_text=payload.incident_text,
        report_name=payload.report_name or "Manual_Report",
        source_type="manual_text",
        user_id=current_user.uid
    )

@router.post(
    "/api/v1/analyze-file",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Corrupted or non-readable document"},
        401: {"model": ErrorResponse, "description": "Missing, invalid or expired Firebase Bearer token"},
        413: {"model": ErrorResponse, "description": "File exceeds size ceiling (10MB)"},
        415: {"model": ErrorResponse, "description": "Unsupported document extension"},
        500: {"model": ErrorResponse, "description": "Internal extraction failure"}
    },
    summary="Upload & Analyse Incident Report Document (Protected)",
    description="Accepts PDF, DOCX, or TXT statutory inspection files, extracts content, and routes text through the unified safety analysis pipeline under authenticated Firebase UID.",
    status_code=status.HTTP_200_OK
)
async def analyze_document(
    file: UploadFile = File(..., description="Statutory inspection report file (.pdf, .docx, or .txt)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: AnalysisService = Depends(get_analysis_service)
) -> AnalysisResponse:
    """
    Receives multipart/form-data upload, validates file type and size, extracts text
    via existing PyPDF2/python-docx/txt readers, and returns structured analysis results tagged to verified Firebase UID.
    """
    return await service.extract_and_analyze_file(file, user_id=current_user.uid)

# ======================== PHASE 7: GEMINI AI ASSISTANT ROUTES ========================

from backend.services.gemini_service import get_gemini_service, GeminiService
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    context_report: Optional[dict] = None
    conversation_history: Optional[list] = None

class ExplainReportRequest(BaseModel):
    report_data: dict

class ExplainHazardRequest(BaseModel):
    hazard_name: str
    context_details: Optional[dict] = None

@router.post(
    "/api/v1/ai/chat",
    summary="AI Mine Safety Assistant Chat",
    description="Conversational mining safety assistant grounded in DGMS rules and CMR 2017.",
    status_code=status.HTTP_200_OK
)
def chat_ai(
    payload: ChatRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    ai_service: GeminiService = Depends(get_gemini_service)
):
    return ai_service.chat(
        message=payload.message,
        context_report=payload.context_report,
        conversation_history=payload.conversation_history
    )

@router.post(
    "/api/v1/ai/explain-report",
    summary="Explain Incident Report with AI",
    description="Generates a structured multi-dimensional explanation of an analysed incident report.",
    status_code=status.HTTP_200_OK
)
def explain_report_ai(
    payload: ExplainReportRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    ai_service: GeminiService = Depends(get_gemini_service)
):
    return ai_service.explain_report(payload.report_data)

@router.post(
    "/api/v1/ai/summarize-report",
    summary="Generate AI Incident Summary",
    description="Produces an executive summary covering overview, hazards, risk scoring, recommendations, and information gaps.",
    status_code=status.HTTP_200_OK
)
def summarize_report_ai(
    payload: ExplainReportRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    ai_service: GeminiService = Depends(get_gemini_service)
):
    return ai_service.summarize_report(payload.report_data)

@router.post(
    "/api/v1/ai/explain-hazard",
    summary="Explain DGMS Hazard Category with Gemini",
    description="Provides deep technical context, consequences, and statutory precautions for a specific hazard category.",
    status_code=status.HTTP_200_OK
)
def explain_hazard_ai(
    payload: ExplainHazardRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    ai_service: GeminiService = Depends(get_gemini_service)
):
    return ai_service.explain_hazard(payload.hazard_name, payload.context_details)


