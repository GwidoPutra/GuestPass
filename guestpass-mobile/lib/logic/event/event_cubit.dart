import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guestpass_mobile/data/repositories/event_repository.dart';
import 'package:guestpass_mobile/logic/event/event_state.dart';

/// Cubit untuk mengelola state Event
class EventCubit extends Cubit<EventState> {
  final EventRepository _eventRepository;

  EventCubit({EventRepository? eventRepository})
      : _eventRepository = eventRepository ?? EventRepository(),
        super(EventInitial());

  /// Ambil semua event
  Future<void> loadEvents() async {
    emit(EventLoading());
    try {
      final events = await _eventRepository.getEvents();
      emit(EventLoaded(events: events));
    } on DioException catch (e) {
      emit(EventError(message: _extractError(e)));
    } catch (_) {
      emit(const EventError(message: 'Gagal memuat daftar event.'));
    }
  }

  /// Ambil detail event
  Future<void> loadEventDetail(String id) async {
    emit(EventLoading());
    try {
      final event = await _eventRepository.getEvent(id);
      emit(EventDetailLoaded(event: event));
    } on DioException catch (e) {
      emit(EventError(message: _extractError(e)));
    } catch (_) {
      emit(const EventError(message: 'Gagal memuat detail event.'));
    }
  }

  /// Buat event baru
  Future<void> createEvent({
    required String name,
    required String location,
    required String date,
  }) async {
    emit(EventLoading());
    try {
      await _eventRepository.createEvent(name: name, location: location, date: date);
      emit(const EventSuccess(message: 'Event berhasil dibuat.'));
    } on DioException catch (e) {
      emit(EventError(message: _extractError(e)));
    } catch (_) {
      emit(const EventError(message: 'Gagal membuat event.'));
    }
  }

  /// Update event
  Future<void> updateEvent({
    required String id,
    required String name,
    required String location,
    required String date,
  }) async {
    emit(EventLoading());
    try {
      await _eventRepository.updateEvent(id: id, name: name, location: location, date: date);
      emit(const EventSuccess(message: 'Event berhasil diperbarui.'));
    } on DioException catch (e) {
      emit(EventError(message: _extractError(e)));
    } catch (_) {
      emit(const EventError(message: 'Gagal memperbarui event.'));
    }
  }

  /// Hapus event
  Future<void> deleteEvent(String id) async {
    emit(EventLoading());
    try {
      await _eventRepository.deleteEvent(id);
      emit(const EventSuccess(message: 'Event berhasil dihapus.'));
    } on DioException catch (e) {
      emit(EventError(message: _extractError(e)));
    } catch (_) {
      emit(const EventError(message: 'Gagal menghapus event.'));
    }
  }

  String _extractError(DioException e) {
    if (e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map<String, dynamic>) {
        return data['message'] as String? ?? 'Terjadi kesalahan.';
      }
      if (data is String) return data;
    }
    return 'Terjadi kesalahan jaringan.';
  }
}
