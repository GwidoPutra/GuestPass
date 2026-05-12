import 'package:dio/dio.dart';
import 'package:guestpass_mobile/data/models/event.dart';
import 'package:guestpass_mobile/data/providers/dio_provider.dart';

/// Repository untuk operasi Event
class EventRepository {
  final Dio _dio;

  EventRepository({Dio? dio}) : _dio = dio ?? DioProvider.createDio();

  /// Ambil semua event milik user
  Future<List<Event>> getEvents() async {
    final response = await _dio.get('/Event');
    final List<dynamic> data = response.data;
    return data.map((json) => Event.fromJson(json)).toList();
  }

  /// Ambil detail event
  Future<Event> getEvent(String id) async {
    final response = await _dio.get('/Event/$id');
    return Event.fromJson(response.data);
  }

  /// Buat event baru
  Future<Event> createEvent({
    required String name,
    required String location,
    required String date,
  }) async {
    final response = await _dio.post('/Event', data: {
      'name': name,
      'location': location,
      'date': date,
    });
    return Event.fromJson(response.data);
  }

  /// Update event
  Future<Event> updateEvent({
    required String id,
    required String name,
    required String location,
    required String date,
  }) async {
    final response = await _dio.put('/Event/$id', data: {
      'name': name,
      'location': location,
      'date': date,
    });
    return Event.fromJson(response.data);
  }

  /// Hapus event
  Future<void> deleteEvent(String id) async {
    await _dio.delete('/Event/$id');
  }
}
