"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfiles, toggleApproval, deleteProfile } from "@/lib/profile-service";
import { Profile } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, Clock, Trash2, CheckCircle, ShieldCheck, ShieldX } from "lucide-react";

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
        setError("Gagal memuat daftar panitia.");
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
      showToast(updated.isApproved ? "Akun berhasil disetujui." : "Persetujuan dicabut.", "success");
    } catch {
      showToast("Gagal memperbarui status.", "error");
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
      showToast("Akun berhasil dihapus.", "success");
    } catch {
      setError("Gagal menghapus akun.");
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
      <div className="space-y-6 max-w-4xl animate-in-page">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-28 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-40 bg-muted/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in-page">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Ringkasan", href: "/dashboard" },
        { label: "Panitia" },
      ]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panitia</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Kelola akun panitia dan persetujuan akses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center ring-1 ring-border/40">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">{profiles.length}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-chart-2/8 flex items-center justify-center ring-1 ring-chart-2/10">
              <UserCheck className="w-4 h-4 text-chart-2" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">{approvedCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Disetujui</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-chart-3/8 flex items-center justify-center ring-1 ring-chart-3/10">
              <Clock className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">{profiles.length - approvedCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Menunggu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/8 border border-destructive/15 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Belum ada panitia terdaftar</p>
            <p className="text-xs text-muted-foreground">Panitia akan muncul di sini setelah mendaftar</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Anggota</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Peran</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider">Bergabung</TableHead>
                <TableHead className="text-[12px] font-semibold uppercase tracking-wider text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id} className="group">
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
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{formatDate(profile.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-medium"
                        disabled={togglingId === profile.id}
                        onClick={() => handleToggleApproval(profile.id)}
                      >
                        {togglingId === profile.id ? (
                          <span className="w-3 h-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                        ) : profile.isApproved ? (
                          <span className="flex items-center gap-1"><ShieldX className="w-3 h-3" /> Cabut</span>
                        ) : (
                          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Setujui</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteId(profile.id)}
                      >
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Hapus Akun</DialogTitle>
            <DialogDescription className="text-[13px]">Tindakan ini tidak dapat dibatalkan. Akun panitia akan dihapus secara permanen.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
