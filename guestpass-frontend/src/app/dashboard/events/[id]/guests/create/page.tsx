"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createGuest } from "@/lib/guest-service";
import { useToast } from "@/lib/toast-context";

export default function CreateGuestPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const eventId = params.id as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email) {
      setError("Nama dan email harus diisi.");
      return;
    }

    setIsLoading(true);
    try {
      await createGuest({ eventId, name, email });
      showToast("Tamu berhasil ditambahkan!", "success");
      router.push(`/dashboard/events/${eventId}/guests`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Gagal menambahkan tamu.");
      } else {
        setError("Terjadi kesalahan jaringan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/events/${eventId}/guests`}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          &larr; Kembali ke Daftar Tamu
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-foreground">Tambah Tamu</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Nama Tamu
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nama lengkap tamu"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="email@contoh.com"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Menyimpan..." : "Tambah Tamu"}
          </button>
          <Link
            href={`/dashboard/events/${eventId}/guests`}
            className="rounded-md border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
