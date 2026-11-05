package com.minesafety.dss.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.minesafety.dss.data.model.UserProfile
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Authentication and User Profile Repository for Android Jetpack Compose.
 * Uses Firebase Authentication SDK and Cloud Firestore.
 */
class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    /**
     * Observable authentication state as Kotlin StateFlow / Flow.
     */
    val authStateFlow: Flow<FirebaseUser?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { fbAuth ->
            trySend(fbAuth.currentUser)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    val currentUid: String?
        get() = auth.currentUser?.uid

    /**
     * Retrieve active Firebase ID token for Bearer Authorization headers.
     */
    suspend fun getIdToken(forceRefresh: Boolean = false): String? {
        val user = auth.currentUser ?: return null
        return try {
            val tokenResult = user.getIdToken(forceRefresh).await()
            tokenResult.token
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Register a new Mining Safety Officer.
     */
    suspend fun registerUser(
        fullName: String,
        email: String,
        pass: String
    ): Result<UserProfile> {
        return try {
            val authResult = auth.createUserWithEmailAndPassword(email.trim(), pass).await()
            val user = authResult.user ?: throw IllegalStateException("Firebase registration returned empty user.")

            // Set display name in Auth profile
            val profileUpdates = UserProfileChangeRequest.Builder()
                .setDisplayName(fullName.trim())
                .build()
            user.updateProfile(profileUpdates).await()

            // Send statutory email verification
            try {
                user.sendEmailVerification().await()
            } catch (_: Exception) {}

            val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
            val profile = UserProfile(
                uid = user.uid,
                fullName = fullName.trim(),
                email = user.email ?: email.trim(),
                createdAt = nowIso,
                lastLoginAt = nowIso,
                emailVerified = user.isEmailVerified,
                role = "Safety Officer",
                designation = "Statutory Mining Safety Inspector"
            )

            // Save isolated profile in Firestore: /users/{userId}
            firestore.collection("users").document(user.uid)
                .set(profile)
                .await()

            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Log in an existing officer with Email and Password.
     */
    suspend fun loginUser(email: String, pass: String): Result<UserProfile> {
        return try {
            val authResult = auth.signInWithEmailAndPassword(email.trim(), pass).await()
            val user = authResult.user ?: throw IllegalStateException("Firebase login returned empty user.")

            val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
            val userDocRef = firestore.collection("users").document(user.uid)

            val snapshot = userDocRef.get().await()
            val profile = if (snapshot.exists()) {
                val existing = snapshot.toObject(UserProfile::class.java) ?: UserProfile(uid = user.uid)
                val updated = existing.copy(
                    lastLoginAt = nowIso,
                    emailVerified = user.isEmailVerified
                )
                userDocRef.set(mapOf("lastLoginAt" to nowIso, "emailVerified" to user.isEmailVerified), SetOptions.merge()).await()
                updated
            } else {
                val newProfile = UserProfile(
                    uid = user.uid,
                    fullName = user.displayName ?: email.substringBefore("@"),
                    email = user.email ?: email,
                    createdAt = nowIso,
                    lastLoginAt = nowIso,
                    emailVerified = user.isEmailVerified
                )
                userDocRef.set(newProfile).await()
                newProfile
            }

            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Send password recovery email.
     */
    suspend fun sendPasswordReset(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email.trim()).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Sign out current user.
     */
    fun logout() {
        auth.signOut()
    }
}
