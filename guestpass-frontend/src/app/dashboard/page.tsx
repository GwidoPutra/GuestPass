"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Selamat datang kembali! Anda login sebagai <span className="font-medium capitalize">{user?.role}</span>.
        </p>
      </div>

      {/* Stats cards placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-foreground/10 p-5">
          <p className="text-sm font-medium text-foreground/60">Total Events</p>
          <p className="mt-2 text-3xl font-bold text-foreground">-</p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-5">
          <p className="text-sm font-medium text-foreground/60">Total Tamu</p>
          <p className="mt-2 text-3xl font-bold text-foreground">-</p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-5">
          <p className="text-sm font-medium text-foreground/60">Sudah Check-in</p>
          <p className="mt-2 text-3xl font-bold text-foreground">-</p>
        </div>
      </div>

      <div className="rounded-lg border border-foreground/10 p-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/events"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Kelola Events
          </a>
          <a
            href="/dashboard/committees"
            className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Kelola Panitia
          </a>
        </div>
      </div>
    </div>
  );
}
