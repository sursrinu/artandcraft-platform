// HTTP Client with Interceptors
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio _dio;
  late SharedPreferences _prefs;
  bool _isInitialized = false;

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConfig.apiTimeout,
        receiveTimeout: AppConfig.apiTimeout,
        contentType: Headers.jsonContentType,
        validateStatus: (status) => status != null && status < 500,
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add token to header
          final token = await _getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Try to refresh token
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the request with new token
              final newToken = await _getToken();
              if (newToken != null) {
                error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              }
              return handler.resolve(
                await _dio.request(
                  error.requestOptions.path,
                  options: Options(
                    method: error.requestOptions.method,
                    headers: error.requestOptions.headers,
                  ),
                  data: error.requestOptions.data,
                  queryParameters: error.requestOptions.queryParameters,
                ),
              );
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> initialize() async {
    if (!_isInitialized) {
      _prefs = await SharedPreferences.getInstance();
      _isInitialized = true;
    }
  }

  Dio get dio => _dio;

  Future<String?> _getToken() async {
    await _ensureInitialized();
    return _prefs.getString(AppConfig.tokenKey);
  }

  Future<String?> getToken() async {
    await _ensureInitialized();
    return _prefs.getString(AppConfig.tokenKey);
  }

  Future<String?> _getRefreshToken() async {
    await _ensureInitialized();
    return _prefs.getString(AppConfig.refreshTokenKey);
  }

  Future<void> setToken(String token, {String? refreshToken}) async {
    await _ensureInitialized();
    await _prefs.setString(AppConfig.tokenKey, token);
    if (refreshToken != null) {
      await _prefs.setString(AppConfig.refreshTokenKey, refreshToken);
    }
  }

  Future<void> clearToken() async {
    await _ensureInitialized();
    await _prefs.remove(AppConfig.tokenKey);
    await _prefs.remove(AppConfig.refreshTokenKey);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _getRefreshToken();
      if (refreshToken == null) return false;

      final response = await _dio.post(
        '/auth/refresh-token',
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {
            'Authorization': 'Bearer $refreshToken',
          },
        ),
      );

      if (response.statusCode == 200) {
        final newToken = response.data['data']['token'];
        final newRefreshToken = response.data['data']['refreshToken'];
        await setToken(newToken, refreshToken: newRefreshToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> _ensureInitialized() async {
    if (!_isInitialized) {
      await initialize();
    }
  }

  // GET Request
  Future<Response> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.get(
      endpoint,
      queryParameters: queryParameters,
    );
  }

  // POST Request
  Future<Response> post(
    String endpoint, {
    dynamic data,
  }) async {
    return _dio.post(endpoint, data: data);
  }

  // PUT Request
  Future<Response> put(
    String endpoint, {
    dynamic data,
  }) async {
    return _dio.put(endpoint, data: data);
  }

  // DELETE Request
  Future<Response> delete(String endpoint) async {
    return _dio.delete(endpoint);
  }
}
