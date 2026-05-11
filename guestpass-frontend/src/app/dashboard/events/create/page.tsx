"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEvent } from "@/lib/event-service";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !location || !date) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);
    try {
      await createEvent({ name, location, date: new Date(date).toISOString() });
      showToast("Event created successfully.", "success");
      router.push("/dashboard/events");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Failed to create event.");
      } else {
        setError("Network error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to events
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
          <CardDescription>Add a new event to start managing guests.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                placeholder="e.g. Tech Conference 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Convention Center, Jakarta"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Event"}
              </Button>
              <Link href="/dashboard/events" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
