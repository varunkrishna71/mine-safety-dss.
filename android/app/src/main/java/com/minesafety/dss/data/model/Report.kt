package com.minesafety.dss.data.model

enum class RiskLevel {
    LOW,
    MEDIUM,
    HIGH
}

data class DashboardSummaryStats(
    val totalAnalyzed: Int,
    val highRiskCount: Int,
    val mediumRiskCount: Int,
    val lowRiskCount: Int,
    val highRiskPercentage: Int,
    val mediumRiskPercentage: Int,
    val lowRiskPercentage: Int
)

data class ReportItem(
    val id: String,
    val title: String,
    val mineLocation: String,
    val date: String,
    val shift: String,
    val riskScore: Int,
    val safetyStatus: RiskLevel,
    val statutoryForm: String, // "Form IV-A", "Form J", or "Form K"
    val hazardCount: Int,
    val hazards: List<HazardDetail>,
    val alerts: List<String>,
    val summary: String,
    val narrativeText: String,
    val documentMetadata: DocumentMetadataDto? = null
)
