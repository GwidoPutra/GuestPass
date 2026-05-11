import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-foreground/60">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
