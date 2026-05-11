"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, deleteEvent } from "@/lib/event-service";
import { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      setError("Gagal memuat data events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deleteId);
      setEvents(events.filter((e) => e.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Gagal menghapus event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-foreground/5 rounded animate-pulse" />
        <div className="h-64 bg-foreground/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Kelola semua event Anda
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Buat Event
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      {events.length === 0 ? (
        <div className="rounded-lg border border-foreground/10 p-12 text-center">
          <p className="text-foreground/60">Belum ada event.</p>
          <Link
            href="/dashboard/events/create"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Buat Event Pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-foreground/10">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-foreground/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Nama Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/70">
                    {event.location}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/70">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/dashboard/events/${event.id}/edit`}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(event.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-foreground/10">
            <h3 className="text-lg font-semibold text-foreground">
              Konfirmasi Hapus
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
