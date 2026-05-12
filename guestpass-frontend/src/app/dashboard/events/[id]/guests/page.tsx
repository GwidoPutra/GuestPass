"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGuests, deleteGuest, checkInGuest } from "@/lib/guest-service";
import { getEvent } from "@/lib/event-service";
import { Guest, Event } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, UserCheck, Clock, QrCode, Trash2, CheckCircle } from "lucide-react";

export default function GuestsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, guestsData] = await Promise.all([getEvent(eventId), getGuests(eventId)]);
        setEvent(eventData);
        setGuests(guestsData);
      } catch {
        setError("Gagal memuat daftar tamu.");
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
      showToast("Tamu berhasil check-in.", "success");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        showToast(axiosErr.response?.data || "Check-in gagal.", "error");
      } else {
        showToast("Check-in gagal.", "error");
      }
    } finally {
      setCheckingIn(null);
    }
  };

  const checkedInCount = guests.filter((g) => g.isCheckedIn).length;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-in-page">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in-page">
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Event", href: "/dashboard/events" },
        { label: event?.name || "Event", href: `/dashboard/events/${eventId}` },
        { label: "Tamu" },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daftar Tamu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{event?.name}</p>
        </div>
        <Link href={`/dashboard/events/${eventId}/guests/create`} className={buttonVariants({ className: "h-9" })}>
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Tamu
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center ring-1 ring-border/40">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">{guests.length}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-chart-2/8 flex items-center justify-center ring-1 ring-chart-2/10">
              <UserCheck className="w-4 h-4 text-chart-2" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">{checkedInCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Check-in</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-chart-3/8 flex items-center justify-center ring-1 ring-chart-3/10">
              <Clock className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">{guests.length - checkedInCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Menunggu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      {guests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Belum ada tamu</p>
            <p className="text-xs text-muted-foreground mb-5">Tambahkan tamu pertama ke event ini</p>
            <Link href={`/dashboard/events/${eventId}/guests/create`} className={buttonVariants({ size: "sm" })}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Tamu
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Nama</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id} className="group">
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/events/${eventId}/guests/${guest.id}`} className="hover:text-primary transition-colors">
                      {guest.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">{guest.email}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/events/${eventId}/guests/${guest.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-7 w-7" })}>
                        <QrCode className="w-3.5 h-3.5" />
                      </Link>
                      {!guest.isCheckedIn && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-medium"
                          disabled={checkingIn === guest.id}
                          onClick={() => handleCheckIn(guest.id)}
                        >
                          {checkingIn === guest.id ? (
                            <span className="w-3 h-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                          ) : (
                            "Check-in"
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteId(guest.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Hapus Tamu</DialogTitle>
            <DialogDescription className="text-[13px]">Apakah Anda yakin ingin menghapus tamu ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Tamu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
