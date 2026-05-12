/// Konfigurasi API untuk koneksi ke backend
class ApiConfig {
  // Untuk Android Emulator, 10.0.2.2 = localhost host machine
  // Untuk device fisik, ganti dengan IP lokal komputer Anda
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  // Timeout dalam milidetik
  static const int connectTimeout = 10000;
  static const int receiveTimeout = 10000;
}
