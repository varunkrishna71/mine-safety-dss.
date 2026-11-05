package com.minesafety.dss.data.model

import com.google.gson.annotations.SerializedName

/**
 * Pydantic-compatible JSON request payload for manual incident narrative analysis.
 * Matches backend.schemas.analysis.AnalysisRequest.
 */
data class AnalysisRequest(
    @SerializedName("incident_text")
    val incidentText: String,

    @SerializedName("report_name")
    val reportName: String = "Manual_Report"
)
