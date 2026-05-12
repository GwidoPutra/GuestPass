"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { register } from "@/lib/auth-service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Shield, Users, Zap } from "lucide-react";

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
        const axiosErr = err as { response?: { data?: { message?: string } | string } };
        const data = axiosErr.response?.data;
        const message = typeof data === "string" ? data : data?.message;
        setError(message || "Registration failed.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-[520px] bg-gradient-to-br from-primary via-primary/95 to-primary/85 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20 overflow-hidden">
              <Image
                src="/logo.png"
                alt="GuestPass"
                width={24}
                height={24}
              />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">GuestPass</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight">
            Start managing<br />your events today.
          </h2>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-sm">
            Buat akun untuk mulai mengelola event Anda dengan efisien dan profesional.
          </p>

          {/* Feature highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>QR Code check-in instan</span>
            </div>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>Kelola tamu tanpa batas</span>
            </div>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span>Data aman & terenkripsi</span>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          &copy; 2026 GuestPass. All rights reserved.
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[400px] animate-in-page">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1.5 pb-6">
              <div className="lg:hidden flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="GuestPass"
                    width={20}
                    height={20}
                  />
                </div>
                <span className="text-[15px] font-semibold">GuestPass</span>
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Buat Akun</CardTitle>
              <CardDescription className="text-[13px]">Masukkan data diri anda untuk mendaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-success/8 border border-success/15 px-4 py-3 text-sm text-success flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[13px] font-medium">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[13px] font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[13px] font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[13px] font-medium">Konfirmasi</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 text-[13px] font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Buat Akun
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-[13px] text-muted-foreground pt-2">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
