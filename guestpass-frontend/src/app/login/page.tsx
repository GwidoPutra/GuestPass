"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-service";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        const axiosErr = err as { response?: { data?: string; status?: number } };
        setError(axiosErr.response?.data || "Login gagal. Periksa kembali kredensial Anda.");
      } else {
        setError("Terjadi kesalahan jaringan. Coba lagi nanti.");
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
            Kelola event anda<br />dengan efisien.
          </h2>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Streamline guest check-in, track attendance in real-time, and deliver seamless event experiences.
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
            <CardTitle className="text-xl">Selamat Datang</CardTitle>
            <CardDescription>Masukkan kredensial Anda untuk mengakses akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
