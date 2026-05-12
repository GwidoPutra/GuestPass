"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProfile, toggleApproval, deleteProfile } from "@/lib/profile-service";
import { Profile } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, User, Shield, CalendarDays, Trash2, CheckCircle, Clock, ShieldCheck, ShieldX } from "lucide-react";

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
        setError("Profil tidak ditemukan.");
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
      showToast(updated.isApproved ? "Akun berhasil disetujui." : "Persetujuan dicabut.", "success");
    } catch {
      showToast("Gagal memperbarui status.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProfile(id);
      showToast("Akun berhasil dihapus.", "success");
      router.push("/dashboard/committees");
    } catch {
      setError("Gagal menghapus akun.");
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
      <div className="space-y-6 max-w-lg animate-in-page">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-48 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-lg space-y-4 animate-in-page">
        <Breadcrumb items={[
          { label: "Ringkasan", href: "/dashboard" },
          { label: "Panitia", href: "/dashboard/committees" },
          { label: "Error" },
        ]} />
        <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg animate-in-page">
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Panitia", href: "/dashboard/committees" },
        { label: profile.fullName },
      ]} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-base font-semibold text-primary ring-1 ring-primary/10">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={isToggling}
            onClick={handleToggleApproval}
          >
            {isToggling ? (
              <span className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : profile.isApproved ? (
              <span className="flex items-center gap-1.5"><ShieldX className="w-3.5 h-3.5" /> Cabut</span>
            ) : (
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Setujui</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/8"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-semibold">Detail Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email
            </span>
            <span className="text-[13px] font-medium">{profile.email}</span>
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Username
            </span>
            <span className="text-[13px] font-medium">@{profile.username}</span>
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Peran
            </span>
            <Badge variant="outline" className="capitalize text-xs">{profile.role || "panitia"}</Badge>
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground">Status</span>
            {profile.isApproved ? (
              <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0 gap-1">
                <CheckCircle className="w-3 h-3" />
                Disetujui
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                Menunggu
              </Badge>
            )}
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" /> Terdaftar
            </span>
            <span className="text-[13px] font-medium">{formatDate(profile.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Hapus &quot;{profile.fullName}&quot;?</DialogTitle>
            <DialogDescription className="text-[13px]">Tindakan ini tidak dapat dibatalkan. Akun akan dihapus secara permanen.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
