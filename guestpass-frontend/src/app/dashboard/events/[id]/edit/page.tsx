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
import { Breadcrumb } from "@/components/breadcrumb";
import { Save } from "lucide-react";

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
        setError("Event tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !location || !date) { setError("Semua field wajib diisi."); return; }

    setIsSaving(true);
    try {
      await updateEvent(id, { name, location, date: new Date(date).toISOString() });
      showToast("Event berhasil diperbarui.", "success");
      router.push(`/dashboard/events/${id}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Gagal memperbarui.");
      } else {
        setError("Kesalahan jaringan.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-6 animate-in-page">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-72 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6 animate-in-page">
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Event", href: "/dashboard/events" },
        { label: name || "Edit", href: `/dashboard/events/${id}` },
        { label: "Edit" },
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Edit Event</CardTitle>
          <CardDescription className="text-[13px]">Perbarui detail event di bawah ini.</CardDescription>
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
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[13px] font-medium">
                Lokasi <span className="text-destructive">*</span>
              </Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[13px] font-medium">
                Tanggal & Waktu <span className="text-destructive">*</span>
              </Label>
              <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="h-10" />
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={isSaving} className="h-9">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </span>
                )}
              </Button>
              <Link href={`/dashboard/events/${id}`} className={buttonVariants({ variant: "outline", className: "h-9" })}>Batal</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
