# GuestPass API

Sistem manajemen tamu event dengan QR Code check-in. Backend RESTful API dibangun dengan ASP.NET Core 8.0, PostgreSQL, dan JWT Authentication.

## Teknologi Utama

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| ASP.NET Core | 8.0 LTS | Web API Framework |
| PostgreSQL | 15+ | Database |
| Entity Framework Core | 8.0 | ORM (Create, Update, Delete) |
| Dapper | 2.1 | Raw SQL Queries (Read) |
| JWT Bearer | 8.0 | Autentikasi & Otorisasi |
| Serilog | 8.0 | Structured Logging |
| Swagger/OpenAPI | 6.6 | Dokumentasi API |
| BCrypt | 4.1 | Password Hashing |
| Docker | - | Containerization |

## Arsitektur

Proyek ini menerapkan **Layered Architecture** dengan separation of concerns yang jelas:

```
GuestPass.Api/
├── Controllers/        → Thin controllers (routing & HTTP concerns)
├── Services/           → Business logic layer
├── Repositories/       → Data access layer (Dapper untuk READ)
├── Middleware/         → Cross-cutting concerns (exception handling)
├── DTOs/               → Request/Response models + validation
├── Models/             → Entity models + navigation properties
├── Data/               → EF Core DbContext + relationship config
├── Migrations/         → Database migrations
├── Logs/               → Log files (auto-generated)
├── Program.cs          → Application entry point & DI configuration
├── Dockerfile          → Container build configuration
└── appsettings.json    → Application configuration template
```

### Pola Desain yang Diterapkan

- **Repository Pattern** — Abstraksi data access, Dapper untuk operasi READ
- **Service Pattern** — Business logic terpisah dari controller
- **Dependency Injection** — Semua dependency di-register di Program.cs
- **Global Exception Handling** — Middleware menangkap semua unhandled exception
- **DTO Pattern** — Request/Response models terpisah dari entity models

### Strategi Data Access

| Operasi | Teknologi | Alasan |
|---------|-----------|--------|
| READ (GET) | Dapper + Raw SQL | Performa tinggi, kontrol penuh atas query |
| CREATE | EF Core | Tracking, validasi, auto-generate ID |
| UPDATE | EF Core | Change tracking, concurrency |
| DELETE | EF Core | Cascade delete, relationship handling |

## Entitas & Relasi

```
Profile (1) ──── (N) Event
                      │
Event   (1) ──── (N) Guest
                      │
Event   (1) ──── (N) EventMoment
Profile (1) ──── (N) EventMoment
Guest   (1) ──── (N) EventMoment
```

| Entitas | Deskripsi |
|---------|-----------|
| Profile | Akun pengguna (admin/panitia) |
| Event | Event yang dibuat oleh panitia |
| Guest | Tamu yang diundang ke event |
| EventMoment | Momen/aktivitas selama event |

## Setup Lokal

### Prasyarat

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- (Opsional) [Docker](https://www.docker.com/)

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/GuestPass.git
   cd GuestPass/GuestPass.Api
   ```

2. **Buat file konfigurasi lokal**
   ```bash
   cp appsettings.json appsettings.Development.json
   ```
   
   Edit `appsettings.Development.json` dengan kredensial database Anda:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=guestpass;Username=postgres;Password=your_password"
     },
     "Jwt": {
       "Key": "your-secret-key-minimum-32-characters-long",
       "Issuer": "GuestPassApi",
       "Audience": "GuestPassApi"
     }
   }
   ```

3. **Buat database dan jalankan migrasi**
   ```bash
   dotnet ef database update
   ```

4. **Jalankan aplikasi**
   ```bash
   dotnet run
   ```

5. **Akses Swagger UI**
   ```
   http://localhost:5000/swagger
   ```

### Menjalankan dengan Docker

```bash
docker build -t guestpass-api .
docker run -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Database=guestpass;Username=postgres;Password=your_password" \
  -e Jwt__Key="your-secret-key-minimum-32-characters-long" \
  -e Jwt__Issuer="GuestPassApi" \
  -e Jwt__Audience="GuestPassApi" \
  guestpass-api
```

## API Endpoints

### Auth (Public)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/Auth/register` | Mendaftarkan user baru |
| POST | `/api/Auth/login` | Login dan mendapatkan JWT token |

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
| POST | `/api/Guest` | Tambah tamu (QR auto-generated) |
| PUT | `/api/Guest/{id}/checkin` | Check-in tamu |
| DELETE | `/api/Guest/{id}` | Hapus tamu |

### Profile (Requires Admin Role)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/Profile` | Daftar semua panitia |
| GET | `/api/Profile/{id}` | Detail panitia |
| PUT | `/api/Profile/{id}/approve` | Toggle approval status |
| DELETE | `/api/Profile/{id}` | Hapus akun panitia |

### Health Check

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Status kesehatan API + database |

## Autentikasi

API menggunakan **JWT Bearer Token**. Untuk mengakses endpoint yang terproteksi:

1. Login via `POST /api/Auth/login`
2. Salin token dari response
3. Sertakan di header: `Authorization: Bearer <token>`

### Roles

| Role | Akses |
|------|-------|
| `admin` | Semua endpoint termasuk manajemen panitia |
| `panitia` | Event & Guest management (milik sendiri) |

## Logging

Aplikasi menggunakan **Serilog** dengan dua sink:
- **Console** — Output langsung di terminal
- **File** — `Logs/log-{tanggal}.txt`, rolling daily, retain 7 hari

## Error Handling

Semua error ditangani oleh `GlobalExceptionMiddleware`:
- Error internal tidak di-expose ke client
- Response error dalam format JSON konsisten:
  ```json
  {
    "status": 400,
    "message": "Deskripsi error yang aman",
    "timestamp": "2026-05-12T00:00:00Z"
  }
  ```

## Deployment

### Render.com

1. Buat **Web Service** baru di [Render Dashboard](https://dashboard.render.com)
2. Connect repository GitHub
3. Pilih **Docker** sebagai environment
4. Set environment variables:
   - `ConnectionStrings__DefaultConnection` = connection string PostgreSQL
   - `Jwt__Key` = secret key (min 32 karakter)
   - `Jwt__Issuer` = `GuestPassApi`
   - `Jwt__Audience` = `GuestPassApi`
5. Deploy

### Environment Variables (Production)

| Variable | Deskripsi |
|----------|-----------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Jwt__Key` | Secret key untuk signing JWT (min 32 chars) |
| `Jwt__Issuer` | JWT issuer (default: GuestPassApi) |
| `Jwt__Audience` | JWT audience (default: GuestPassApi) |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

## Lisensi

MIT License
