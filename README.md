# GuestPass (Event Guestlist Manager)

## Deskripsi Proyek

**GuestPass** adalah sistem manajemen tamu event berbasis QR Code yang dibangun sebagai ekosistem full-stack. Aplikasi ini menyelesaikan permasalahan manajemen tamu manual pada acara besar (seminar, konferensi, acara korporat) yang rentan terhadap kesalahan manusia, memperlambat antrean, dan sulit dipantau secara real-time.

Sistem terdiri dari 3 komponen:
- **Backend API** — ASP.NET Core 8.0 + PostgreSQL (deployed di Railway)
- **Frontend Web** — Next.js 16 + React 19 + Tailwind CSS (deployed di Vercel)
- **Frontend Mobile** — Flutter 3.x dengan BLoC pattern (Android APK)

---

## Live Demo & Deployment

| Komponen | URL |
|----------|-----|
| Backend API (Swagger) | https://guestpass-production.up.railway.app/swagger |
| Backend Health Check | https://guestpass-production.up.railway.app/health |
| Frontend Web | https://guestpass-frontend.vercel.app |
| Mobile APK | [Download APK](https://github.com/GwidoPutra/GuestPass/releases/download/v1.0.0/app-release.apk) |

### Akun Demo

Gunakan akun berikut untuk mengakses aplikasi (Web & Mobile):

| Field | Value |
|-------|-------|
| Email | `admin@guestpass.com` |
| Password | `admin123` |
| Role | Super Admin |

Akun ini memiliki akses penuh ke semua fitur termasuk manajemen panitia.

### Cara Menggunakan

1. **Web Dashboard** — Buka https://guestpass-frontend.vercel.app → Login dengan akun di atas
2. **Swagger API** — Buka https://guestpass-production.up.railway.app/swagger → Gunakan `POST /api/Auth/login` untuk mendapatkan token → Klik "Authorize" → Paste token
3. **Mobile App** — Build APK (lihat instruksi di `guestpass-mobile/README.md`) → Install → Login dengan akun di atas

---

## Teknologi Utama

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| ASP.NET Core | 8.0 LTS | Web API Framework |
| PostgreSQL | 15+ | Database (hosted di Supabase) |
| Entity Framework Core | 8.0 | ORM (Create, Update, Delete) |
| Dapper | 2.1 | Raw SQL Queries (Read) |
| JWT Bearer | 8.0 | Autentikasi & Otorisasi |
| Serilog | 8.0 | Structured Logging |
| Swagger/OpenAPI | 6.6 | Dokumentasi API |
| BCrypt | 4.1 | Password Hashing |
| Brevo API | - | Transactional Email (QR Code) |
| Docker | - | Containerization |

### Frontend Web
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.2 | Framework (App Router) |
| React | 19.2 | UI Library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (utility-first) |
| Axios | 1.16 | HTTP client + JWT interceptor |
| shadcn/ui | - | Component library |

### Frontend Mobile
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Flutter | 3.x | Framework cross-platform |
| flutter_bloc (Cubit) | 9.1 | State management |
| Dio | 5.7 | HTTP client |
| GoRouter | 14.8 | Navigation |
| flutter_secure_storage | 9.2 | Penyimpanan token aman |
| mobile_scanner | 6.0 | QR code scanner |

---

## Arsitektur & Pola Desain

### Backend — Layered Architecture
```
Controllers → Services → Repositories → Database
```
- **Repository Pattern** — Dapper untuk READ, EF Core untuk CUD
- **Service Pattern** — Business logic terpisah dari controller
- **Dependency Injection** — Semua dependency di-register di Program.cs
- **Global Exception Handling** — Middleware menangkap semua unhandled exception
- **DTO Pattern** — Request/Response models dengan Data Annotations validation

### Frontend Web — App Router Architecture
- **React Context API** — State management (auth + toast)
- **Service Pattern** — API calls terpisah di `lib/`
- **Component Composition** — shadcn/ui + custom components

### Frontend Mobile — Clean Architecture + BLoC
- **BLoC/Cubit Pattern** — State management terpisah dari UI
- **Repository Pattern** — Abstraksi API calls
- **Separation of Concerns** — Data, Logic, Presentation layers

---

## Entitas & Relasi

```
Profile (1) ──── (N) Event
                      │
Event   (1) ──── (N) Guest
```

| Entitas | Deskripsi |
|---------|-----------|
| Profile | Akun pengguna (admin/panitia) dengan role-based access |
| Event | Event yang dibuat oleh panitia |
| Guest | Tamu yang diundang ke event, memiliki QR code unik |

---

## Fitur Utama

| # | Fitur | Backend | Web | Mobile |
|---|-------|---------|-----|--------|
| 1 | Authentication (JWT) | v | v | v |
| 2 | Role-based Authorization | v | v | v |
| 3 | CRUD Event | v | v | v |
| 4 | CRUD Guest | v | v | v |
| 5 | QR Code Generation | v | v | v |
| 6 | QR Code Scanner | - | - | v |
| 7 | Email QR Code (Brevo) | v | v | - |
| 8 | Check-in via QR | v | v | v |
| 9 | Dashboard Statistik | - | v | v |
| 10 | Manajemen Panitia | v | v | v |
| 11 | Dark Mode | - | v | - |
| 12 | Responsive Design | - | v | v |

---

## Setup Lokal

### Prasyarat
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Flutter SDK 3.x](https://docs.flutter.dev/get-started/install)
- [PostgreSQL 15+](https://www.postgresql.org/download/)

### 1. Backend

```bash
cd GuestPass.Api
cp appsettings.json appsettings.Development.json
# Edit appsettings.Development.json dengan kredensial database Anda
dotnet ef database update
dotnet run
# Akses Swagger: http://localhost:5203/swagger
```

### 2. Frontend Web

```bash
cd guestpass-frontend
npm install
# Buat .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5203/api
npm run dev
# Akses: http://localhost:3000
```

### 3. Mobile

```bash
cd guestpass-mobile
flutter pub get
# Edit lib/config/api_config.dart → set useProduction = false
flutter run
```

---

## Deployment

### Backend — Railway

Backend di-deploy menggunakan Docker di Railway dengan konfigurasi:
- **Platform**: Railway (https://railway.app)
- **Build**: Dockerfile
- **Database**: PostgreSQL di Supabase
- **Email**: Brevo HTTP API

Environment variables yang diperlukan:
| Variable | Deskripsi |
|----------|-----------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Jwt__Key` | Secret key untuk JWT (min 32 chars) |
| `Jwt__Issuer` | `GuestPassApi` |
| `Jwt__Audience` | `GuestPassApi` |
| `Email__BrevoApiKey` | API key Brevo |
| `Email__SenderEmail` | Email sender |
| `Email__SenderName` | Nama sender |
| `SKIP_MIGRATION` | `true` (jika DB sudah ada) |

Langkah deploy:
1. Buat project di Railway → Deploy from GitHub Repo
2. Set Root Directory: `GuestPass.Api`
3. Set semua environment variables
4. Generate public domain di Settings → Networking

### Frontend Web — Vercel

1. Import repo di Vercel
2. Set Root Directory: `guestpass-frontend`
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Mobile — Build APK

```bash
cd guestpass-mobile
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Authentication | JWT Bearer Token dengan validasi issuer, audience, signing key |
| Authorization | Role-based (admin, panitia) |
| Password | BCrypt hashing |
| SQL Injection | Parameterized queries (Dapper + EF Core) |
| Input Validation | Data Annotations pada semua request DTOs |
| Error Handling | Global Exception Middleware, error internal tidak di-expose |
| Token Storage | localStorage (web), flutter_secure_storage (mobile) |
| CSRF | Tidak diperlukan (token-based, bukan cookie-based) |

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/Auth/register` | Register user baru |
| POST | `/api/Auth/login` | Login → JWT token |

### Event (Requires Auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/Event` | Daftar event milik user |
| GET | `/api/Event/{id}` | Detail event |
| POST | `/api/Event` | Buat event baru |
| PUT | `/api/Event/{id}` | Update event |
| DELETE | `/api/Event/{id}` | Hapus event + semua tamu |

### Guest (Requires Auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/Guest?eventId={id}` | Daftar tamu per event |
| GET | `/api/Guest/{id}` | Detail tamu + QR token |
| POST | `/api/Guest` | Tambah tamu (QR + email otomatis) |
| PUT | `/api/Guest/{id}/checkin` | Check-in tamu |
| POST | `/api/Guest/checkin-by-token` | Check-in via QR token |
| DELETE | `/api/Guest/{id}` | Hapus tamu |

### Profile (Requires Admin)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/Profile` | Daftar semua panitia |
| GET | `/api/Profile/{id}` | Detail panitia |
| PUT | `/api/Profile/{id}/approve` | Toggle approval |
| DELETE | `/api/Profile/{id}` | Hapus akun |

### Health
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Status API + database |

---

## Logging & Monitoring

Menggunakan **Serilog** dengan output:
- **Console** — Structured log di terminal/Railway logs
- **File** — `Logs/log-{tanggal}.txt`, rolling daily, retain 7 hari

---

## Struktur Repository

```
GuestPass/
├── GuestPass.Api/          → Backend ASP.NET Core 8.0
├── guestpass-frontend/     → Frontend Web (Next.js 16)
├── guestpass-mobile/       → Frontend Mobile (Flutter)
└── README.md               → Dokumentasi utama (file ini)
```

Lihat README.md di masing-masing folder untuk dokumentasi detail per komponen.

---

## Lisensi

MIT License
