package com.minesafety.dss.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.minesafety.dss.data.model.DashboardSummaryStats
import com.minesafety.dss.data.model.ReportItem
import com.minesafety.dss.data.repository.AnalysisRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel responsible for Dashboard state, statistics aggregation,
 * and backend connectivity status monitoring.
 */
class DashboardViewModel(
    private val repository: AnalysisRepository = AnalysisRepository()
) : ViewModel() {

    private val _isBackendConnected = MutableStateFlow(false)
    val isBackendConnected: StateFlow<Boolean> = _isBackendConnected.asStateFlow()

    private val _stats = MutableStateFlow(
        DashboardSummaryStats(
            totalAnalyzed = 48,
            highRiskCount = 12,
            mediumRiskCount = 22,
            lowRiskCount = 14,
            highRiskPercentage = 25,
            mediumRiskPercentage = 46,
            lowRiskPercentage = 29
        )
    )
    val stats: StateFlow<DashboardSummaryStats> = _stats.asStateFlow()

    private val _recentReports = MutableStateFlow<List<ReportItem>>(emptyList())
    val recentReports: StateFlow<List<ReportItem>> = _recentReports.asStateFlow()

    init {
        pollBackendHealth()
    }

    fun pollBackendHealth() {
        viewModelScope.launch {
            repository.checkBackendHealth()
                .onSuccess {
                    _isBackendConnected.value = true
                }
                .onFailure {
                    _isBackendConnected.value = false
                }
        }
    }
}
