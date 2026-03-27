"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ExternalLink,
  Check,
  X,
  Loader2,
  UserPlus,
  BadgeCheck,
  Search,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  handle: string;
  specialty: string | null;
  profile_photo_url: string | null;
  is_verified: boolean | null;
  clinic_location?: string | null;
}

interface Connection {
  id: string;
  connectedAt: string | null;
  profile: Profile;
}

interface PendingRequest {
  id: string;
  created_at: string | null;
  requester: Profile;
}

interface ConnectionsListProps {
  connections: Connection[];
  pendingRequests: PendingRequest[];
  suggestedConnections?: Profile[];
  currentSpecialty?: string | null;
  currentLocation?: string | null;
}

export function ConnectionsList({
  connections,
  pendingRequests,
  suggestedConnections = [],
  currentSpecialty,
  currentLocation,
}: ConnectionsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dismissedRequests, setDismissedRequests] = useState<Set<string>>(new Set());

  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const query = searchQuery.toLowerCase();
    return connections.filter(
      (c) =>
        c.profile.full_name.toLowerCase().includes(query) ||
        (c.profile.specialty && c.profile.specialty.toLowerCase().includes(query)) ||
        (c.profile.clinic_location && c.profile.clinic_location.toLowerCase().includes(query))
    );
  }, [connections, searchQuery]);

  const handleRequest = async (id: string, action: "accept" | "reject") => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        if (action === "reject") {
          setDismissedRequests(prev => new Set([...prev, id]));
        }
        toast.success(
          action === "accept"
            ? "Connection accepted!"
            : "Request declined."
        );
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  const visiblePendingRequests = pendingRequests.filter(r => !dismissedRequests.has(r.id));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pending Requests */}
      <AnimatePresence>
        {visiblePendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5"
          >
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0099F7]" />
              Pending Requests
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                {visiblePendingRequests.length}
              </span>
            </h2>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {visiblePendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50/50 to-white rounded-xl border border-sky-100"
                  >
                    <div className="relative w-11 h-11 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {request.requester.profile_photo_url ? (
                        <Image
                          src={request.requester.profile_photo_url}
                          alt={request.requester.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold text-sm">
                          {request.requester.full_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-slate-900 text-sm truncate">
                          {request.requester.full_name}
                        </p>
                        {request.requester.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-[#0099F7] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {request.requester.specialty || "Medical Professional"}
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRequest(request.id, "reject")}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          onClick={() => handleRequest(request.id, "accept")}
                          disabled={processingId === request.id}
                          className="bg-[#0099F7] hover:bg-[#0080CC] h-8 text-xs"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connections */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0099F7]" />
            Your Connections
            <span className="text-sm font-normal text-slate-500">
              ({connections.length})
            </span>
          </h2>
          {connections.length > 3 && (
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          )}
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-sky-300" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">
              No connections yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Use the invite panel to invite colleagues and grow your professional network.
            </p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-6">
            <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No connections match &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
            {filteredConnections.map((connection, i) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/${connection.profile.handle}`}
                  target="_blank"
                  className="group flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {connection.profile.profile_photo_url ? (
                      <Image
                        src={connection.profile.profile_photo_url}
                        alt={connection.profile.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold text-sm">
                        {connection.profile.full_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {connection.profile.full_name}
                      </p>
                      {connection.profile.is_verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#0099F7] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {connection.profile.specialty || "Medical Professional"}
                    </p>
                  </div>

                  <ExternalLink className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Connections */}
      {suggestedConnections.length > 0 && (
        <div className="bg-gradient-to-br from-sky-50/50 to-white rounded-xl border border-sky-100 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#0099F7]" />
            <h2 className="text-base font-semibold text-slate-900">Suggested Connections</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Doctors in your specialty or area
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestedConnections.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/${doctor.handle}`}
                target="_blank"
                className="group flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-all border border-slate-100 hover:border-sky-200"
              >
                <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  {doctor.profile_photo_url ? (
                    <Image
                      src={doctor.profile_photo_url}
                      alt={doctor.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold text-sm">
                      {doctor.full_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {doctor.full_name}
                    </p>
                    {doctor.is_verified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-[#0099F7] flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                    <span>{doctor.specialty || "Medical Professional"}</span>
                    {doctor.clinic_location && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {doctor.clinic_location}
                        </span>
                      </>
                    )}
                  </div>
                  {/* Show match reason */}
                  {currentSpecialty && doctor.specialty === currentSpecialty && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-medium rounded">
                      Same specialty
                    </span>
                  )}
                  {currentLocation && doctor.clinic_location === currentLocation && currentSpecialty !== doctor.specialty && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-medium rounded">
                      Same location
                    </span>
                  )}
                </div>

                <ExternalLink className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
