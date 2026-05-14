import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/event.dart';
import 'package:guestpass_mobile/data/repositories/event_repository.dart';
import 'package:guestpass_mobile/data/repositories/guest_repository.dart';
import 'package:guestpass_mobile/logic/auth/auth_cubit.dart';
import 'package:guestpass_mobile/utils/helpers.dart';

/// Layar Dashboard / Ringkasan
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final EventRepository _eventRepo = EventRepository();
  final GuestRepository _guestRepo = GuestRepository();

  bool _isLoading = true;
  int _totalEvents = 0;
  int _totalGuests = 0;
  int _checkedIn = 0;
  List<Event> _recentEvents = [];

  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final events = await _eventRepo.getEvents();
      _recentEvents = events.take(5).toList();
      _totalEvents = events.length;

      int totalGuests = 0;
      int checkedIn = 0;

      for (final event in events) {
        final guests = await _guestRepo.getGuests(event.id);
        totalGuests += guests.length;
        checkedIn += guests.where((g) => g.isCheckedIn).length;
      }

      if (mounted) {
        setState(() {
          _totalGuests = totalGuests;
          _checkedIn = checkedIn;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ringkasan'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Logout'),
                  content: const Text('Apakah Anda yakin ingin keluar?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Batal'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        context.read<AuthCubit>().logout();
                      },
                      child: const Text('Logout', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text(
                'Selamat datang kembali',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.muted,
                ),
              ),
              const SizedBox(height: 20),

              // Error message
              if (_errorMessage != null)
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(fontSize: 12, color: Colors.red.shade700),
                  ),
                ),

              // Stats cards
              _buildStatsSection(),
              const SizedBox(height: 28),

              // Recent events
              _buildRecentEventsSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    if (_isLoading) {
      return Row(
        children: List.generate(3, (_) => Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            height: 90,
            decoration: BoxDecoration(
              color: AppColors.border.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        )),
      );
    }

    return Row(
      children: [
        Expanded(child: _buildStatCard('Event', _totalEvents.toString(), Icons.event, AppColors.primary, AppColors.primaryLight)),
        const SizedBox(width: 10),
        Expanded(child: _buildStatCard('Tamu', _totalGuests.toString(), Icons.people, AppColors.accent, AppColors.accentLight)),
        const SizedBox(width: 10),
        Expanded(child: _buildStatCard('Check-in', _checkedIn.toString(), Icons.check_circle, AppColors.success, AppColors.successLight)),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.muted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentEventsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Event Terbaru',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 12),
        if (_isLoading)
          ...List.generate(3, (_) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.border.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(12),
            ),
          ))
        else if (_recentEvents.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 40),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: const Column(
              children: [
                Icon(Icons.event_outlined, size: 36, color: AppColors.muted),
                SizedBox(height: 10),
                Text(
                  'Belum ada event',
                  style: TextStyle(fontSize: 13, color: AppColors.muted),
                ),
              ],
            ),
          )
        else
          ...(_recentEvents.map((event) => _buildEventTile(event))),
      ],
    );
  }

  Widget _buildEventTile(Event event) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                event.name.isNotEmpty ? event.name[0].toUpperCase() : 'E',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  event.location,
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Text(
            AppHelpers.formatDate(event.date.toIso8601String()),
            style: const TextStyle(fontSize: 11, color: AppColors.muted),
          ),
        ],
      ),
    );
  }
}
