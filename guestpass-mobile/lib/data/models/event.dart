/// Model Event
class Event {
  final String id;
  final String name;
  final String location;
  final DateTime date;
  final String? createdBy;
  final DateTime createdAt;

  Event({
    required this.id,
    required this.name,
    required this.location,
    required this.date,
    this.createdBy,
    required this.createdAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      name: json['name'] as String,
      location: json['location'] as String,
      date: DateTime.parse(json['date'] as String),
      createdBy: json['createdBy'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
