package com.minesafety.dss.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.IgnoreExtraProperties
import com.google.firebase.firestore.PropertyName

/**
 * Statutory Mining Safety Inspector Profile stored in Cloud Firestore under /users/{userId}.
 */
@IgnoreExtraProperties
data class UserProfile(
    @DocumentId
    val uid: String = "",

    @PropertyName("fullName")
    val fullName: String = "",

    @PropertyName("email")
    val email: String = "",

    @PropertyName("createdAt")
    val createdAt: String = "",

    @PropertyName("lastLoginAt")
    val lastLoginAt: String = "",

    @PropertyName("emailVerified")
    val emailVerified: Boolean = false,

    @PropertyName("role")
    val role: String = "Safety Officer",

    @PropertyName("designation")
    val designation: String = "Statutory Mining Safety Inspector",

    @PropertyName("miningZone")
    val miningZone: String = "Eastern Coalfields / DGMS Zone 1"
)
