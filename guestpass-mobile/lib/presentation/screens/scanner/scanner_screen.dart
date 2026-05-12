import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/data/models/guest.dart';
import 'package:guestpass_mobile/data/repositories/event_repository.dart';
import 'package:guestpass_mobile/data/repositories/guest_repository.dart';

/// Layar QR Scanner untuk check-in tamu otomatis
class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController();
  final GuestRepository _guestRepo = GuestRepository();
  final EventRepository _eventRepo = EventRepository();

  bool _isProcessing = false;
  String? _lastScannedCode;
  _ScanResult? _scanResult;

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _handleScan(String qrCode) async {
    // Hindari scan berulang untuk kode yang sama
    if (_isProcessing || qrCode == _lastScannedCode) return;

    setState(() {
      _isProcessing = true;
      _lastScannedCode = qrCode;
      _scanResult = null;
    });

    try {
      // Cari tamu berdasarkan QR token di semua event milik user
      final events = await _eventRepo.getEvents();
      Guest? foundGuest;
      String? eventName;

      for (final event in events) {
        final guests = await _guestRepo.getGuests(event.id);
        final match = guests.where((g) => g.qrCodeToken == qrCode).toList();
        if (match.isNotEmpty) {
          foundGuest = match.first;
          eventName = event.name;
          break;
        }
      }

      if (foundGuest == null) {
        setState(() {
          _scanResult = _ScanResult(
            success: false,
            message: 'Kode QR tidak ditemukan.',
          );
          _isProcessing = false;
        });
        return;
      }

      if (foundGuest.isCheckedIn) {
        setState(() {
          _scanResult = _ScanResult(
            success: false,
            message: '${foundGuest!.name} sudah check-in sebelumnya.',
            guestName: foundGuest.name,
            eventName: eventName,
          );
          _isProcessing = false;
        });
        return;
      }

      // Lakukan check-in
      await _guestRepo.checkInGuest(foundGuest.id);

      setState(() {
        _scanResult = _ScanResult(
          success: true,
          message: 'Check-in berhasil!',
          guestName: foundGuest!.name,
          eventName: eventName,
        );
        _isProcessing = false;
      });
    } catch (_) {
      setState(() {
        _scanResult = _ScanResult(
          success: false,
          message: 'Gagal memproses check-in.',
        );
        _isProcessing = false;
      });
    }
  }

  void _resetScanner() {
    setState(() {
      _lastScannedCode = null;
      _scanResult = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR Scanner'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_outlined),
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.cameraswitch_outlined),
            onPressed: () => _scannerController.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Scanner area
          Expanded(
            flex: 3,
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _scannerController,
                  onDetect: (capture) {
                    final barcodes = capture.barcodes;
                    if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
                      _handleScan(barcodes.first.rawValue!);
                    }
                  },
                ),
                // Overlay frame
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white.withValues(alpha: 0.7), width: 2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                // Processing indicator
                if (_isProcessing)
                  Container(
                    color: Colors.black54,
                    child: const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  ),
              ],
            ),
          ),

          // Result area
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              color: AppColors.surface,
              child: _scanResult != null
                  ? _buildResultCard()
                  : _buildInstructions(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInstructions() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.qr_code_scanner, size: 48, color: AppColors.muted.withValues(alpha: 0.5)),
        const SizedBox(height: 16),
        const Text(
          'Arahkan kamera ke kode QR tamu',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.foreground),
        ),
        const SizedBox(height: 6),
        const Text(
          'Check-in akan dilakukan secara otomatis',
          style: TextStyle(fontSize: 13, color: AppColors.muted),
        ),
      ],
    );
  }

  Widget _buildResultCard() {
    final result = _scanResult!;
    final isSuccess = result.success;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Icon
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: isSuccess ? AppColors.successLight : AppColors.destructiveLight,
            shape: BoxShape.circle,
          ),
          child: Icon(
            isSuccess ? Icons.check_circle : Icons.error_outline,
            size: 28,
            color: isSuccess ? AppColors.success : AppColors.destructive,
          ),
        ),
        const SizedBox(height: 16),

        // Message
        Text(
          result.message,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: isSuccess ? AppColors.success : AppColors.destructive,
          ),
          textAlign: TextAlign.center,
        ),

        // Guest info
        if (result.guestName != null) ...[
          const SizedBox(height: 8),
          Text(
            result.guestName!,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.foreground),
          ),
          if (result.eventName != null)
            Text(
              result.eventName!,
              style: const TextStyle(fontSize: 12, color: AppColors.muted),
            ),
        ],

        const SizedBox(height: 20),

        // Scan again button
        OutlinedButton.icon(
          onPressed: _resetScanner,
          icon: const Icon(Icons.qr_code_scanner, size: 18),
          label: const Text('Scan Lagi'),
        ),
      ],
    );
  }
}

/// Model internal untuk hasil scan
class _ScanResult {
  final bool success;
  final String message;
  final String? guestName;
  final String? eventName;

  _ScanResult({
    required this.success,
    required this.message,
    this.guestName,
    this.eventName,
  });
}
