// Authentication Provider with Riverpod
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../services/api_client.dart';
import '../config/app_config.dart';

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final String? token;
  final Map<String, dynamic>? user;
  final String? error;
  final String? message;

  AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.token,
    this.user,
    this.error,
    this.message,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    String? token,
    Map<String, dynamic>? user,
    String? error,
    String? message,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      token: token ?? this.token,
      user: user ?? this.user,
      error: error ?? this.error,
      message: message ?? this.message,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService = AuthService();
  final ApiClient _apiClient = ApiClient();

  AuthNotifier() : super(AuthState()) {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    await _apiClient.initialize();
    // Try to restore authentication from stored token
    await _restoreAuthSession();
  }

  Future<void> _restoreAuthSession() async {
    try {
      final token = await _apiClient.getToken();
      if (token != null && token.isNotEmpty) {
        print('DEBUG: Found stored token, attempting to restore session');
        // Token exists, mark as authenticated
        state = state.copyWith(
          isAuthenticated: true,
          token: token,
        );
      }
    } catch (e) {
      print('DEBUG: Error restoring auth session: $e');
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String userType = 'customer',
  }) async {
    print('[REGISTER] Called with email: $email');
    // Force a full state reset to clear any previous error and trigger UI update
    state = AuthState(isLoading: true, isAuthenticated: false, error: null, message: null, token: null, user: null);
    try {
      final response = await _authService.register(
        name: name,
        email: email,
        password: password,
        userType: userType,
      );
      print('[REGISTER] Response: $response');
      if (response['success'] ?? false) {
        final data = response['data'];
        final user = {
          'id': data['id'],
          'name': data['name'],
          'email': data['email'],
          'userType': data['userType'],
        };
        print('[REGISTER] Success, user: $user');
        // Always clear error after successful registration
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: false,
          token: null,
          user: user,
          error: null,
          message: response['message'] ?? 'Registration successful. Please verify OTP.',
        );
        print('[REGISTER] Forced error clear after success: error=${state.error}');
        print('[REGISTER] State after success: error=${state.error}, message=${state.message}');
      } else {
        print('[REGISTER] Failure, message: ${response['message']}');
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Registration failed',
        );
        print('[REGISTER] State after failure: error=${state.error}, message=${state.message}');
      }
    } catch (e) {
      print('[REGISTER] Exception: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      print('[REGISTER] State after exception: error=${state.error}, message=${state.message}');
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    print('[LOGIN] Called with email: $email');
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.login(
        email: email,
        password: password,
      );
      print('[LOGIN] Response: $response');
      if (response['success'] ?? false) {
        final data = response['data'];
        final token = data['accessToken'];
        final refreshToken = data['refreshToken'];
        final user = {
          'id': data['id'],
          'name': data['name'],
          'email': data['email'],
          'userType': data['userType'],
        };
        print('[LOGIN] Success, user: $user');
        await _apiClient.setToken(token, refreshToken: refreshToken);
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: user,
          error: null,
        );
        print('[LOGIN] State after success: error=${state.error}');
      } else {
        print('[LOGIN] Failure, message: ${response['message']}');
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Login failed',
        );
        print('[LOGIN] State after failure: error=${state.error}');
      }
    } catch (e) {
      print('[LOGIN] Exception: $e');
      String errorMsg = e.toString();
      // If DioException, extract backend error message
      if (e is DioException) {
        final response = e.response;
        if (response != null && response.data != null) {
          final data = response.data;
          if (data is Map && data['message'] != null) {
            errorMsg = data['message'];
          } else if (data is String) {
            errorMsg = data;
          }
        }
      }
      state = state.copyWith(
        isLoading: false,
        error: errorMsg,
      );
      print('[LOGIN] State after exception: error=${state.error}');
    }
  }

  Future<void> verifyEmail({
    required String email,
    required String code,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.verifyEmail(
        email: email,
        code: code,
      );

      if (response['success'] ?? false) {
        state = state.copyWith(
          isLoading: false,
          error: null,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Verification failed',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> resetPassword({
    required String email,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.forgotPassword(email: email);

      if (response['success'] ?? false) {
        state = state.copyWith(
          isLoading: false,
          error: null,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Password reset failed',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _authService.logout();
      await _apiClient.clearToken();

      state = AuthState();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> resendVerificationCode({required String email}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.resendVerificationCode(email: email);
      if (response['success'] ?? false) {
        state = state.copyWith(
          isLoading: false,
          error: null,
          message: response['message'] ?? 'Verification code resent.',
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Failed to resend verification code',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
