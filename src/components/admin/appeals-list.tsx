"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  UserCheck,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Appeal {
  id: string;
  profile_id: string;
  message: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    handle: string;
    profile_photo_url: string | null;
    is_banned: boolean;
    ban_reason: string | null;
    banned_at: string | null;
  };
}

export function AdminAppealsList() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, [statusFilter]);

  const fetchAppeals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/appeals?status=${statusFilter}`);
      const data = await response.json();

      if (response.ok) {
        setAppeals(data.appeals || []);
      } else {
        setError(data.error || "Failed to fetch appeals");
      }
    } catch (err) {
      setError("Failed to fetch appeals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAppeal = async (
    appealId: string,
    status: "reviewed" | "resolved" | "rejected",
    unban: boolean = false
  ) => {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/admin/appeals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealId,
          status,
          adminResponse: adminResponse.trim() || undefined,
          unban,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedAppeal(null);
        setAdminResponse("");
        fetchAppeals();
      } else {
        alert(data.error || "Failed to update appeal");
      }
    } catch (err) {
      alert("Failed to update appeal");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "reviewed":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
            <Eye className="w-3 h-3" />
            Reviewed
          </span>
        );
      case "resolved":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {["pending", "reviewed", "resolved", "rejected", "all"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-[#0099F7] text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appeals List */}
      {appeals.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No appeals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                  {appeal.profiles.profile_photo_url ? (
                    <Image
                      src={appeal.profiles.profile_photo_url}
                      alt={appeal.profiles.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                      {appeal.profiles.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">
                      {appeal.profiles.full_name}
                    </h3>
                    <span className="text-slate-500 text-sm">
                      @{appeal.profiles.handle}
                    </span>
                    {getStatusBadge(appeal.status)}
                    {appeal.profiles.is_banned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                        <UserX className="w-3 h-3" />
                        Banned
                      </span>
                    )}
                  </div>

                  {/* Ban Reason */}
                  {appeal.profiles.ban_reason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                      <p className="text-xs text-red-400 font-medium mb-1">Ban Reason:</p>
                      <p className="text-sm text-red-300">{appeal.profiles.ban_reason}</p>
                    </div>
                  )}

                  {/* Appeal Message */}
                  <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                      {appeal.message}
                    </p>
                  </div>

                  {/* Admin Response (if exists) */}
                  {appeal.admin_response && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                      <p className="text-xs text-blue-400 font-medium mb-1">Admin Response:</p>
                      <p className="text-sm text-blue-300">{appeal.admin_response}</p>
                    </div>
                  )}

                  {/* Meta and Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-slate-500">
                      Submitted: {formatDate(appeal.created_at)}
                    </div>

                    {appeal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppeal(appeal);
                            setAdminResponse("");
                          }}
                          className="text-xs bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedAppeal} onOpenChange={(open) => !open && setSelectedAppeal(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Review this ban appeal and take action
            </DialogDescription>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4 mt-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-700">
                  {selectedAppeal.profiles.profile_photo_url ? (
                    <Image
                      src={selectedAppeal.profiles.profile_photo_url}
                      alt={selectedAppeal.profiles.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      {selectedAppeal.profiles.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedAppeal.profiles.full_name}</p>
                  <p className="text-sm text-slate-400">@{selectedAppeal.profiles.handle}</p>
                </div>
              </div>

              {/* Ban Reason */}
              {selectedAppeal.profiles.ban_reason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs text-red-400 font-medium mb-1">Original Ban Reason:</p>
                  <p className="text-sm text-red-300">{selectedAppeal.profiles.ban_reason}</p>
                </div>
              )}

              {/* Appeal Message */}
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Appeal Message:</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {selectedAppeal.message}
                </p>
              </div>

              {/* Admin Response */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  Your Response (optional)
                </label>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add a response to this appeal..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleUpdateAppeal(selectedAppeal.id, "resolved", true)}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Approve & Unban
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleUpdateAppeal(selectedAppeal.id, "rejected")}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1 bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Approving will unban the user and restore their profile
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
