"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getEvents } from "@/lib/event-service";
import { getGuests } from "@/lib/guest-service";
import { Event, Guest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar, Users, UserCheck, Plus, ArrowRight } from "lucide-react";

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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, <span className="capitalize">{user?.role}</span>. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="text-2xl font-semibold mt-1">
                  {isLoading ? <span className="inline-block w-8 h-7 bg-muted rounded animate-pulse" /> : stats.totalEvents}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-semibold mt-1">
                  {isLoading ? <span className="inline-block w-8 h-7 bg-muted rounded animate-pulse" /> : stats.totalGuests}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-semibold mt-1">
                  {isLoading ? (
                    <span className="inline-block w-8 h-7 bg-muted rounded animate-pulse" />
                  ) : (
                    <>
                      {stats.checkedIn}
                      {stats.totalGuests > 0 && (
                        <span className="text-sm font-normal text-muted-foreground ml-1.5">
                          ({Math.round((stats.checkedIn / stats.totalGuests) * 100)}%)
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
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
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">Recent Events</CardTitle>
            <Link href="/dashboard/events" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No events yet.</p>
                <Link href="/dashboard/events/create" className={buttonVariants({ size: "sm", className: "mt-3" })}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Event
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {event.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/events/create" className={buttonVariants({ variant: "default", size: "sm", className: "w-full justify-start" })}>
              <Plus className="w-3.5 h-3.5 mr-2" /> New Event
            </Link>
            <Link href="/dashboard/events" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-start" })}>
              <Calendar className="w-3.5 h-3.5 mr-2" /> Manage Events
            </Link>
            <Link href="/dashboard/committees" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-start" })}>
              <Users className="w-3.5 h-3.5 mr-2" /> Manage Committees
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
