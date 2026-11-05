package com.minesafety.dss.data.remote

import com.minesafety.dss.data.model.AnalysisRequest
import com.minesafety.dss.data.model.AnalysisResponse
import com.minesafety.dss.data.model.HealthResponse
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

/**
 * Retrofit interface definition matching FastAPI endpoints.
 */
interface ApiService {

    @GET("health")
    suspend fun checkHealth(): Response<HealthResponse>

    @POST("api/v1/analyze")
    suspend fun analyzeText(
        @Body request: AnalysisRequest
    ): Response<AnalysisResponse>

    @Multipart
    @POST("api/v1/analyze-file")
    suspend fun analyzeFile(
        @Part file: MultipartBody.Part
    ): Response<AnalysisResponse>
}
