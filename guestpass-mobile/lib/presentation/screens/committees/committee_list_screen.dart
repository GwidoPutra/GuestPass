import 'package:flutter/material.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/profile.dart';
import 'package:guestpass_mobile/data/repositories/profile_repository.dart';
import 'package:guestpass_mobile/presentation/screens/committees/committee_detail_screen.dart';

/// Layar Daftar Panitia
class CommitteeListScreen extends StatefulWidget {
  const CommitteeListScreen({super.key});

  @override
  State<CommitteeListScreen> createState() => _CommitteeListScreenState();
}

class _CommitteeListScreenState extends State<CommitteeListScreen> {
  final ProfileRepository _profileRepo = ProfileRepository();
  bool _isLoading = true;
  List<Profile> _profiles = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProfiles();
  }

  Future<void> _loadProfiles() async {
    setState(() => _isLoading = true);
    try {
      final profiles = await _profileRepo.getProfiles();
      if (mounted) setState(() { _profiles = profiles; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() { _error = 'Gagal memuat daftar panitia.'; _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final approvedCount = _profiles.where((p) => p.isApproved).length;

    return Scaffold(
      appBar: AppBar(title: const Text('Panitia')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 40, color: AppColors.muted),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppColors.muted)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loadProfiles, child: const Text('Coba Lagi')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadProfiles,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Stats
                        Row(
                          children: [
                            Expanded(child: _buildStatCard('Total', _profiles.length.toString(), Icons.people, AppColors.primary, AppColors.primaryLight)),
                            const SizedBox(width: 10),
                            Expanded(child: _buildStatCard('Disetujui', approvedCount.toString(), Icons.check_circle, AppColors.success, AppColors.successLight)),
                            const SizedBox(width: 10),
                            Expanded(child: _buildStatCard('Menunggu', (_profiles.length - approvedCount).toString(), Icons.schedule, AppColors.accent, AppColors.accentLight)),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // List
                        if (_profiles.isEmpty)
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
                                Icon(Icons.people_outline, size: 40, color: AppColors.muted),
                                SizedBox(height: 10),
                                Text('Belum ada panitia terdaftar', style: TextStyle(fontSize: 13, color: AppColors.muted)),
                              ],
                            ),
                          )
                        else
                          ...(_profiles.map((profile) => _buildProfileTile(profile))),
                      ],
                    ),
                  ),
                ),
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
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
        ],
      ),
    );
  }

  Widget _buildProfileTile(Profile profile) {
    return GestureDetector(
      onTap: () async {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => CommitteeDetailScreen(profileId: profile.id)),
        );
        if (result == true) _loadProfiles();
      },
      child: Container(
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
                color: profile.isApproved ? AppColors.successLight : AppColors.accentLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  profile.fullName.isNotEmpty ? profile.fullName[0].toUpperCase() : 'P',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: profile.isApproved ? AppColors.success : AppColors.accent,
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
                    profile.fullName,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.foreground),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(profile.email, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: profile.isApproved ? AppColors.successLight : AppColors.accentLight,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                profile.isApproved ? 'Disetujui' : 'Menunggu',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: profile.isApproved ? AppColors.success : AppColors.accent,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
