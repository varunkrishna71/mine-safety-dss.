package com.minesafety.dss.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.minesafety.dss.data.remote.GeminiApiService
import com.minesafety.dss.data.remote.AiChatRequest
import com.minesafety.dss.data.remote.AiChatMessageDto
import com.minesafety.dss.data.remote.AiReportExplanationRequest
import com.minesafety.dss.data.remote.AiSummaryRequest
import com.minesafety.dss.data.remote.StructuredExplanationDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChatMessage(
    val role: String, // "user" or "assistant"
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
)

sealed interface AiAssistantUiState {
    data class Content(
        val messages: List<ChatMessage>,
        val isGenerating: Boolean = false,
        val activeReportContext: Map<String, Any>? = null,
        val structuredExplanation: StructuredExplanationDto? = null,
        val executiveSummary: String? = null,
        val errorMessage: String? = null
    ) : AiAssistantUiState
}

class AiAssistantViewModel(
    private val geminiApi: GeminiApiService,
    private val tokenProvider: suspend () -> String?
) : ViewModel() {

    private val initialGreeting = ChatMessage(
        role = "assistant",
        content = "Welcome to the Mine Safety AI Assistant. I provide statutory explanations grounded in DGMS guidelines and Coal Mines Regulations (CMR 2017). How can I assist you with mine safety compliance today?"
    )

    private val _uiState = MutableStateFlow(
        AiAssistantUiState.Content(
            messages = listOf(initialGreeting),
            isGenerating = false
        )
    )
    val uiState: StateFlow<AiAssistantUiState.Content> = _uiState.asStateFlow()

    fun attachReportContext(report: Map<String, Any>) {
        val current = _uiState.value
        _uiState.value = current.copy(activeReportContext = report)
    }

    fun clearReportContext() {
        val current = _uiState.value
        _uiState.value = current.copy(activeReportContext = null)
    }

    fun clearChat() {
        _uiState.value = _uiState.value.copy(
            messages = listOf(initialGreeting),
            errorMessage = null,
            structuredExplanation = null,
            executiveSummary = null
        )
    }

    fun sendMessage(userText: String) {
        val trimmed = userText.trim()
        if (trimmed.isEmpty() || _uiState.value.isGenerating) return

        val userMessage = ChatMessage(role = "user", content = trimmed)
        val updatedList = _uiState.value.messages + userMessage

        _uiState.value = _uiState.value.copy(
            messages = updatedList,
            isGenerating = true,
            errorMessage = null
        )

        viewModelScope.launch {
            try {
                val token = tokenProvider()
                val historyDto = updatedList.map {
                    AiChatMessageDto(role = it.role, content = it.content)
                }

                val request = AiChatRequest(
                    message = trimmed,
                    context_report = _uiState.value.activeReportContext,
                    conversation_history = historyDto
                )

                val response = geminiApi.chatWithAi(
                    bearerToken = token?.let { "Bearer $it" },
                    request = request
                )

                if (response.isSuccessful && response.body() != null) {
                    val reply = response.body()!!.reply
                    val botMessage = ChatMessage(role = "assistant", content = reply)
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + botMessage,
                        isGenerating = false
                    )
                } else {
                    val err = "AI Assistant error: ${response.code()} ${response.message()}"
                    _uiState.value = _uiState.value.copy(
                        isGenerating = false,
                        errorMessage = err
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isGenerating = false,
                    errorMessage = e.localizedMessage ?: "Network error connecting to Gemini service."
                )
            }
        }
    }

    fun requestStructuredExplanation(reportData: Map<String, Any>) {
        _uiState.value = _uiState.value.copy(isGenerating = true, errorMessage = null)
        viewModelScope.launch {
            try {
                val token = tokenProvider()
                val response = geminiApi.explainReport(
                    bearerToken = token?.let { "Bearer $it" },
                    request = AiReportExplanationRequest(report_data = reportData)
                )
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = _uiState.value.copy(
                        structuredExplanation = response.body()!!.explanation,
                        isGenerating = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isGenerating = false,
                        errorMessage = "Failed to generate structured explanation: ${response.code()}"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isGenerating = false,
                    errorMessage = e.localizedMessage
                )
            }
        }
    }

    fun requestExecutiveSummary(reportData: Map<String, Any>) {
        _uiState.value = _uiState.value.copy(isGenerating = true, errorMessage = null)
        viewModelScope.launch {
            try {
                val token = tokenProvider()
                val response = geminiApi.summarizeReport(
                    bearerToken = token?.let { "Bearer $it" },
                    request = AiSummaryRequest(report_data = reportData)
                )
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = _uiState.value.copy(
                        executiveSummary = response.body()!!.summary,
                        isGenerating = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isGenerating = false,
                        errorMessage = "Failed to generate summary: ${response.code()}"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isGenerating = false,
                    errorMessage = e.localizedMessage
                )
            }
        }
    }
}
