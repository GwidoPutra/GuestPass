"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getGuest } from "@/lib/guest-service";
import { Guest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { Mail, Clock, CalendarDays, CheckCircle, QrCode, Copy, Check } from "lucide-react";

export default function GuestDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const guestId = params.guestId as string;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = async () => {
    if (!guest) return;
    try {
      await navigator.clipboard.writeText(guest.qrCodeToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-lg animate-in-page">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="max-w-lg space-y-4 animate-in-page">
        <Breadcrumb items={[
          { label: "Ringkasan", href: "/dashboard" },
          { label: "Event", href: "/dashboard/events" },
          { label: "Tamu", href: `/dashboard/events/${eventId}/guests` },
          { label: "Error" },
        ]} />
        <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg animate-in-page">
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Event", href: "/dashboard/events" },
        { label: "Tamu", href: `/dashboard/events/${eventId}/guests` },
        { label: guest.name },
      ]} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-base font-semibold text-primary ring-1 ring-primary/10">
          {guest.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{guest.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" /> {guest.email}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            Kode QR
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 pb-6">
          <div className="p-5 border border-border/60 rounded-2xl bg-white shadow-sm">
            <QRCodeSVG
              value={guest.qrCodeToken}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted/60 px-4 py-2 rounded-lg font-mono text-muted-foreground ring-1 ring-border/40">
              {guest.qrCodeToken}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
              aria-label="Salin token"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-chart-2" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[280px]">
            Tunjukkan kode QR ini kepada panitia untuk check-in di pintu masuk event.
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-semibold">Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground">Status</span>
            {guest.isCheckedIn ? (
              <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0 gap-1">
                <CheckCircle className="w-3 h-3" />
                Hadir
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                Menunggu
              </Badge>
            )}
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Waktu check-in
            </span>
            <span className="text-[13px] font-medium">{formatDate(guest.checkedInAt)}</span>
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" /> Terdaftar
            </span>
            <span className="text-[13px] font-medium">{formatDate(guest.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
