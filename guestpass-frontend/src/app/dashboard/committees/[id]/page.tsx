"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile, toggleApproval, deleteProfile } from "@/lib/profile-service";
import { Profile } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Mail, User, Shield, CalendarDays, Trash2 } from "lucide-react";

export default function CommitteeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(id);
        setProfile(data);
      } catch {
        setError("Profile not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleToggleApproval = async () => {
    setIsToggling(true);
    try {
      const updated = await toggleApproval(id);
      setProfile(updated);
      showToast(updated.isApproved ? "Account approved." : "Approval revoked.", "success");
    } catch {
      showToast("Failed to update approval.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProfile(id);
      showToast("Account deleted.", "success");
      router.push("/dashboard/committees");
    } catch {
      setError("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/dashboard/committees" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to committees
        </Link>
        <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Link href="/dashboard/committees" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to committees
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isToggling}
            onClick={handleToggleApproval}
          >
            {isToggling ? "..." : profile.isApproved ? "Revoke" : "Approve"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </span>
            <span className="text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Username
            </span>
            <span className="text-sm">@{profile.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Role
            </span>
            <Badge variant="outline" className="capitalize text-xs">{profile.role || "panitia"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {profile.isApproved ? (
              <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0">Approved</Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Registered
            </span>
            <span className="text-sm">{formatDate(profile.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &quot;{profile.fullName}&quot;?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
