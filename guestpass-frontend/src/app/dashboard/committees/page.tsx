"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfiles, toggleApproval, deleteProfile } from "@/lib/profile-service";
import { Profile } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, Clock, Trash2 } from "lucide-react";

export default function CommitteesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch {
        setError("Failed to load committees.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleToggleApproval = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await toggleApproval(id);
      setProfiles(profiles.map((p) => (p.id === id ? updated : p)));
      showToast(updated.isApproved ? "Account approved." : "Approval revoked.", "success");
    } catch {
      showToast("Failed to update approval.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProfile(deleteId);
      setProfiles(profiles.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      showToast("Account deleted.", "success");
    } catch {
      setError("Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" });
  };

  const approvedCount = profiles.filter((p) => p.isApproved).length;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Committees</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage committee accounts and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{profiles.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-chart-2/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-chart-2" />
            </div>
            <div>
              <p className="text-xl font-semibold">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-chart-3/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xl font-semibold">{profiles.length - approvedCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}

      {/* Table */}
      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-10 h-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No committee accounts registered yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <Link href={`/dashboard/committees/${profile.id}`} className="hover:text-primary transition-colors">
                      <p className="font-medium text-sm">{profile.fullName}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">{profile.role || "panitia"}</Badge>
                  </TableCell>
                  <TableCell>
                    {profile.isApproved ? (
                      <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0">Approved</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(profile.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={togglingId === profile.id}
                        onClick={() => handleToggleApproval(profile.id)}
                      >
                        {togglingId === profile.id ? "..." : profile.isApproved ? "Revoke" : "Approve"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(profile.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
