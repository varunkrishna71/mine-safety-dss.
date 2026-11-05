package com.minesafety.dss.data.model

import com.google.gson.annotations.SerializedName

/**
 * Structured API error response mapping from FastAPI exception handlers.
 */
data class ApiError(
    @SerializedName("status")
    val status: String = "error",

    @SerializedName("error_code")
    val errorCode: String,

    @SerializedName("message")
    val message: String
)
