/// Konfigurasi API untuk koneksi ke backend
class ApiConfig {
  // Production URL (Railway) - ganti dengan URL Railway kamu setelah deploy
  static const String productionUrl = 'https://guestpass-production.up.railway.app/api';

  // Local development URL
  // Untuk device fisik, gunakan IP lokal komputer di jaringan WiFi yang sama
  // Untuk Android Emulator, gunakan 10.0.2.2
  static const String localUrl = 'http://192.168.1.16:5203/api';

  // Set ke false untuk development lokal, true untuk production
  static const bool useProduction = true;

  static String get baseUrl => useProduction ? productionUrl : localUrl;

  // Timeout dalam milidetik
  static const int connectTimeout = 10000;
  static const int receiveTimeout = 10000;
}
