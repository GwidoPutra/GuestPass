"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-foreground/60">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-full">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-foreground">GuestPass</h1>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-foreground/10 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Selamat datang di Dashboard
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Anda berhasil login sebagai <span className="font-medium capitalize">{user.role}</span>.
          </p>
          <p className="mt-4 text-sm text-foreground/60">
            Fitur manajemen event dan tamu akan segera tersedia.
          </p>
        </div>
      </main>
    </div>
  );
}
