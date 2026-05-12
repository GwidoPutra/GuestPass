/// Konfigurasi API untuk koneksi ke backend
class ApiConfig {
  // Untuk device fisik, gunakan IP lokal komputer di jaringan WiFi yang sama
  // Untuk Android Emulator, gunakan 10.0.2.2
  static const String baseUrl = 'http://192.168.1.16:5203/api';

  // Timeout dalam milidetik
  static const int connectTimeout = 10000;
  static const int receiveTimeout = 10000;
}
