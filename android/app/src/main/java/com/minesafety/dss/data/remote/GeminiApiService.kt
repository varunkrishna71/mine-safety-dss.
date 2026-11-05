package com.minesafety.dss.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

data class AiChatMessageDto(
    val role: String,
    val content: String
)

data class AiChatRequest(
    val message: String,
    val context_report: Map<String, Any>? = null,
    val conversation_history: List<AiChatMessageDto>? = null
)

data class AiChatResponse(
    val status: String,
    val reply: String,
    val model: String,
    val disclaimer: String
)

data class HazardExplanationItem(
    val hazard_name: String,
    val explanation: String,
    val report_evidence: String? = null
)

data class StructuredExplanationDto(
    val incident_summary: String,
    val explanation_of_event: String? = null,
    val hazard_explanations: List<HazardExplanationItem>,
    val why_hazards_matter: String? = null,
    val recommendations_breakdown: List<String> = emptyList(),
    val important_observations: List<String> = emptyList(),
    val information_gaps: List<String> = emptyList(),
    val suggested_inspections: List<String> = emptyList(),
    val safety_notice: String
)

data class AiReportExplanationRequest(
    val report_data: Map<String, Any>
)

data class AiReportExplanationResponse(
    val status: String,
    val explanation: StructuredExplanationDto,
    val model: String
)

data class AiSummaryRequest(
    val report_data: Map<String, Any>
)

data class AiSummaryResponse(
    val status: String,
    val summary: String,
    val model: String,
    val disclaimer: String
)

data class AiHazardExplanationRequest(
    val hazard_name: String,
    val context_details: Map<String, Any>? = null
)

data class AiHazardExplanationResponse(
    val status: String,
    val hazard_name: String,
    val explanation: String,
    val model: String,
    val disclaimer: String
)

interface GeminiApiService {
    @POST("api/v1/ai/chat")
    suspend fun chatWithAi(
        @Header("Authorization") bearerToken: String?,
        @Body request: AiChatRequest
    ): Response<AiChatResponse>

    @POST("api/v1/ai/explain-report")
    suspend fun explainReport(
        @Header("Authorization") bearerToken: String?,
        @Body request: AiReportExplanationRequest
    ): Response<AiReportExplanationResponse>

    @POST("api/v1/ai/summarize-report")
    suspend fun summarizeReport(
        @Header("Authorization") bearerToken: String?,
        @Body request: AiSummaryRequest
    ): Response<AiSummaryResponse>

    @POST("api/v1/ai/explain-hazard")
    suspend fun explainHazard(
        @Header("Authorization") bearerToken: String?,
        @Body request: AiHazardExplanationRequest
    ): Response<AiHazardExplanationResponse>
}
