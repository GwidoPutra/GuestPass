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
import { Breadcrumb } from "@/components/breadcrumb";
import { Plus } from "lucide-react";

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
      setError("Semua field wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      await createEvent({ name, location, date: new Date(date).toISOString() });
      showToast("Event berhasil dibuat.", "success");
      router.push("/dashboard/events");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Gagal membuat event.");
      } else {
        setError("Kesalahan jaringan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6 animate-in-page">
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Event", href: "/dashboard/events" },
        { label: "Buat Event" },
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Buat Event</CardTitle>
          <CardDescription className="text-[13px]">Tambahkan event baru untuk mulai mengelola tamu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px] font-medium">
                Nama Event <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="cth. Konferensi Teknologi 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-[13px] font-medium">
                Lokasi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="cth. Convention Center, Jakarta"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-[13px] font-medium">
                Tanggal & Waktu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={isLoading} className="h-9">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Membuat...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    Buat Event
                  </span>
                )}
              </Button>
              <Link href="/dashboard/events" className={buttonVariants({ variant: "outline", className: "h-9" })}>Batal</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
