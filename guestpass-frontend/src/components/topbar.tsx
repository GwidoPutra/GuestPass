"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-md p-2 text-foreground/70 hover:bg-foreground/5"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Mobile logo */}
        <h1 className="md:hidden text-lg font-bold text-foreground">GuestPass</h1>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
            {user?.role || "user"}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-foreground/10 px-4 py-3 space-y-1">
          <a
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5"
          >
            Dashboard
          </a>
          <a
            href="/dashboard/events"
            className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5"
          >
            Events
          </a>
          <a
            href="/dashboard/committees"
            className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5"
          >
            Panitia
          </a>
        </nav>
      )}
    </header>
  );
}
