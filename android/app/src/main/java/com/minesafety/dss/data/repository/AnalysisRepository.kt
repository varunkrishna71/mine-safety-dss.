package com.minesafety.dss.data.repository

import com.minesafety.dss.data.model.AnalysisRequest
import com.minesafety.dss.data.model.AnalysisResponse
import com.minesafety.dss.data.model.HealthResponse
import com.minesafety.dss.data.remote.ApiService
import com.minesafety.dss.data.remote.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MultipartBody
import java.io.IOException

/**
 * Repository layer abstracting remote API operations and network exception handling.
 */
class AnalysisRepository(
    private val apiService: ApiService = RetrofitClient.getApiService()
) {

    suspend fun checkBackendHealth(): Result<HealthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.checkHealth()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Backend health check returned HTTP ${response.code()}"))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Cannot reach Python backend. Ensure server is running on configured host."))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun analyzeIncident(
        narrativeText: String,
        reportTitle: String = "Manual_Report"
    ): Result<AnalysisResponse> = withContext(Dispatchers.IO) {
        try {
            val request = AnalysisRequest(
                incidentText = narrativeText,
                reportName = reportTitle
            )
            val response = apiService.analyzeText(request)

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "HTTP ${response.code()} Error"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error: Failed to connect to Python FastAPI backend."))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun analyzeDocument(
        filePart: MultipartBody.Part
    ): Result<AnalysisResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.analyzeFile(filePart)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "HTTP ${response.code()} Upload Error"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error: Failed to upload file to Python backend."))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
