import 'package:flutter/material.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/event.dart';
import 'package:guestpass_mobile/data/repositories/event_repository.dart';
import 'package:guestpass_mobile/data/repositories/guest_repository.dart';
import 'package:guestpass_mobile/data/models/guest.dart';
import 'package:guestpass_mobile/presentation/screens/events/event_edit_screen.dart';
import 'package:guestpass_mobile/presentation/screens/guests/guest_list_screen.dart';
import 'package:guestpass_mobile/utils/helpers.dart';

/// Layar Detail Event
class EventDetailScreen extends StatefulWidget {
  final String eventId;

  const EventDetailScreen({super.key, required this.eventId});

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  final EventRepository _eventRepo = EventRepository();
  final GuestRepository _guestRepo = GuestRepository();

  bool _isLoading = true;
  Event? _event;
  List<Guest> _guests = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final event = await _eventRepo.getEvent(widget.eventId);
      final guests = await _guestRepo.getGuests(widget.eventId);
      if (mounted) {
        setState(() {
          _event = event;
          _guests = guests;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Gagal memuat detail event.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Event'),
        content: const Text('Tindakan ini akan menghapus event beserta seluruh data tamu. Lanjutkan?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: AppColors.destructive)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _eventRepo.deleteEvent(widget.eventId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Event berhasil dihapus.'), backgroundColor: AppColors.success),
          );
          Navigator.pop(context, true);
        }
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal menghapus event.'), backgroundColor: AppColors.destructive),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null || _event == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(_error ?? 'Event tidak ditemukan.', style: const TextStyle(color: AppColors.muted))),
      );
    }

    final checkedIn = _guests.where((g) => g.isCheckedIn).length;
    final checkInRate = _guests.isNotEmpty ? (checkedIn / _guests.length * 100).round() : 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(_event!.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, size: 20),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => EventEditScreen(event: _event!)),
              );
              if (result == true) _loadData();
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.destructive),
            onPressed: _handleDelete,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Event info card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildInfoRow(Icons.location_on_outlined, 'Lokasi', _event!.location),
                    const SizedBox(height: 14),
                    _buildInfoRow(Icons.access_time, 'Tanggal & Waktu', AppHelpers.formatDateTime(_event!.date.toIso8601String())),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Stats
              const Text(
                'Statistik Tamu',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.foreground),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildStatCard('Total', _guests.length.toString(), AppColors.primary, AppColors.primaryLight)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildStatCard('Hadir', checkedIn.toString(), AppColors.success, AppColors.successLight)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildStatCard('Menunggu', (_guests.length - checkedIn).toString(), AppColors.accent, AppColors.accentLight)),
                ],
              ),
              const SizedBox(height: 16),

              // Progress bar
              if (_guests.isNotEmpty) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Progres check-in', style: TextStyle(fontSize: 12, color: AppColors.muted)),
                    Text('$checkInRate%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: _guests.isNotEmpty ? checkedIn / _guests.length : 0,
                    backgroundColor: AppColors.border,
                    color: AppColors.success,
                    minHeight: 6,
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Manage guests button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => GuestListScreen(eventId: widget.eventId, eventName: _event!.name)),
                    );
                    if (result == true) _loadData();
                  },
                  icon: const Icon(Icons.people_outline, size: 18),
                  label: const Text('Kelola Tamu'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: AppColors.muted),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppColors.muted, fontWeight: FontWeight.w500)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.foreground)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
        ],
      ),
    );
  }
}
