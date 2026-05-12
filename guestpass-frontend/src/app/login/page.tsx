"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/auth-service";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      setAuth(response.token, response.role);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } | string; status?: number } };
        const data = axiosErr.response?.data;
        if (typeof data === "string") {
          setError(data || "Login gagal. Periksa kembali kredensial Anda.");
        } else if (data && typeof data === "object" && "message" in data) {
          setError(data.message || "Login gagal. Periksa kembali kredensial Anda.");
        } else {
          setError("Login gagal. Periksa kembali kredensial Anda.");
        }
      } else {
        setError("Terjadi kesalahan jaringan. Coba lagi nanti.");
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
            Kelola event anda<br />dengan efisien.
          </h2>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-sm">
            Streamline guest check-in, track attendance in real-time, and deliver seamless event experiences.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure & Reliable</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="text-white/60 text-xs">QR Check-in</div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="text-white/60 text-xs">Real-time</div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          &copy; 2026 GuestPass. All rights reserved.
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[380px] animate-in-page">
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
              <CardTitle className="text-2xl font-semibold tracking-tight">Selamat Datang</CardTitle>
              <CardDescription className="text-[13px]">Masukkan kredensial Anda untuk mengakses akun Anda</CardDescription>
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[13px] font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                  />
                </div>

                <Button type="submit" className="w-full h-10 text-[13px] font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-[13px] text-muted-foreground pt-2">
                  Belum punya akun?{" "}
                  <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Sign up
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
