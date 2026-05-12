"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getEvents } from "@/lib/event-service";
import { getGuests } from "@/lib/guest-service";
import { Event, Guest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Users, UserCheck, Plus, ArrowRight, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalEvents: number;
  totalGuests: number;
  checkedIn: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalEvents: 0, totalGuests: 0, checkedIn: 0 });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const events = await getEvents();
        setRecentEvents(events.slice(0, 5));

        const guestPromises = events.map((e) => getGuests(e.id));
        const guestResults = await Promise.all(guestPromises);
        const allGuests: Guest[] = guestResults.flat();

        setStats({
          totalEvents: events.length,
          totalGuests: allGuests.length,
          checkedIn: allGuests.filter((g) => g.isCheckedIn).length,
        });
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const checkInRate = stats.totalGuests > 0 ? Math.round((stats.checkedIn / stats.totalGuests) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl animate-in-page">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="capitalize font-medium text-foreground/80">{user?.role}</span>. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[13px] text-muted-foreground font-medium">Events</p>
                <p className="text-3xl font-semibold tracking-tight">
                  {isLoading ? <span className="inline-block w-10 h-8 bg-muted rounded-md animate-pulse" /> : stats.totalEvents}
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center ring-1 ring-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[13px] text-muted-foreground font-medium">Total Guests</p>
                <p className="text-3xl font-semibold tracking-tight">
                  {isLoading ? <span className="inline-block w-10 h-8 bg-muted rounded-md animate-pulse" /> : stats.totalGuests}
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-chart-2/8 flex items-center justify-center ring-1 ring-chart-2/10">
                <Users className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[13px] text-muted-foreground font-medium">Checked In</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-semibold tracking-tight">
                    {isLoading ? (
                      <span className="inline-block w-10 h-8 bg-muted rounded-md animate-pulse" />
                    ) : (
                      stats.checkedIn
                    )}
                  </p>
                  {!isLoading && stats.totalGuests > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-chart-2">
                      <TrendingUp className="w-3 h-3" />
                      {checkInRate}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-chart-5/8 flex items-center justify-center ring-1 ring-chart-5/10">
                <UserCheck className="w-5 h-5 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent events */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-[15px] font-semibold">Recent Events</CardTitle>
            <Link href="/dashboard/events" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">No events yet.</p>
                <Link href="/dashboard/events/create" className={buttonVariants({ size: "sm" })}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Event
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-accent/60 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary ring-1 ring-primary/10">
                        {event.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/events/create" className={buttonVariants({ variant: "default", size: "sm", className: "w-full justify-start h-9" })}>
              <Plus className="w-3.5 h-3.5 mr-2.5" /> New Event
            </Link>
            <Link href="/dashboard/events" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-start h-9" })}>
              <Calendar className="w-3.5 h-3.5 mr-2.5" /> Manage Events
            </Link>
            <Link href="/dashboard/committees" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-start h-9" })}>
              <Users className="w-3.5 h-3.5 mr-2.5" /> Manage Committees
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
