import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/guest.dart';
import 'package:guestpass_mobile/data/repositories/guest_repository.dart';
import 'package:guestpass_mobile/utils/helpers.dart';

/// Layar Detail Tamu + QR Code
class GuestDetailScreen extends StatefulWidget {
  final String guestId;
  final String eventId;

  const GuestDetailScreen({super.key, required this.guestId, required this.eventId});

  @override
  State<GuestDetailScreen> createState() => _GuestDetailScreenState();
}

class _GuestDetailScreenState extends State<GuestDetailScreen> {
  final GuestRepository _guestRepo = GuestRepository();
  bool _isLoading = true;
  Guest? _guest;

  @override
  void initState() {
    super.initState();
    _loadGuest();
  }

  Future<void> _loadGuest() async {
    try {
      final guest = await _guestRepo.getGuest(widget.guestId);
      if (mounted) setState(() { _guest = guest; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _copyToken() {
    if (_guest == null) return;
    Clipboard.setData(ClipboardData(text: _guest!.qrCodeToken));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Token disalin ke clipboard.'), duration: Duration(seconds: 2)),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_guest == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Tamu tidak ditemukan.', style: TextStyle(color: AppColors.muted))),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(_guest!.name)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // QR Code card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  const Text('Kode QR', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 16),
                  QrImageView(
                    data: _guest!.qrCodeToken,
                    version: QrVersions.auto,
                    size: 200,
                    gapless: true,
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: _copyToken,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _guest!.qrCodeToken,
                            style: const TextStyle(fontSize: 13, fontFamily: 'monospace', color: AppColors.muted),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.copy, size: 14, color: AppColors.muted),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Tunjukkan kode QR ini kepada panitia untuk check-in.',
                    style: TextStyle(fontSize: 12, color: AppColors.muted),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

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
                  const Text('Detail', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 14),
                  _buildDetailRow('Email', _guest!.email),
                  const Divider(height: 20),
                  _buildDetailRow('Status', _guest!.isCheckedIn ? 'Hadir' : 'Menunggu',
                      valueColor: _guest!.isCheckedIn ? AppColors.success : AppColors.accent),
                  const Divider(height: 20),
                  _buildDetailRow('Waktu check-in',
                      _guest!.checkedInAt != null ? AppHelpers.formatDateTime(_guest!.checkedInAt!.toIso8601String()) : '—'),
                  const Divider(height: 20),
                  _buildDetailRow('Terdaftar', AppHelpers.formatDateTime(_guest!.createdAt.toIso8601String())),
                ],
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
