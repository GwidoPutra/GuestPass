"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEvent, updateEvent } from "@/lib/event-service";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEvent(id);
        setName(data.name);
        setLocation(data.location);
        // Convert ISO date to datetime-local format
        const eventDate = new Date(data.date);
        const localDate = eventDate.toISOString().slice(0, 16);
        setDate(localDate);
      } catch {
        setError("Event tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !location || !date) {
      setError("Semua field harus diisi.");
      return;
    }

    setIsSaving(true);
    try {
      await updateEvent(id, { name, location, date: new Date(date).toISOString() });
      router.push(`/dashboard/events/${id}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Gagal mengupdate event.");
      } else {
        setError("Terjadi kesalahan jaringan.");
      }
    } finally {
      setIsSaving(false);
    }
  };

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
      <div>
        <Link
          href={`/dashboard/events/${id}`}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          &larr; Kembali ke Detail Event
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-foreground">Edit Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Nama Event
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-foreground">
            Lokasi
          </label>
          <input
            id="location"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground">
            Tanggal
          </label>
          <input
            id="date"
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link
            href={`/dashboard/events/${id}`}
            className="rounded-md border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
