"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile, toggleApproval, deleteProfile } from "@/lib/profile-service";
import { Profile } from "@/lib/types";

export default function CommitteeDetailPage() {
  const params = useParams();
  const router = useRouter();
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
    } catch {
      setError("Gagal mengubah status approval.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProfile(id);
      router.push("/dashboard/committees");
    } catch {
      setError("Gagal menghapus akun.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-foreground/5 rounded animate-pulse" />
        <div className="h-48 bg-foreground/5 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/committees"
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          &larr; Kembali ke Daftar Panitia
        </Link>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error || "Profil tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/committees"
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        &larr; Kembali ke Daftar Panitia
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{profile.fullName}</h2>
          <p className="mt-1 text-sm text-foreground/60">@{profile.username}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleApproval}
            disabled={isToggling}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              profile.isApproved
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isToggling
              ? "Memproses..."
              : profile.isApproved
              ? "Revoke Approval"
              : "Approve"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Detail Card */}
      <div className="rounded-lg border border-foreground/10 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Informasi Akun</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Email</p>
            <p className="mt-1 text-sm text-foreground">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Role</p>
            <p className="mt-1">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                {profile.role || "panitia"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Status</p>
            <div className="mt-1">
              {profile.isApproved ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Pending Approval
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Terdaftar Pada</p>
            <p className="mt-1 text-sm text-foreground">{formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-foreground/10">
            <h3 className="text-lg font-semibold text-foreground">Konfirmasi Hapus</h3>
            <p className="mt-2 text-sm text-foreground/60">
              Apakah Anda yakin ingin menghapus akun &quot;{profile.fullName}&quot;? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
