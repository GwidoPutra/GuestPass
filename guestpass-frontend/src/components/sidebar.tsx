"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Calendar, Users, Sparkles } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/dashboard/events", icon: Calendar },
  { label: "Committees", href: "/dashboard/committees", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow overflow-hidden">
            <Image
              src="/logo.png"
              alt="GuestPass"
              width={22}
              height={22}
            />
          </div>
          <span className="text-[15px] font-semibold text-sidebar-foreground tracking-tight">GuestPass</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? "text-sidebar-primary" : ""}`} />
              {item.label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent/50">
          <Sparkles className="w-3.5 h-3.5 text-sidebar-primary/70" />
          <span className="text-[11px] text-sidebar-foreground/60">v1.0 Beta</span>
        </div>
      </div>
    </aside>
  );
}
