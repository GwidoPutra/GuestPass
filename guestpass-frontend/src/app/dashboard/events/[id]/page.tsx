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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Calendar, Users, UserCheck, Clock, Pencil, Trash2 } from "lucide-react";

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
        setError("Event not found.");
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
      showToast("Event deleted.", "success");
      router.push("/dashboard/events");
    } catch {
      setError("Failed to delete event.");
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

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to events
        </Link>
        <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to events
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {event.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{event.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Created {formatDate(event.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Link>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium">{formatDate(event.date)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest stats */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-medium">Guest Statistics</CardTitle>
          <Link href={`/dashboard/events/${id}/guests`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Users className="w-3.5 h-3.5 mr-1.5" /> Manage Guests
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-md bg-muted/50">
              <p className="text-2xl font-semibold">{guests.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total</p>
            </div>
            <div className="text-center p-3 rounded-md bg-chart-2/5">
              <p className="text-2xl font-semibold text-chart-2">{checkedInCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Checked In</p>
            </div>
            <div className="text-center p-3 rounded-md bg-chart-3/5">
              <p className="text-2xl font-semibold text-chart-3">{guests.length - checkedInCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &quot;{event.name}&quot;?</DialogTitle>
            <DialogDescription>This will permanently delete the event and all associated guest data.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
