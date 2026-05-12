import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:guestpass_mobile/config/api_config.dart';

/// Provider Dio dengan JWT interceptor
class DioProvider {
  static final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static Dio createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(milliseconds: ApiConfig.connectTimeout),
      receiveTimeout: const Duration(milliseconds: ApiConfig.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Interceptor untuk attach JWT token ke setiap request
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Handle 401 Unauthorized - token expired
        if (error.response?.statusCode == 401) {
          _storage.delete(key: 'jwt_token');
          _storage.delete(key: 'user_role');
        }
        return handler.next(error);
      },
    ));

    return dio;
  }

  /// Simpan token setelah login
  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  /// Simpan role user
  static Future<void> saveRole(String role) async {
    await _storage.write(key: 'user_role', value: role);
  }

  /// Ambil token
  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  /// Ambil role
  static Future<String?> getRole() async {
    return await _storage.read(key: 'user_role');
  }

  /// Hapus semua data auth (logout)
  static Future<void> clearAuth() async {
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user_role');
  }
}
