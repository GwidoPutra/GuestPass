/// Model Guest
class Guest {
  final String id;
  final String? eventId;
  final String name;
  final String email;
  final String qrCodeToken;
  final bool isCheckedIn;
  final DateTime? checkedInAt;
  final DateTime createdAt;

  Guest({
    required this.id,
    this.eventId,
    required this.name,
    required this.email,
    required this.qrCodeToken,
    required this.isCheckedIn,
    this.checkedInAt,
    required this.createdAt,
  });

  factory Guest.fromJson(Map<String, dynamic> json) {
    return Guest(
      id: json['id'] as String,
      eventId: json['eventId'] as String?,
      name: json['name'] as String,
      email: json['email'] as String,
      qrCodeToken: json['qrCodeToken'] as String? ?? json['qrcodeToken'] as String? ?? '',
      isCheckedIn: json['isCheckedIn'] as bool? ?? false,
      checkedInAt: json['checkedInAt'] != null
          ? DateTime.parse(json['checkedInAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
