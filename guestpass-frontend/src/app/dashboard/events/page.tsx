"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, deleteEvent } from "@/lib/event-service";
import { Event } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MapPin, Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
        setError("Failed to load events.");
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
      showToast("Event deleted successfully.", "success");
    } catch {
      setError("Failed to delete event.");
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
      <div className="space-y-4 max-w-5xl">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} event{events.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/events/create" className={buttonVariants()}>
            <Plus className="w-4 h-4 mr-1.5" /> New Event
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-10 h-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No events yet</p>
            <Link href="/dashboard/events/create" className={buttonVariants({ size: "sm", className: "mt-4" })}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Create your first event
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {event.name.charAt(0)}
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/events/${event.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-7 w-7" })}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(event.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <Link href={`/dashboard/events/${event.id}`} className="block mt-3">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(event.date)}
                    </div>
                  </div>
                </Link>

                <div className="mt-4 pt-3 border-t">
                  <Link
                    href={`/dashboard/events/${event.id}/guests`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Manage guests &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All guest data associated with this event will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
