"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getGuest } from "@/lib/guest-service";
import { Guest } from "@/lib/types";

export default function GuestDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const guestId = params.guestId as string;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const data = await getGuest(guestId);
        setGuest(data);
      } catch {
        setError("Tamu tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuest();
  }, [guestId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
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
        <div className="h-64 bg-foreground/5 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="space-y-4">
        <Link
          href={`/dashboard/events/${eventId}/guests`}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          &larr; Kembali ke Daftar Tamu
        </Link>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error || "Tamu tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/events/${eventId}/guests`}
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        &larr; Kembali ke Daftar Tamu
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{guest.name}</h2>
        <p className="mt-1 text-sm text-foreground/60">{guest.email}</p>
      </div>

      {/* QR Code Card */}
      <div className="rounded-lg border border-foreground/10 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">QR Code</h3>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border border-foreground/10 p-4 bg-white">
            <QRCodeSVG
              value={guest.qrCodeToken}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm font-mono text-foreground/70 bg-foreground/5 px-3 py-1.5 rounded">
            {guest.qrCodeToken}
          </p>
          <p className="text-xs text-foreground/50">
            Tunjukkan QR Code ini kepada panitia saat check-in
          </p>
        </div>
      </div>

      {/* Detail Info */}
      <div className="rounded-lg border border-foreground/10 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Informasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Status</p>
            <div className="mt-1">
              {guest.isCheckedIn ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Checked In
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  Belum Check-in
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Waktu Check-in</p>
            <p className="mt-1 text-sm text-foreground">{formatDate(guest.checkedInAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Terdaftar Pada</p>
            <p className="mt-1 text-sm text-foreground">{formatDate(guest.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
