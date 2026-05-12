import 'package:flutter/material.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/profile.dart';
import 'package:guestpass_mobile/data/repositories/profile_repository.dart';
import 'package:guestpass_mobile/utils/helpers.dart';

/// Layar Detail Panitia
class CommitteeDetailScreen extends StatefulWidget {
  final String profileId;

  const CommitteeDetailScreen({super.key, required this.profileId});

  @override
  State<CommitteeDetailScreen> createState() => _CommitteeDetailScreenState();
}

class _CommitteeDetailScreenState extends State<CommitteeDetailScreen> {
  final ProfileRepository _profileRepo = ProfileRepository();
  bool _isLoading = true;
  Profile? _profile;
  bool _isToggling = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _profileRepo.getProfile(widget.profileId);
      if (mounted) setState(() { _profile = profile; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleToggleApproval() async {
    if (_profile == null) return;
    setState(() => _isToggling = true);
    try {
      final updated = await _profileRepo.toggleApproval(widget.profileId);
      if (mounted) {
        setState(() { _profile = updated; _isToggling = false; });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(updated.isApproved ? 'Akun berhasil disetujui.' : 'Persetujuan dicabut.'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isToggling = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal memperbarui status.'), backgroundColor: AppColors.destructive),
        );
      }
    }
  }

  Future<void> _handleDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Akun'),
        content: Text('Hapus akun ${_profile?.fullName}? Tindakan ini tidak dapat dibatalkan.'),
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
        await _profileRepo.deleteProfile(widget.profileId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Akun berhasil dihapus.'), backgroundColor: AppColors.success),
          );
          Navigator.pop(context, true);
        }
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal menghapus akun.'), backgroundColor: AppColors.destructive),
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

    if (_profile == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Profil tidak ditemukan.', style: TextStyle(color: AppColors.muted))),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_profile!.fullName),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.destructive),
            onPressed: _handleDelete,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: _profile!.isApproved ? AppColors.successLight : AppColors.accentLight,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  _profile!.fullName.isNotEmpty ? _profile!.fullName[0].toUpperCase() : 'P',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    color: _profile!.isApproved ? AppColors.success : AppColors.accent,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _profile!.fullName,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.foreground),
            ),
            Text('@${_profile!.username}', style: const TextStyle(fontSize: 13, color: AppColors.muted)),
            const SizedBox(height: 24),

            // Detail card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Detail Akun', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 14),
                  _buildDetailRow('Email', _profile!.email),
                  const Divider(height: 20),
                  _buildDetailRow('Username', '@${_profile!.username}'),
                  const Divider(height: 20),
                  _buildDetailRow('Peran', _profile!.role ?? 'panitia'),
                  const Divider(height: 20),
                  _buildDetailRow(
                    'Status',
                    _profile!.isApproved ? 'Disetujui' : 'Menunggu',
                    valueColor: _profile!.isApproved ? AppColors.success : AppColors.accent,
                  ),
                  const Divider(height: 20),
                  _buildDetailRow('Terdaftar', AppHelpers.formatDateTime(_profile!.createdAt.toIso8601String())),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Toggle approval button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isToggling ? null : _handleToggleApproval,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _profile!.isApproved ? AppColors.accent : AppColors.success,
                ),
                icon: _isToggling
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Icon(_profile!.isApproved ? Icons.block : Icons.check_circle_outline, size: 18),
                label: Text(_profile!.isApproved ? 'Cabut Persetujuan' : 'Setujui Akun'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.muted)),
        Text(
          value,
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: valueColor ?? AppColors.foreground),
        ),
      ],
    );
  }
}
