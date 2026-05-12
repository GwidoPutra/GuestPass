import 'package:dio/dio.dart';
import 'package:guestpass_mobile/data/models/guest.dart';
import 'package:guestpass_mobile/data/providers/dio_provider.dart';

/// Repository untuk operasi Guest
class GuestRepository {
  final Dio _dio;

  GuestRepository({Dio? dio}) : _dio = dio ?? DioProvider.createDio();

  /// Ambil semua tamu berdasarkan event ID
  Future<List<Guest>> getGuests(String eventId) async {
    final response = await _dio.get('/Guest', queryParameters: {'eventId': eventId});
    final List<dynamic> data = response.data;
    return data.map((json) => Guest.fromJson(json)).toList();
  }

  /// Ambil detail tamu
  Future<Guest> getGuest(String id) async {
    final response = await _dio.get('/Guest/$id');
    return Guest.fromJson(response.data);
  }

  /// Tambah tamu baru
  Future<Guest> createGuest({
    required String eventId,
    required String name,
    required String email,
  }) async {
    final response = await _dio.post('/Guest', data: {
      'eventId': eventId,
      'name': name,
      'email': email,
    });
    return Guest.fromJson(response.data);
  }

  /// Check-in tamu
  Future<Guest> checkInGuest(String id) async {
    final response = await _dio.put('/Guest/$id/checkin');
    return Guest.fromJson(response.data);
  }

  /// Hapus tamu
  Future<void> deleteGuest(String id) async {
    await _dio.delete('/Guest/$id');
  }
}
