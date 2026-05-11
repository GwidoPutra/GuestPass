"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEvent, updateEvent } from "@/lib/event-service";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEvent(id);
        setName(data.name);
        setLocation(data.location);
        setDate(new Date(data.date).toISOString().slice(0, 16));
      } catch {
        setError("Event not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !location || !date) { setError("All fields are required."); return; }

    setIsSaving(true);
    try {
      await updateEvent(id, { name, location, date: new Date(date).toISOString() });
      showToast("Event updated.", "success");
      router.push(`/dashboard/events/${id}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Failed to update.");
      } else {
        setError("Network error.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to event
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update event details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
              <Link href={`/dashboard/events/${id}`} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
