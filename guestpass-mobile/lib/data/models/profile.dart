/// Model Profile (Panitia)
class Profile {
  final String id;
  final String username;
  final String email;
  final String fullName;
  final String? role;
  final bool isApproved;
  final DateTime createdAt;

  Profile({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    this.role,
    required this.isApproved,
    required this.createdAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: json['role'] as String?,
      isApproved: json['isApproved'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
