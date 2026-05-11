"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGuests, deleteGuest, checkInGuest } from "@/lib/guest-service";
import { getEvent } from "@/lib/event-service";
import { Guest, Event } from "@/lib/types";
import { useToast } from "@/lib/toast-context";

export default function GuestsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, guestsData] = await Promise.all([
          getEvent(eventId),
          getGuests(eventId),
        ]);
        setEvent(eventData);
        setGuests(guestsData);
      } catch {
        setError("Gagal memuat data tamu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteGuest(deleteId);
      setGuests(guests.filter((g) => g.id !== deleteId));
      setDeleteId(null);
      showToast("Tamu berhasil dihapus.", "success");
    } catch {
      setError("Gagal menghapus tamu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCheckIn = async (guestId: string) => {
    setCheckingIn(guestId);
    try {
      const updated = await checkInGuest(guestId);
      setGuests(guests.map((g) => (g.id === guestId ? updated : g)));
      showToast("Tamu berhasil di-check-in!", "success");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        showToast(axiosErr.response?.data || "Gagal check-in tamu.", "error");
      } else {
        showToast("Gagal check-in tamu.", "error");
      }
    } finally {
      setCheckingIn(null);
    }
  };

  const checkedInCount = guests.filter((g) => g.isCheckedIn).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-foreground/5 rounded animate-pulse" />
        <div className="h-64 bg-foreground/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/events/${eventId}`}
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        &larr; Kembali ke {event?.name || "Event"}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Daftar Tamu</h2>
          <p className="mt-1 text-sm text-foreground/60">
            {event?.name} &mdash; {checkedInCount}/{guests.length} sudah check-in
          </p>
        </div>
        <Link
          href={`/dashboard/events/${eventId}/guests/create`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Tambah Tamu
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border border-foreground/10 p-4">
          <p className="text-xs font-medium text-foreground/60">Total Tamu</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{guests.length}</p>
        </div>
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-700">Sudah Check-in</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{checkedInCount}</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-700">Belum Check-in</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{guests.length - checkedInCount}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      {guests.length === 0 ? (
        <div className="rounded-lg border border-foreground/10 p-12 text-center">
          <p className="text-foreground/60">Belum ada tamu untuk event ini.</p>
          <Link
            href={`/dashboard/events/${eventId}/guests/create`}
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Tambah Tamu Pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-foreground/10">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-foreground/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    <Link
                      href={`/dashboard/events/${eventId}/guests/${guest.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {guest.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/70">
                    {guest.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {guest.isCheckedIn ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        Belum
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <Link
                      href={`/dashboard/events/${eventId}/guests/${guest.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      QR
                    </Link>
                    {!guest.isCheckedIn && (
                      <button
                        onClick={() => handleCheckIn(guest.id)}
                        disabled={checkingIn === guest.id}
                        className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                      >
                        {checkingIn === guest.id ? "..." : "Check-in"}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(guest.id)}
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

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-foreground/10">
            <h3 className="text-lg font-semibold text-foreground">Konfirmasi Hapus</h3>
            <p className="mt-2 text-sm text-foreground/60">
              Apakah Anda yakin ingin menghapus tamu ini?
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
