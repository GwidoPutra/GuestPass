import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link href="/dashboard" className={buttonVariants({ className: "mt-6" })}>
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
