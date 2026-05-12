import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guestpass_mobile/data/repositories/auth_repository.dart';
import 'package:guestpass_mobile/logic/auth/auth_state.dart';

/// Cubit untuk mengelola state autentikasi
class AuthCubit extends Cubit<AuthState> {
  final AuthRepository _authRepository;

  AuthCubit({AuthRepository? authRepository})
      : _authRepository = authRepository ?? AuthRepository(),
        super(AuthInitial());

  /// Cek status login saat app dimulai
  Future<void> checkAuthStatus() async {
    final isLoggedIn = await _authRepository.isLoggedIn();
    if (isLoggedIn) {
      final role = await _authRepository.getRole();
      emit(AuthAuthenticated(role: role ?? 'panitia'));
    } else {
      emit(AuthUnauthenticated());
    }
  }

  /// Login dengan email dan password
  Future<void> login({required String email, required String password}) async {
    emit(AuthLoading());

    try {
      final response = await _authRepository.login(
        email: email,
        password: password,
      );
      emit(AuthAuthenticated(role: response.role));
    } on DioException catch (e) {
      final message = _extractErrorMessage(e);
      emit(AuthError(message: message));
    } catch (e) {
      emit(const AuthError(message: 'Terjadi kesalahan. Coba lagi nanti.'));
    }
  }

  /// Register user baru
  Future<void> register({
    required String username,
    required String email,
    required String password,
    required String fullName,
  }) async {
    emit(AuthLoading());

    try {
      final message = await _authRepository.register(
        username: username,
        email: email,
        password: password,
        fullName: fullName,
      );
      emit(AuthRegisterSuccess(message: message));
    } on DioException catch (e) {
      final message = _extractErrorMessage(e);
      emit(AuthError(message: message));
    } catch (e) {
      emit(const AuthError(message: 'Terjadi kesalahan. Coba lagi nanti.'));
    }
  }

  /// Logout
  Future<void> logout() async {
    await _authRepository.logout();
    emit(AuthUnauthenticated());
  }

  /// Extract error message dari DioException
  String _extractErrorMessage(DioException e) {
    if (e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map<String, dynamic>) {
        return data['message'] as String? ?? 'Terjadi kesalahan.';
      }
      if (data is String) return data;
    }

    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Koneksi timeout. Periksa jaringan Anda.';
      case DioExceptionType.connectionError:
        return 'Tidak dapat terhubung ke server.';
      default:
        return 'Terjadi kesalahan jaringan.';
    }
  }
}
