"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Users, Search, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLogoutButton } from "@/components/admin/logout-button";

interface User {
  id: string;
  full_name: string;
  handle: string;
  specialty: string | null;
  profile_photo_url: string | null;
  is_verified: boolean;
  verification_status: string | null;
  recommendation_count: number | null;
  connection_count: number | null;
  created_at: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const getStatusBadge = (user: User) => {
    if (user.is_verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    }
    if (user.verification_status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    if (user.verification_status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-400 rounded-full">
        Unverified
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <div className="relative w-8 h-8">
                <Image
                  src="/verified-doctor-logo.svg"
                  alt="Verified.Doctor"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Admin Panel</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-[#0099F7]/20 text-[#0099F7] rounded-full">
                Verified.Doctor
              </span>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <Link
              href="/admin"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Verifications
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-3 text-sm font-medium text-white border-b-2 border-[#0099F7]"
            >
              All Users
            </Link>
            <Link
              href="/admin/appeals"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Appeals
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#0099F7]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">All Users</h1>
            <p className="text-slate-400">
              {pagination.total} total users
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, handle, or specialty..."
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="bg-[#0099F7] hover:bg-[#0088E0] text-white">
              Search
            </Button>
          </div>
        </form>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0099F7] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No users found
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Handle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                          {user.profile_photo_url ? (
                            <Image
                              src={user.profile_photo_url}
                              alt={user.full_name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                              {user.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name}</p>
                          <p className="text-slate-400 text-sm">{user.specialty || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/${user.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0099F7] hover:underline text-sm"
                      >
                        /{user.handle}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-400">
                        {user.recommendation_count || 0} recs • {user.connection_count || 0} conns
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-[#0099F7] hover:text-[#0088E0] text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(pagination.page - 1, search)}
                    disabled={pagination.page <= 1}
                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(pagination.page + 1, search)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
