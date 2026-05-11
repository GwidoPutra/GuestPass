"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEvent, deleteEvent } from "@/lib/event-service";
import { Event } from "@/lib/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEvent(id);
        setEvent(data);
      } catch {
        setError("Event tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(id);
      router.push("/dashboard/events");
    } catch {
      setError("Gagal menghapus event.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-foreground/5 rounded animate-pulse" />
        <div className="h-48 bg-foreground/5 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/events"
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          &larr; Kembali ke Events
        </Link>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error || "Event tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/events"
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        &larr; Kembali ke Events
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{event.name}</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Dibuat pada {formatDate(event.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Detail Card */}
      <div className="rounded-lg border border-foreground/10 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Lokasi</p>
            <p className="mt-1 text-sm text-foreground">{event.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Tanggal</p>
            <p className="mt-1 text-sm text-foreground">{formatDate(event.date)}</p>
          </div>
        </div>
      </div>

      {/* Guest Stats Placeholder */}
      <div className="rounded-lg border border-foreground/10 p-6">
        <h3 className="text-lg font-semibold text-foreground">Statistik Tamu</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-md bg-foreground/5 p-4">
            <p className="text-xs font-medium text-foreground/60">Total Tamu</p>
            <p className="mt-1 text-2xl font-bold text-foreground">-</p>
          </div>
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-xs font-medium text-green-700">Sudah Check-in</p>
            <p className="mt-1 text-2xl font-bold text-green-700">-</p>
          </div>
          <div className="rounded-md bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-700">Belum Check-in</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">-</p>
          </div>
        </div>
        <Link
          href={`/dashboard/events/${id}/guests`}
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Kelola Tamu &rarr;
        </Link>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-foreground/10">
            <h3 className="text-lg font-semibold text-foreground">
              Konfirmasi Hapus
            </h3>
            <p className="mt-2 text-sm text-foreground/60">
              Apakah Anda yakin ingin menghapus event &quot;{event.name}&quot;? Semua data tamu terkait juga akan dihapus.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
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
