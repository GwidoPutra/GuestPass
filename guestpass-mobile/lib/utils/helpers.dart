import 'package:intl/intl.dart';

/// Helper utilities

class AppHelpers {
  /// Format tanggal ke format Indonesia
  static String formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return DateFormat('d MMM yyyy', 'id_ID').format(date);
  }

  /// Format tanggal lengkap dengan waktu
  static String formatDateTime(String dateStr) {
    final date = DateTime.parse(dateStr);
    return DateFormat('EEEE, d MMMM yyyy HH:mm', 'id_ID').format(date);
  }

  /// Format tanggal singkat
  static String formatDateShort(String dateStr) {
    final date = DateTime.parse(dateStr);
    return DateFormat('d/M/yyyy').format(date);
  }
}
