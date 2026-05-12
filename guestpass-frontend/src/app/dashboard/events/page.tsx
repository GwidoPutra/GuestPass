"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, deleteEvent } from "@/lib/event-service";
import { Event } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MapPin, Calendar, Pencil, Trash2, ArrowRight } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch {
        setError("Gagal memuat daftar event.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deleteId);
      setEvents(events.filter((e) => e.id !== deleteId));
      setDeleteId(null);
      showToast("Event berhasil dihapus.", "success");
    } catch {
      setError("Gagal menghapus event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl animate-in-page">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-28 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-in-page">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Event" },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Event</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} event total
          </p>
        </div>
        <Link href="/dashboard/events/create" className={buttonVariants({ className: "h-9" })}>
          <Plus className="w-4 h-4 mr-1.5" /> Event Baru
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Belum ada event</p>
            <p className="text-xs text-muted-foreground mb-5">Buat event pertama Anda untuk memulai</p>
            <Link href="/dashboard/events/create" className={buttonVariants({ size: "sm" })}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Event
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="group card-hover relative">
              <CardContent className="pt-5 pb-4">
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className={buttonVariants({ variant: "ghost", size: "icon", className: "h-7 w-7" })}
                  >
                    <Pencil className="w-3 h-3" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/8"
                    onClick={() => setDeleteId(event.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary ring-1 ring-primary/10 mb-4">
                  {event.name.charAt(0)}
                </div>

                {/* Content */}
                <Link href={`/dashboard/events/${event.id}`} className="block">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-3 pr-14">
                    {event.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  </div>
                </Link>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <Link
                    href={`/dashboard/events/${event.id}/guests`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Kelola tamu <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Hapus Event</DialogTitle>
            <DialogDescription className="text-[13px]">
              Tindakan ini tidak dapat dibatalkan. Semua data tamu yang terkait dengan event ini juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
