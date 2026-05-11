"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getGuest } from "@/lib/guest-service";
import { Guest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Clock, CalendarDays } from "lucide-react";

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
        setError("Guest not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuest();
  }, [guestId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href={`/dashboard/events/${eventId}/guests`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to guests
        </Link>
        <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Link href={`/dashboard/events/${eventId}/guests`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to guests
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {guest.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{guest.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="w-3 h-3" /> {guest.email}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="p-4 border rounded-lg bg-white">
            <QRCodeSVG
              value={guest.qrCodeToken}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          <code className="text-xs bg-muted px-3 py-1.5 rounded-md font-mono">
            {guest.qrCodeToken}
          </code>
          <p className="text-xs text-muted-foreground text-center">
            Present this QR code to the committee for check-in.
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {guest.isCheckedIn ? (
              <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0">Checked In</Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Check-in time
            </span>
            <span className="text-sm">{formatDate(guest.checkedInAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Registered
            </span>
            <span className="text-sm">{formatDate(guest.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
