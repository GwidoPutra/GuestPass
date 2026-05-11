"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, LayoutDashboard, Calendar, Users } from "lucide-react";

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">G</span>
          </div>
          <span className="text-sm font-semibold">GuestPass</span>
        </div>

        {/* Desktop spacer */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize text-xs">
            {user?.role || "user"}
          </Badge>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-3 py-2 space-y-0.5">
          <a href="/dashboard" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </a>
          <a href="/dashboard/events" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <Calendar className="w-4 h-4" /> Events
          </a>
          <a href="/dashboard/committees" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <Users className="w-4 h-4" /> Committees
          </a>
        </nav>
      )}
    </header>
  );
}
