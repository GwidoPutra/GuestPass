"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, LayoutDashboard, Calendar, Users, User } from "lucide-react";

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 h-16 border-b border-border/60 bg-background/80 glass">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Mobile menu toggle */}
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
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="GuestPass"
              width={18}
              height={18}
            />
          </div>
          <span className="text-sm font-semibold">GuestPass</span>
        </div>

        {/* Desktop spacer */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/60">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground capitalize">{user?.role || "user"}</span>
          </div>
          <div className="sm:hidden">
            <Badge variant="secondary" className="capitalize text-xs">
              {user?.role || "user"}
            </Badge>
          </div>
          <div className="w-px h-6 bg-border/60 hidden sm:block" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/60 bg-background/95 glass px-3 py-3 space-y-1 animate-in-page">
          <a href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </a>
          <a href="/dashboard/events" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Calendar className="w-4 h-4" /> Events
          </a>
          <a href="/dashboard/committees" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Users className="w-4 h-4" /> Committees
          </a>
        </nav>
      )}
    </header>
  );
}
