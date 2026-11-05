package com.minesafety.dss.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.minesafety.dss.data.model.AnalysisResponse
import com.minesafety.dss.data.repository.AnalysisRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

sealed interface AnalysisUiState {
    object Idle : AnalysisUiState
    data class Loading(val message: String = "Analysing Mining Incident...") : AnalysisUiState
    data class Success(val response: AnalysisResponse) : AnalysisUiState
    data class Error(val errorMessage: String, val canRetry: Boolean = true) : AnalysisUiState
}

sealed interface BackendConnectionState {
    object Checking : BackendConnectionState
    data class Connected(val version: String) : BackendConnectionState
    data class Unavailable(val reason: String) : BackendConnectionState
}

class AnalysisViewModel(
    private val repository: AnalysisRepository = AnalysisRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<AnalysisUiState>(AnalysisUiState.Idle)
    val uiState: StateFlow<AnalysisUiState> = _uiState.asStateFlow()

    private val _backendState = MutableStateFlow<BackendConnectionState>(BackendConnectionState.Checking)
    val backendState: StateFlow<BackendConnectionState> = _backendState.asStateFlow()

    init {
        checkBackendHealth()
    }

    fun checkBackendHealth() {
        viewModelScope.launch {
            _backendState.value = BackendConnectionState.Checking
            repository.checkBackendHealth()
                .onSuccess { health ->
                    _backendState.value = BackendConnectionState.Connected(health.version)
                }
                .onFailure { error ->
                    _backendState.value = BackendConnectionState.Unavailable(error.message ?: "Server Unreachable")
                }
        }
    }

    fun analyzeManualIncident(title: String, narrativeText: String) {
        if (narrativeText.isBlank()) {
            _uiState.value = AnalysisUiState.Error("Incident description text cannot be empty.", canRetry = false)
            return
        }

        viewModelScope.launch {
            _uiState.value = AnalysisUiState.Loading("Analysing Mining Incident with Python Backend...")
            
            repository.analyzeIncident(narrativeText, title.ifBlank { "Manual_Report" })
                .onSuccess { response ->
                    _uiState.value = AnalysisUiState.Success(response)
                }
                .onFailure { error ->
                    _uiState.value = AnalysisUiState.Error(
                        error.message ?: "An unexpected error occurred during backend analysis."
                    )
                }
        }
    }

    fun analyzeDocumentFile(filePart: MultipartBody.Part) {
        viewModelScope.launch {
            _uiState.value = AnalysisUiState.Loading("Uploading & Extracting Document via Python Backend...")

            repository.analyzeDocument(filePart)
                .onSuccess { response ->
                    _uiState.value = AnalysisUiState.Success(response)
                }
                .onFailure { error ->
                    _uiState.value = AnalysisUiState.Error(
                        error.message ?: "Failed to analyze uploaded inspection file."
                    )
                }
        }
    }

    fun resetState() {
        _uiState.value = AnalysisUiState.Idle
    }
}
