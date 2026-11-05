package com.minesafety.dss.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.minesafety.dss.data.model.UserProfile
import com.minesafety.dss.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface AuthUiState {
    object Idle : AuthUiState
    object Loading : AuthUiState
    data class Authenticated(val user: UserProfile) : AuthUiState
    data class Error(val message: String) : AuthUiState
    data class PasswordResetSent(val email: String) : AuthUiState
}

/**
 * Android MVVM ViewModel managing Firebase Authentication state and credentials.
 */
class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        // Observe Firebase auth changes
        viewModelScope.launch {
            authRepository.authStateFlow.collect { fbUser ->
                if (fbUser == null) {
                    _uiState.value = AuthUiState.Idle
                }
            }
        }
    }

    fun login(email: String, pass: String) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = AuthUiState.Error("Email and password cannot be empty.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            authRepository.loginUser(email, pass)
                .onSuccess { profile ->
                    _uiState.value = AuthUiState.Authenticated(profile)
                }
                .onFailure { error ->
                    _uiState.value = AuthUiState.Error(error.localizedMessage ?: "Authentication failed.")
                }
        }
    }

    fun register(fullName: String, email: String, pass: String, confirmPass: String) {
        if (fullName.length < 2) {
            _uiState.value = AuthUiState.Error("Full name must be at least 2 characters.")
            return
        }
        if (!email.contains("@")) {
            _uiState.value = AuthUiState.Error("Please enter a valid official email address.")
            return
        }
        if (pass.length < 6) {
            _uiState.value = AuthUiState.Error("Password must be at least 6 characters.")
            return
        }
        if (pass != confirmPass) {
            _uiState.value = AuthUiState.Error("Passwords do not match.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            authRepository.registerUser(fullName, email, pass)
                .onSuccess { profile ->
                    _uiState.value = AuthUiState.Authenticated(profile)
                }
                .onFailure { error ->
                    _uiState.value = AuthUiState.Error(error.localizedMessage ?: "Registration failed.")
                }
        }
    }

    fun sendPasswordReset(email: String) {
        if (!email.contains("@")) {
            _uiState.value = AuthUiState.Error("Enter a valid registered email.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            authRepository.sendPasswordReset(email)
                .onSuccess {
                    _uiState.value = AuthUiState.PasswordResetSent(email)
                }
                .onFailure { error ->
                    _uiState.value = AuthUiState.Error(error.localizedMessage ?: "Failed to send reset link.")
                }
        }
    }

    fun logout() {
        authRepository.logout()
        _uiState.value = AuthUiState.Idle
    }
}
