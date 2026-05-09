# GuestPass (Event Guestlist Manager)

## 1. Latar Belakang & Masalah
Dalam penyelenggaraan acara besar seperti seminar, konferensi, atau acara korporat, manajemen tamu seringkali menjadi permasalahan yang umum. Penggunaan daftar hadir manual berbasis surat secara langsung selalu memperlambat antrean, rentan terhadap kesalahan manusia, dan sulit dipantau secara langsung oleh penyelenggara. **GuestPass** kini hadir sebagai solusi digital untuk menyelaraskan manajemen data di kantor (Web) dengan operasional di lapangan (Mobile).

## 2. Tujuan Proyek
Membangun ekosistem aplikasi *full-stack* yang memungkinkan:
*   **Admin** mengelola data acara dan daftar tamu melalui antarmuka Web yang komprehensif.
*   **Staf Lapangan** melakukan validasi kehadiran tamu secara cepat dan akurat melalui aplikasi Mobile.
*   **Penyelenggara** mendapatkan data kehadiran yang valid dan sinkron secara *real-time*.

---

## 3. Komponen Sistem & Arsitektur

Sistem ini dibangun dengan arsitektur **Client-Server** yang terdiri dari tiga komponen utama:

### **A. Backend API (.NET Core & PostgreSQL)**
Bertindak sebagai pusat logika dan penyimpanan data.
*   **Data Relasional:** Mengelola hubungan antara entitas **Event** (Induk) dan **Guest** (Anak/Detail).
*   **Raw SQL Optimization:** Menggunakan query SQL manual (via Dapper) untuk operasi pembacaan data guna menjamin performa tinggi saat menangani daftar tamu dalam jumlah besar.
*   **Security:** Mengamankan akses data dengan enkripsi **JWT (JSON Web Token)**. Hanya pengguna terautentikasi yang dapat memodifikasi status kehadiran.
*   **Robustness:** Implementasi *global exception handling* dan logging (Serilog) untuk memastikan stabilitas sistem.

### **B. Frontend Web (React - Management Dashboard)**
Antarmuka berbasis browser untuk kebutuhan administratif.
*   **Event & Guest CRUD:** Fitur lengkap untuk menambah, melihat, memperbarui, dan menghapus data acara serta peserta.
*   **State Management:** Mengelola aliran data aplikasi agar responsif dan sinkron dengan status server.
*   **User Feedback:** Memberikan indikator *loading*, pesan sukses, atau pesan kesalahan yang informatif.

### **C. Frontend Mobile (Flutter - Operational Tool)**
Aplikasi Android khusus untuk petugas di pintu masuk acara.
*   **Event Selector:** Memungkinkan petugas memilih acara aktif yang sedang dijaga.
*   **Instant Check-in:** Fitur pencarian tamu dan tombol *check-in* satu ketukan yang terhubung langsung ke API.
*   **Validation Logic:** Proteksi sisi klien dan server untuk mencegah duplikasi kehadiran (*double check-in*).

---

## 4. Rincian Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **Authentication** | Login aman bagi Admin dan Staf menggunakan token JWT. |
| **Event Mapping** | Pengelompokan tamu berdasarkan ID Acara agar data terorganisir. |
| **Real-time Sync** | Perubahan status di Mobile langsung memperbarui data pada Dashboard Web. |
| **Search & Filter** | Pencarian instan nama tamu di aplikasi mobile untuk mempercepat antrean. |
| **Responsive UI** | Dashboard web yang nyaman diakses dari Desktop maupun Tablet. |

---

## 5. Alur Validasi Check-in (Business Logic)
1.  **Identifikasi:** Petugas mencari nama tamu di aplikasi Flutter.
2.  **Verifikasi:** Petugas mencocokkan identitas fisik dengan data di layar.
3.  **Eksekusi:** Petugas menekan tombol "Check-in".
4.  **Backend Validation:**
    *   Sistem memvalidasi token JWT petugas.
    *   Sistem mengecek database apakah tamu tersebut sudah berstatus `Attended`.
    *   Jika belum, status diubah menjadi `Attended` dan waktu kehadiran (`CheckInTime`) dicatat.
5.  **Feedback:** Aplikasi Mobile memberikan tanda sukses (centang hijau), dan dashboard Web langsung memperbarui statistik kehadiran.

---

## 6. Target Output (Deliverables)
*   **API Public:** Backend yang telah di-deploy beserta dokumentasi Swagger.
*   **Web Live:** Aplikasi Dashboard yang dapat diakses secara publik.
*   **Mobile APK:** File installer Android yang siap diuji coba.
*   **Source Code:** Repositori GitHub dengan struktur kode modular dan *clean code*.

---
**Author:** owi  
**Project Status:** Selection Project - Project Based Test
