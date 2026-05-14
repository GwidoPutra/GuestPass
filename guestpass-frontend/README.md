# GuestPass Frontend Web

Aplikasi web untuk manajemen tamu event dengan QR Code check-in. Dibangun dengan Next.js 16, React 19, dan Tailwind CSS.

## Teknologi Utama

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.2 | Framework (App Router) |
| React | 19.2 | UI Library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (utility-first) |
| Axios | 1.16 | HTTP client + JWT interceptor |
| shadcn/ui | 4.7 | Component library |
| Lucide React | 1.14 | Icon library |
| qrcode.react | 4.2 | QR code generator |

## Arsitektur

```
src/
├── app/                    → Pages & layouts (App Router)
│   ├── layout.tsx          → Root layout + metadata + font
│   ├── providers.tsx       → AuthProvider + ToastProvider
│   ├── globals.css         → Theme variables + animations
│   ├── login/              → Halaman login
│   ├── register/           → Halaman register
│   ├── not-found.tsx       → Halaman 404
│   └── dashboard/
│       ├── layout.tsx      → Sidebar + TopBar shell
│       ├── page.tsx        → Dashboard / Ringkasan
│       ├── events/         → CRUD event + manajemen tamu
│       └── committees/     → Manajemen panitia
├── components/
│   ├── ui/                 → shadcn/ui components (button, card, dialog, dll)
│   ├── sidebar.tsx         → Navigasi sidebar
│   ├── topbar.tsx          → Header + dark mode toggle + logout
│   └── breadcrumb.tsx      → Breadcrumb navigasi
└── lib/
    ├── api.ts              → Axios instance + JWT interceptor
    ├── auth-context.tsx    → Auth state management (Context API)
    ├── auth-service.ts     → Login/register API calls
    ├── event-service.ts    → Event CRUD API calls
    ├── guest-service.ts    → Guest CRUD + check-in API calls
    ├── profile-service.ts  → Profile/panitia API calls
    ├── toast-context.tsx   → Toast notification system
    ├── types.ts            → TypeScript interfaces
    └── utils.ts            → Utility functions (cn)
```

### Pola Desain

- **App Router** — File-based routing dengan layouts
- **React Context API** — State management (auth + toast)
- **Service Pattern** — API calls terpisah di `lib/`
- **Component Composition** — shadcn/ui + custom components
- **Server/Client Components** — Server by default, `"use client"` hanya saat diperlukan

## Fitur

| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | Login & Register | Autentikasi JWT dengan validasi form |
| 2 | Dashboard | Statistik event, tamu, check-in rate |
| 3 | Manajemen Event | CRUD lengkap dengan konfirmasi hapus |
| 4 | Manajemen Tamu | Tambah, check-in, hapus, lihat QR code |
| 5 | QR Code | Generate & tampilkan QR unik per tamu |
| 6 | Copy Token | Salin QR token ke clipboard |
| 7 | Manajemen Panitia | Approve/revoke akun, hapus (admin only) |
| 8 | Dark Mode | Toggle tema gelap/terang |
| 9 | Breadcrumb | Navigasi hierarkis di semua halaman |
| 10 | Responsif | Desktop + tablet layout |
| 11 | Feedback Visual | Loading skeleton, toast, error states |

## Setup Lokal

### Prasyarat

- [Node.js](https://nodejs.org/) 18+ 
- Backend GuestPass API berjalan di localhost

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/GwidoPutra/GuestPass.git
   cd GuestPass/guestpass-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi environment**
   
   Buat file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Akses aplikasi**
   ```
   http://localhost:3000
   ```

### Build Production

```bash
npm run build
npm start
```

## Deployment (Vercel)

**Live URL:** https://guestpass-frontend.vercel.app

1. Import repository di [Vercel](https://vercel.com)
2. Pilih repository `GuestPass`
3. Set **Root Directory** ke `guestpass-frontend`
4. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://guestpass-production.up.railway.app/api`
5. Deploy

Vercel auto-deploy setiap push ke `main`.

## Color Palette

| Warna | Hex | Penggunaan |
|-------|-----|------------|
| Navy | #003049 | Primary, sidebar, buttons |
| Red | #D62828 | Destructive, error states |
| Orange | #F77F00 | Accent, chart highlights |
| Gold | #FCBF49 | Secondary accent, active states |

## UI/UX

Aplikasi ini dibangun dengan prinsip UI intuitif:

- **Kejelasan Fungsi** — Setiap elemen memiliki affordance yang jelas, error messages spesifik, empty states informatif
- **Konsistensi Elemen** — Spacing scale konsisten, typography hierarchy terjaga, badge/status colors semantic
- **Estetika Visual** — Whitespace generous, subtle animations, glass morphism, card hover effects

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Jalankan ESLint |

## Lisensi

MIT License
