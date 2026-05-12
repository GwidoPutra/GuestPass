"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEvent, deleteEvent } from "@/lib/event-service";
import { getGuests } from "@/lib/guest-service";
import { Event, Guest } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Users, UserCheck, Clock, Pencil, Trash2 } from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, guestsData] = await Promise.all([getEvent(id), getGuests(id)]);
        setEvent(eventData);
        setGuests(guestsData);
      } catch {
        setError("Event tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(id);
      showToast("Event berhasil dihapus.", "success");
      router.push("/dashboard/events");
    } catch {
      setError("Gagal menghapus event.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const checkedInCount = guests.filter((g) => g.isCheckedIn).length;
  const checkInRate = guests.length > 0 ? Math.round((checkedInCount / guests.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl animate-in-page">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl space-y-4 animate-in-page">
        <Breadcrumb items={[
          { label: "Ringkasan", href: "/dashboard" },
          { label: "Event", href: "/dashboard/events" },
          { label: "Error" },
        ]} />
        <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-in-page">
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Event", href: "/dashboard/events" },
        { label: event.name },
      ]} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-base font-semibold text-primary ring-1 ring-primary/10">
            {event.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{event.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Dibuat {formatDate(event.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${id}/edit`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-8" })}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Link>
          <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/8" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center ring-1 ring-border/60">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Lokasi</p>
                <p className="text-sm font-medium mt-0.5">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center ring-1 ring-border/60">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Tanggal & Waktu</p>
                <p className="text-sm font-medium mt-0.5">{formatDate(event.date)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest stats */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-[15px] font-semibold">Statistik Tamu</CardTitle>
          <Link href={`/dashboard/events/${id}/guests`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-8" })}>
            <Users className="w-3.5 h-3.5 mr-1.5" /> Kelola Tamu
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/40 ring-1 ring-border/40">
              <p className="text-2xl font-semibold tracking-tight">{guests.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">Total</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-chart-2/5 ring-1 ring-chart-2/10">
              <p className="text-2xl font-semibold tracking-tight text-chart-2">{checkedInCount}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">Check-in</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-chart-3/5 ring-1 ring-chart-3/10">
              <p className="text-2xl font-semibold tracking-tight text-chart-3">{guests.length - checkedInCount}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">Menunggu</p>
            </div>
          </div>

          {/* Progress bar */}
          {guests.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Progres check-in</span>
                <span className="text-xs font-medium text-foreground">{checkInRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-chart-2 to-chart-2/80 transition-all duration-500 ease-out"
                  style={{ width: `${checkInRate}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Hapus &quot;{event.name}&quot;?</DialogTitle>
            <DialogDescription className="text-[13px]">Tindakan ini akan menghapus event beserta seluruh data tamu secara permanen.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
