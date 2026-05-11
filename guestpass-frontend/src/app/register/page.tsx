"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth-service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !fullName || !password || !confirmPassword) {
      setError("Semua field harus diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      await register({ username, email, password, fullName });
      setSuccess("Pendaftaran berhasil! Harap tunggu, akun anda akan dikonfirmasi oleh admin.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: string } };
        setError(axiosErr.response?.data || "Registration failed.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <span className="text-lg font-semibold text-white">GuestPass</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Start managing<br />your events today.
          </h2>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Buat akun untuk mulai mengelola event Anda dengan efisien. Streamline guest check-in, track attendance in real-time, and deliver seamless event experiences.
          </p>
        </div>
        <p className="text-xs text-white/50">
          &copy; 2026 GuestPass. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm border-0 shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">G</span>
              </div>
              <span className="text-sm font-semibold">GuestPass</span>
            </div>
            <CardTitle className="text-xl">Buat Akun</CardTitle>
            <CardDescription>Masukkan data diri anda untuk mendaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-chart-2/10 px-3 py-2.5 text-sm text-chart-2">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Ulang</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Buat Akun"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
