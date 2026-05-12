"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createGuest } from "@/lib/guest-service";
import { useToast } from "@/lib/toast-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { UserPlus } from "lucide-react";

export default function CreateGuestPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const eventId = params.id as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email) { setError("Nama dan email wajib diisi."); return; }

    setIsLoading(true);
    try {
      await createGuest({ eventId, name, email });
      showToast("Tamu berhasil ditambahkan.", "success");
      router.push(`/dashboard/events/${eventId}/guests`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } | string } };
        const data = axiosErr.response?.data;
        const message = typeof data === "string" ? data : data?.message;
        setError(message || "Gagal menambahkan tamu.");
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
        { label: "Tamu", href: `/dashboard/events/${eventId}/guests` },
        { label: "Tambah Tamu" },
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Tambah Tamu</CardTitle>
          <CardDescription className="text-[13px]">Kode QR unik akan dibuat secara otomatis.</CardDescription>
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
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input id="name" placeholder="Nama lengkap tamu" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input id="email" type="email" placeholder="tamu@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={isLoading} className="h-9">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Menambahkan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Tamu
                  </span>
                )}
              </Button>
              <Link href={`/dashboard/events/${eventId}/guests`} className={buttonVariants({ variant: "outline", className: "h-9" })}>Batal</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
