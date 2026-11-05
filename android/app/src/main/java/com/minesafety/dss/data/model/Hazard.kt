package com.minesafety.dss.data.model

enum class HazardSeverity {
    CRITICAL,
    HIGH,
    MEDIUM,
    LOW
}

data class HazardDetail(
    val id: String,
    val name: String,
    val categoryCode: String,
    val iconEmoji: String,
    val shortDescription: String,
    val severity: HazardSeverity,
    val consequences: List<String>,
    val safetyPrecautions: List<String>,
    val recommendations: List<String>,
    val matchedKeyword: String? = null
)
