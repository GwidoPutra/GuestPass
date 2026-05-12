import 'package:dio/dio.dart';
import 'package:guestpass_mobile/data/models/profile.dart';
import 'package:guestpass_mobile/data/providers/dio_provider.dart';

/// Repository untuk operasi Profile/Panitia
class ProfileRepository {
  final Dio _dio;

  ProfileRepository({Dio? dio}) : _dio = dio ?? DioProvider.createDio();

  /// Ambil semua profil panitia
  Future<List<Profile>> getProfiles() async {
    final response = await _dio.get('/Profile');
    final List<dynamic> data = response.data;
    return data.map((json) => Profile.fromJson(json)).toList();
  }

  /// Ambil detail profil
  Future<Profile> getProfile(String id) async {
    final response = await _dio.get('/Profile/$id');
    return Profile.fromJson(response.data);
  }

  /// Toggle approval status
  Future<Profile> toggleApproval(String id) async {
    final response = await _dio.put('/Profile/$id/approve');
    return Profile.fromJson(response.data);
  }

  /// Hapus profil
  Future<void> deleteProfile(String id) async {
    await _dio.delete('/Profile/$id');
  }
}
