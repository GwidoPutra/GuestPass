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
import { ArrowLeft } from "lucide-react";

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
    if (!name || !email) { setError("Name and email are required."); return; }

    setIsLoading(true);
    try {
      await createGuest({ eventId, name, email });
      showToast("Guest added successfully.", "success");
      router.push(`/dashboard/events/${eventId}/guests`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Failed to add guest.");
      } else {
        setError("Network error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Link href={`/dashboard/events/${eventId}/guests`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to guests
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add Guest</CardTitle>
          <CardDescription>A unique QR code will be generated automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Guest full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="guest@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Guest"}</Button>
              <Link href={`/dashboard/events/${eventId}/guests`} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
