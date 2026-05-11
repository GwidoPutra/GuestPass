"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfiles, toggleApproval, deleteProfile } from "@/lib/profile-service";
import { Profile } from "@/lib/types";
import { useToast } from "@/lib/toast-context";

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
        setError("Gagal memuat data panitia.");
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
      showToast(updated.isApproved ? "Akun berhasil di-approve." : "Approval berhasil di-revoke.", "success");
    } catch {
      showToast("Gagal mengubah status approval.", "error");
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
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const approvedCount = profiles.filter((p) => p.isApproved).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-foreground/5 rounded animate-pulse" />
        <div className="h-64 bg-foreground/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Manajemen Panitia</h2>
        <p className="mt-1 text-sm text-foreground/60">
          {approvedCount}/{profiles.length} akun sudah disetujui
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border border-foreground/10 p-4">
          <p className="text-xs font-medium text-foreground/60">Total Akun</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{profiles.length}</p>
        </div>
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-700">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{approvedCount}</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-700">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{profiles.length - approvedCount}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      {profiles.length === 0 ? (
        <div className="rounded-lg border border-foreground/10 p-12 text-center">
          <p className="text-foreground/60">Belum ada akun panitia terdaftar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-foreground/10">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-foreground/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Terdaftar
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    <Link
                      href={`/dashboard/committees/${profile.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {profile.fullName}
                    </Link>
                    <p className="text-xs text-foreground/50">@{profile.username}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/70">
                    {profile.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                      {profile.role || "panitia"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {profile.isApproved ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/70">
                    {formatDate(profile.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleToggleApproval(profile.id)}
                      disabled={togglingId === profile.id}
                      className={`font-medium disabled:opacity-50 ${
                        profile.isApproved
                          ? "text-amber-600 hover:text-amber-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {togglingId === profile.id
                        ? "..."
                        : profile.isApproved
                        ? "Revoke"
                        : "Approve"}
                    </button>
                    <button
                      onClick={() => setDeleteId(profile.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg border border-foreground/10">
            <h3 className="text-lg font-semibold text-foreground">Konfirmasi Hapus</h3>
            <p className="mt-2 text-sm text-foreground/60">
              Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
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
