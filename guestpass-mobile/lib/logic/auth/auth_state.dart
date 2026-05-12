import 'package:equatable/equatable.dart';

/// State untuk AuthCubit
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// State awal
class AuthInitial extends AuthState {}

/// Sedang memproses (login/register)
class AuthLoading extends AuthState {}

/// Login berhasil
class AuthAuthenticated extends AuthState {
  final String role;

  const AuthAuthenticated({required this.role});

  @override
  List<Object?> get props => [role];
}

/// Belum login / logout
class AuthUnauthenticated extends AuthState {}

/// Register berhasil
class AuthRegisterSuccess extends AuthState {
  final String message;

  const AuthRegisterSuccess({required this.message});

  @override
  List<Object?> get props => [message];
}

/// Error (login gagal, register gagal, dll)
class AuthError extends AuthState {
  final String message;

  const AuthError({required this.message});

  @override
  List<Object?> get props => [message];
}
