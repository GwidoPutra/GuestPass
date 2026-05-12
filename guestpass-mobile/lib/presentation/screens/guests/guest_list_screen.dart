import 'package:flutter/material.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/guest.dart';
import 'package:guestpass_mobile/data/repositories/guest_repository.dart';
import 'package:guestpass_mobile/presentation/screens/guests/guest_create_screen.dart';
import 'package:guestpass_mobile/presentation/screens/guests/guest_detail_screen.dart';

/// Layar Daftar Tamu per Event
class GuestListScreen extends StatefulWidget {
  final String eventId;
  final String eventName;

  const GuestListScreen({super.key, required this.eventId, required this.eventName});

  @override
  State<GuestListScreen> createState() => _GuestListScreenState();
}

class _GuestListScreenState extends State<GuestListScreen> {
  final GuestRepository _guestRepo = GuestRepository();
  bool _isLoading = true;
  List<Guest> _guests = [];

  @override
  void initState() {
    super.initState();
    _loadGuests();
  }

  Future<void> _loadGuests() async {
    setState(() => _isLoading = true);
    try {
      final guests = await _guestRepo.getGuests(widget.eventId);
      if (mounted) setState(() { _guests = guests; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleCheckIn(Guest guest) async {
    try {
      await _guestRepo.checkInGuest(guest.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tamu berhasil check-in.'), backgroundColor: AppColors.success),
      );
      _loadGuests();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Check-in gagal.'), backgroundColor: AppColors.destructive),
      );
    }
  }

  Future<void> _handleDelete(Guest guest) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Tamu'),
        content: Text('Hapus ${guest.name} dari daftar tamu?'),
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
        await _guestRepo.deleteGuest(guest.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tamu berhasil dihapus.'), backgroundColor: AppColors.success),
          );
          _loadGuests();
        }
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal menghapus tamu.'), backgroundColor: AppColors.destructive),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Daftar Tamu', style: TextStyle(fontSize: 16)),
            Text(widget.eventName, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => GuestCreateScreen(eventId: widget.eventId)),
              );
              if (result == true) _loadGuests();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _guests.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.people_outline, size: 48, color: AppColors.muted),
                      const SizedBox(height: 12),
                      const Text('Belum ada tamu', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      const Text('Tambahkan tamu pertama', style: TextStyle(fontSize: 13, color: AppColors.muted)),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () async {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => GuestCreateScreen(eventId: widget.eventId)),
                          );
                          if (result == true) _loadGuests();
                        },
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Tambah Tamu'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadGuests,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: _guests.length,
                    separatorBuilder: (_, i) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final guest = _guests[index];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            // Avatar
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: guest.isCheckedIn ? AppColors.successLight : AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: Text(
                                  guest.name.isNotEmpty ? guest.name[0].toUpperCase() : 'T',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: guest.isCheckedIn ? AppColors.success : AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Info
                            Expanded(
                              child: GestureDetector(
                                onTap: () async {
                                  final result = await Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => GuestDetailScreen(guestId: guest.id, eventId: widget.eventId)),
                                  );
                                  if (result == true) _loadGuests();
                                },
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      guest.name,
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.foreground),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(guest.email, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                                  ],
                                ),
                              ),
                            ),

                            // Status + Actions
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (guest.isCheckedIn)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.successLight,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Text('Hadir', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.success)),
                                  )
                                else
                                  GestureDetector(
                                    onTap: () => _handleCheckIn(guest),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryLight,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text('Check-in', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                                    ),
                                  ),
                                const SizedBox(width: 6),
                                GestureDetector(
                                  onTap: () => _handleDelete(guest),
                                  child: const Icon(Icons.delete_outline, size: 18, color: AppColors.muted),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
