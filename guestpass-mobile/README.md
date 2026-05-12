# GuestPass Mobile

Aplikasi mobile Flutter untuk manajemen tamu event dengan QR Code check-in. Mendukung scan QR code untuk check-in otomatis.

## Teknologi Utama

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Flutter | 3.x | Framework mobile cross-platform |
| Dart | 3.x | Bahasa pemrograman |
| flutter_bloc (Cubit) | 9.1 | State management |
| Dio | 5.7 | HTTP client |
| GoRouter | 14.8 | Navigation |
| flutter_secure_storage | 9.2 | Penyimpanan token aman |
| qr_flutter | 4.1 | Tampilan QR code |
| mobile_scanner | 6.0 | QR code scanner (kamera) |
| google_fonts | 6.3 | Typography |

## Arsitektur

Proyek ini menerapkan **Clean Architecture** dengan BLoC/Cubit pattern:

```
lib/
├── main.dart                    → Entry point
├── app.dart                     → Root widget + BlocProvider
├── config/
│   ├── theme.dart               → Color palette & ThemeData
│   ├── routes.dart              → GoRouter configuration
│   └── api_config.dart          → Base URL & timeout
├── data/
│   ├── models/                  → Data models (Event, Guest, Profile)
│   ├── repositories/            → API calls via Dio
│   └── providers/               → Dio instance + JWT interceptor
├── logic/
│   ├── auth/                    → AuthCubit + AuthState
│   └── event/                   → EventCubit + EventState
├── presentation/
│   ├── screens/
│   │   ├── auth/                → Login, Register
│   │   ├── dashboard/           → MainShell, DashboardScreen
│   │   ├── events/              → List, Detail, Create, Edit
│   │   ├── guests/              → List, Detail, Create
│   │   ├── scanner/             → QR Scanner
│   │   └── committees/          → List, Detail
│   └── widgets/                 → Reusable components
└── utils/
    └── helpers.dart             → Date formatting utilities
```

### Pola Desain

- **BLoC/Cubit Pattern** — State management terpisah dari UI
- **Repository Pattern** — Abstraksi API calls
- **Dependency Injection** — Via constructor injection
- **Separation of Concerns** — Data, Logic, Presentation terpisah

## Fitur

| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | Login & Register | Autentikasi dengan JWT token |
| 2 | Dashboard | Statistik event, tamu, check-in |
| 3 | Manajemen Event | CRUD event (buat, lihat, edit, hapus) |
| 4 | Manajemen Tamu | Tambah, lihat detail, check-in manual, hapus |
| 5 | QR Code Display | Tampilkan QR code unik per tamu |
| 6 | QR Scanner | Scan QR code → auto check-in via kamera |
| 7 | Manajemen Panitia | Lihat, setujui/cabut, hapus akun panitia |
| 8 | Pull-to-Refresh | Refresh data dengan gesture |

## Setup Lokal

### Prasyarat

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.x)
- Android Studio atau VS Code dengan Flutter extension
- Android Emulator atau device fisik (min API 24 / Android 7.0)
- Backend GuestPass API berjalan di localhost

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/GuestPass.git
   cd GuestPass/guestpass-mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Konfigurasi API URL**
   
   Edit `lib/config/api_config.dart`:
   ```dart
   // Untuk Android Emulator (localhost = 10.0.2.2)
   static const String baseUrl = 'http://10.0.2.2:5000/api';
   
   // Untuk device fisik (ganti dengan IP komputer Anda)
   // static const String baseUrl = 'http://192.168.x.x:5000/api';
   ```

4. **Pastikan backend berjalan**
   ```bash
   cd ../GuestPass.Api
   dotnet run
   ```

5. **Jalankan aplikasi**
   ```bash
   flutter run
   ```

## Build APK

### Debug APK
```bash
flutter build apk --debug
```
Output: `build/app/outputs/flutter-apk/app-debug.apk`

### Release APK
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

### Install APK ke device
```bash
flutter install
```

## Color Palette

| Warna | Hex | Penggunaan |
|-------|-----|------------|
| Navy | #003049 | Primary, sidebar, buttons |
| Red | #D62828 | Destructive, error states |
| Orange | #F77F00 | Accent, pending status |
| Gold | #FCBF49 | Secondary accent |
| Green | #16A34A | Success, check-in status |

## Navigasi

```
Login / Register
    ↓
Main Shell (Bottom Navigation)
├── Tab 1: Ringkasan (Dashboard)
├── Tab 2: Event
│   ├── Daftar Event
│   ├── Detail Event → Edit / Hapus
│   └── Buat Event
│   └── Daftar Tamu
│       ├── Tambah Tamu
│       ├── Detail Tamu (QR Code)
│       └── Check-in / Hapus
├── Tab 3: QR Scanner
│   └── Scan → Auto Check-in
└── Tab 4: Panitia
    ├── Daftar Panitia
    └── Detail → Setujui / Cabut / Hapus
```

## Minimum Requirements

- Android API 24 (Android 7.0 Nougat) atau lebih tinggi
- Kamera untuk fitur QR Scanner
- Koneksi internet untuk komunikasi dengan backend API

## Lisensi

MIT License
