package com.minesafety.dss.data.model

import com.google.gson.annotations.SerializedName

/**
 * Pydantic-compatible JSON response mapping for backend analysis output (Phase 5).
 * Matches backend.schemas.analysis.AnalysisResponse.
 */
data class RiskAssessmentDto(
    @SerializedName("risk_score")
    val riskScore: Int,

    @SerializedName("safety_status")
    val safetyStatus: String, // "HIGH", "MEDIUM", "LOW"

    @SerializedName("status_icon")
    val statusIcon: String, // "🔴", "🟡", "🟢"

    @SerializedName("statutory_form")
    val statutoryForm: String // "Form IV-A", "Form J", "Form K"
)

data class DetectedHazardDto(
    @SerializedName("category")
    val category: String,

    @SerializedName("matched_keyword")
    val matchedKeyword: String,

    @SerializedName("recommendation")
    val recommendation: String
)

data class DocumentMetadataDto(
    @SerializedName("filename")
    val filename: String,

    @SerializedName("file_format")
    val fileFormat: String, // "PDF", "DOCX", "TXT"

    @SerializedName("file_size_bytes")
    val fileSizeBytes: Long,

    @SerializedName("file_size_formatted")
    val fileSizeFormatted: String,

    @SerializedName("total_pages")
    val totalPages: Int? = null,

    @SerializedName("extracted_character_count")
    val extractedCharacterCount: Int,

    @SerializedName("extracted_word_count")
    val extractedWordCount: Int,

    @SerializedName("quality_status")
    val qualityStatus: String = "VERIFIED",

    @SerializedName("tables_extracted")
    val tablesExtracted: Int? = null
)

data class AnalysisResponse(
    @SerializedName("status")
    val status: String = "success",

    @SerializedName("request_id")
    val requestId: String,

    @SerializedName("source_type")
    val sourceType: String, // "manual_text" or "uploaded_file"

    @SerializedName("report_name")
    val reportName: String,

    @SerializedName("cleaned_text_sample")
    val cleanedTextSample: String,

    @SerializedName("risk_assessment")
    val riskAssessment: RiskAssessmentDto,

    @SerializedName("hazard_count")
    val hazardCount: Int,

    @SerializedName("detected_hazards")
    val detectedHazards: List<DetectedHazardDto> = emptyList(),

    @SerializedName("alerts")
    val alerts: List<String> = emptyList(),

    @SerializedName("recommendations")
    val recommendations: List<String> = emptyList(),

    @SerializedName("summary")
    val summary: String,

    @SerializedName("document_metadata")
    val documentMetadata: DocumentMetadataDto? = null
)

data class HealthResponse(
    @SerializedName("status")
    val status: String,

    @SerializedName("application")
    val application: String,

    @SerializedName("version")
    val version: String,

    @SerializedName("message")
    val message: String
)
