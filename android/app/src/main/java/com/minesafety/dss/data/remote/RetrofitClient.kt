package com.minesafety.dss.data.remote

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit HTTP client builder with configurable base URL and timeout policies.
 */
object RetrofitClient {

    private var retrofit: Retrofit? = null
    private var apiService: ApiService? = null

    private fun buildOkHttpClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(NetworkConfig.TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(NetworkConfig.TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(NetworkConfig.TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    fun getApiService(): ApiService {
        if (apiService == null) {
            retrofit = Retrofit.Builder()
                .baseUrl(NetworkConfig.getBaseUrl())
                .client(buildOkHttpClient())
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            apiService = retrofit!!.create(ApiService::class.java)
        }
        return apiService!!
    }

    fun refreshClient() {
        retrofit = null
        apiService = null
    }
}
