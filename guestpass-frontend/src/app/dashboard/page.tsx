"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getEvents } from "@/lib/event-service";
import { getGuests } from "@/lib/guest-service";
import { Event, Guest } from "@/lib/types";

interface DashboardStats {
  totalEvents: number;
  totalGuests: number;
  checkedIn: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalEvents: 0, totalGuests: 0, checkedIn: 0 });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const events = await getEvents();
        setRecentEvents(events.slice(0, 5));

        // Fetch guests for all events to get totals
        const guestPromises = events.map((e) => getGuests(e.id));
        const guestResults = await Promise.all(guestPromises);
        const allGuests: Guest[] = guestResults.flat();

        setStats({
          totalEvents: events.length,
          totalGuests: allGuests.length,
          checkedIn: allGuests.filter((g) => g.isCheckedIn).length,
        });
      } catch {
        // Silently fail - stats will show 0
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Selamat datang kembali! Anda login sebagai <span className="font-medium capitalize">{user?.role}</span>.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-foreground/10 p-5">
          <p className="text-sm font-medium text-foreground/60">Total Events</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {isLoading ? (
              <span className="inline-block h-8 w-12 bg-foreground/5 rounded animate-pulse" />
            ) : (
              stats.totalEvents
            )}
          </p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-5">
          <p className="text-sm font-medium text-foreground/60">Total Tamu</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {isLoading ? (
              <span className="inline-block h-8 w-12 bg-foreground/5 rounded animate-pulse" />
            ) : (
              stats.totalGuests
            )}
          </p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-5">
          <p className="text-sm font-medium text-foreground/60">Sudah Check-in</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {isLoading ? (
              <span className="inline-block h-8 w-12 bg-foreground/5 rounded animate-pulse" />
            ) : (
              <span>
                {stats.checkedIn}
                {stats.totalGuests > 0 && (
                  <span className="ml-2 text-sm font-normal text-foreground/50">
                    ({Math.round((stats.checkedIn / stats.totalGuests) * 100)}%)
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="rounded-lg border border-foreground/10 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Event Terbaru</h3>
          <Link
            href="/dashboard/events"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-foreground/5 rounded animate-pulse" />
            ))}
          </div>
        ) : recentEvents.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/60">Belum ada event. Buat event pertama Anda!</p>
        ) : (
          <div className="mt-4 divide-y divide-foreground/10">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="flex items-center justify-between py-3 hover:bg-foreground/[0.02] -mx-2 px-2 rounded transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{event.name}</p>
                  <p className="text-xs text-foreground/50">{event.location}</p>
                </div>
                <span className="text-xs text-foreground/50">{formatDate(event.date)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-foreground/10 p-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/events/create"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Buat Event Baru
          </Link>
          <Link
            href="/dashboard/events"
            className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Kelola Events
          </Link>
          <Link
            href="/dashboard/committees"
            className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Kelola Panitia
          </Link>
        </div>
      </div>
    </div>
  );
}
