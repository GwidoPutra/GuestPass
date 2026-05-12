/// Model untuk response login dari API
class AuthResponse {
  final String token;
  final String role;

  AuthResponse({required this.token, required this.role});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] as String,
      role: json['role'] as String? ?? 'panitia',
    );
  }
}
