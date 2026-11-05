package com.minesafety.dss.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.minesafety.dss.data.model.ReportItem
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * Cloud Firestore Report Repository managing per-user isolated statutory analysis records.
 * Path: /users/{userId}/reports/{reportId}
 */
class ReportRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    /**
     * Real-time stream of reports for the authenticated mining safety officer.
     */
    fun getReportsFlow(userId: String): Flow<List<Map<String, Any>>> = callbackFlow {
        val query = firestore.collection("users")
            .document(userId)
            .collection("reports")
            .orderBy("createdAt", Query.Direction.DESCENDING)

        val registration = query.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            if (snapshot != null) {
                val items = snapshot.documents.mapNotNull { it.data }
                trySend(items)
            }
        }

        awaitClose { registration.remove() }
    }

    /**
     * Persist an evaluated incident report into Firestore under users/{userId}/reports/{reportId}.
     */
    suspend fun saveReport(userId: String, reportData: Map<String, Any>): Result<Unit> {
        return try {
            val reportId = reportData["reportId"] as? String ?: reportData["id"] as? String ?: return Result.failure(IllegalArgumentException("Missing reportId"))
            firestore.collection("users")
                .document(userId)
                .collection("reports")
                .document(reportId)
                .set(reportData)
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Delete a report belonging to the authenticated officer.
     */
    suspend fun deleteReport(userId: String, reportId: String): Result<Unit> {
        return try {
            firestore.collection("users")
                .document(userId)
                .collection("reports")
                .document(reportId)
                .delete()
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
