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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Users, UserCheck, Clock, QrCode, Trash2 } from "lucide-react";

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
        setError("Failed to load guests.");
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
      showToast("Guest removed.", "success");
    } catch {
      setError("Failed to delete guest.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCheckIn = async (guestId: string) => {
    setCheckingIn(guestId);
    try {
      const updated = await checkInGuest(guestId);
      setGuests(guests.map((g) => (g.id === guestId ? updated : g)));
      showToast("Guest checked in.", "success");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        showToast(axiosErr.response?.data || "Check-in failed.", "error");
      } else {
        showToast("Check-in failed.", "error");
      }
    } finally {
      setCheckingIn(null);
    }
  };

  const checkedInCount = guests.filter((g) => g.isCheckedIn).length;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href={`/dashboard/events/${eventId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to {event?.name || "event"}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Guests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{event?.name}</p>
        </div>
        <Link href={`/dashboard/events/${eventId}/guests/create`} className={buttonVariants()}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Guest
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{guests.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-chart-2/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-chart-2" />
            </div>
            <div>
              <p className="text-xl font-semibold">{checkedInCount}</p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-chart-3/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xl font-semibold">{guests.length - checkedInCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}

      {/* Table */}
      {guests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-10 h-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No guests yet</p>
            <Link href={`/dashboard/events/${eventId}/guests/create`} className={buttonVariants({ size: "sm", className: "mt-4" })}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add first guest
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/events/${eventId}/guests/${guest.id}`} className="hover:text-primary transition-colors">
                      {guest.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{guest.email}</TableCell>
                  <TableCell>
                    {guest.isCheckedIn ? (
                      <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0">Checked In</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/events/${eventId}/guests/${guest.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-7 w-7" })}>
                          <QrCode className="w-3.5 h-3.5" />
                      </Link>
                      {!guest.isCheckedIn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={checkingIn === guest.id}
                          onClick={() => handleCheckIn(guest.id)}
                        >
                          {checkingIn === guest.id ? "..." : "Check in"}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(guest.id)}>
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove guest</DialogTitle>
            <DialogDescription>Are you sure you want to remove this guest?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
