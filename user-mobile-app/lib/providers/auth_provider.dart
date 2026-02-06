// Authentication Provider with Riverpod
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
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.register(
        name: name,
        email: email,
        password: password,
        userType: userType,
      );

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

        await _apiClient.setToken(token, refreshToken: refreshToken);

        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: user,
          error: null,
          message: response['message'] ?? 'Registration successful',
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Registration failed',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.login(
        email: email,
        password: password,
      );

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

        await _apiClient.setToken(token, refreshToken: refreshToken);

        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: user,
          error: null,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['message'] ?? 'Login failed',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
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
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
