import 'package:dio/dio.dart';
import 'package:guestpass_mobile/data/models/auth_response.dart';
import 'package:guestpass_mobile/data/providers/dio_provider.dart';

/// Repository untuk operasi autentikasi (login & register)
class AuthRepository {
  final Dio _dio;

  AuthRepository({Dio? dio}) : _dio = dio ?? DioProvider.createDio();

  /// Login dengan email dan password, return AuthResponse (token + role)
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post('/Auth/login', data: {
      'email': email,
      'password': password,
    });

    final authResponse = AuthResponse.fromJson(response.data);

    // Simpan token dan role ke secure storage
    await DioProvider.saveToken(authResponse.token);
    await DioProvider.saveRole(authResponse.role);

    return authResponse;
  }

  /// Register user baru
  Future<String> register({
    required String username,
    required String email,
    required String password,
    required String fullName,
  }) async {
    final response = await _dio.post('/Auth/register', data: {
      'username': username,
      'email': email,
      'password': password,
      'fullName': fullName,
    });

    return response.data['message'] as String? ?? 'Pendaftaran berhasil.';
  }

  /// Logout - hapus token dari storage
  Future<void> logout() async {
    await DioProvider.clearAuth();
  }

  /// Cek apakah user sudah login (ada token tersimpan)
  Future<bool> isLoggedIn() async {
    final token = await DioProvider.getToken();
    return token != null && token.isNotEmpty;
  }

  /// Ambil role user yang tersimpan
  Future<String?> getRole() async {
    return await DioProvider.getRole();
  }
}
