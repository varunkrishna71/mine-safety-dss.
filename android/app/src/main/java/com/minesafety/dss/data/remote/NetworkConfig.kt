package com.minesafety.dss.data.remote

/**
 * Centralized API and environment configuration.
 *
 * In local Android development:
 * - Android Emulator routes to host via 10.0.2.2
 * - Physical devices route via your LAN IP (e.g. 192.168.1.x)
 * - In production, route via verified HTTPS domain
 */
object NetworkConfig {
    // Default endpoint for Android Emulator accessing host FastAPI backend
    const val DEFAULT_EMULATOR_BASE_URL = "http://10.0.2.2:8001/"
    
    // Default endpoint for local testing
    const val DEFAULT_LOCAL_BASE_URL = "http://127.0.0.1:8001/"

    private var currentBaseUrl: String = DEFAULT_EMULATOR_BASE_URL

    fun getBaseUrl(): String = currentBaseUrl

    fun setBaseUrl(url: String) {
        currentBaseUrl = if (url.endsWith("/")) url else "$url/"
    }

    const val TIMEOUT_SECONDS = 20L
    const val MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
}
