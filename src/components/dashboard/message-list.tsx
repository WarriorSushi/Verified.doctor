"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Check,
  Copy,
  Trash2,
  Pin,
  Shield,
  Search,
  CheckCheck,
  Inbox,
  CalendarCheck,
  HelpCircle,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_name: string;
  sender_phone: string;
  sender_email?: string | null;
  message_content: string;
  is_read: boolean | null;
  reply_content: string | null;
  reply_sent_at: string | null;
  created_at: string | null;
  is_admin_message?: boolean | null;
  is_pinned?: boolean | null;
  admin_sender_name?: string | null;
}

interface MessageListProps {
  messages: Message[];
  profileId: string;
}

type Category = "all" | "inquiries" | "appointments" | "general";

const categories: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <Inbox className="w-3.5 h-3.5" /> },
  { key: "inquiries", label: "Inquiries", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { key: "appointments", label: "Appointments", icon: <CalendarCheck className="w-3.5 h-3.5" /> },
  { key: "general", label: "General", icon: <MessageSquare className="w-3.5 h-3.5" /> },
];

const quickReplies = [
  "Thank you for reaching out. I'll review your inquiry and get back to you shortly.",
  "Please visit my clinic during consultation hours for a detailed assessment.",
  "I'd recommend scheduling an appointment. You can book through my profile page.",
  "Thank you for your interest. Unfortunately, I'm not taking new patients at this time.",
];

function categorizeMessage(content: string): Category {
  const lower = content.toLowerCase();
  if (
    lower.includes("appointment request") ||
    lower.includes("preferred time slots") ||
    lower.includes("consultation type") ||
    lower.includes("🏥 in-person") ||
    lower.includes("📹 video") ||
    lower.includes("📞 phone") ||
    lower.includes("appointment") ||
    lower.includes("book") ||
    lower.includes("schedule") ||
    lower.includes("slot") ||
    lower.includes("timing") ||
    lower.includes("available")
  ) {
    return "appointments";
  }
  if (lower.includes("?") || lower.includes("query") || lower.includes("inquiry") || lower.includes("question") || lower.includes("consult")) {
    return "inquiries";
  }
  return "general";
}

function parseAppointmentMessage(content: string) {
  if (!content.includes("APPOINTMENT REQUEST")) return null;

  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const result: {
    patient?: string;
    phone?: string;
    email?: string;
    type?: string;
    concern?: string;
    payment?: string;
    slots: string[];
  } = { slots: [] };

  let readingConcern = false;
  for (const line of lines) {
    if (line.startsWith("👤 Patient:")) result.patient = line.replace("👤 Patient:", "").trim();
    else if (line.startsWith("📱 Phone:")) result.phone = line.replace("📱 Phone:", "").trim();
    else if (line.startsWith("✉️ Email:")) result.email = line.replace("✉️ Email:", "").trim();
    else if (line.startsWith("🏷️ Type:")) result.type = line.replace("🏷️ Type:", "").trim();
    else if (line.startsWith("💳 Payment:")) {
      result.payment = line.replace("💳 Payment:", "").trim();
      readingConcern = false;
    }
    else if (line.startsWith("📝 Concern:")) {
      readingConcern = true;
      result.concern = "";
    }
    else if (/^\d+\./.test(line) || /^\d+\s*\./.test(line) || /^1\.|^2\.|^3\./.test(line)) {
      result.slots.push(line.replace(/^\d+\.?\s*/, "").trim());
      readingConcern = false;
    }
    else if (readingConcern && !line.startsWith("⏰ Preferred Time Slots:")) {
      result.concern = [result.concern, line].filter(Boolean).join(" ").trim();
    }
  }

  return result;
}

export function MessageList({ messages: initialMessages, profileId }: MessageListProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const unreadCount = messages.filter(m => !m.is_read).length;

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.sender_name.toLowerCase().includes(query) ||
          m.message_content.toLowerCase().includes(query) ||
          (m.sender_email && m.sender_email.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (m) => categorizeMessage(m.message_content) === activeCategory
      );
    }

    return filtered;
  }, [messages, searchQuery, activeCategory]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if unread
    if (!message.is_read) {
      await fetch(`/api/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setMessages(msgs => msgs.map(m => m.id === message.id ? { ...m, is_read: true } : m));
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const unreadMessages = messages.filter(m => !m.is_read && !m.is_admin_message);
      await Promise.all(
        unreadMessages.map(m =>
          fetch(`/api/messages/${m.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );
      setMessages(msgs => msgs.map(m => ({ ...m, is_read: true })));
      toast.success(`Marked ${unreadMessages.length} messages as read`);
      router.refresh();
    } catch {
      toast.error("Failed to mark messages as read");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const markAsReplied = async () => {
    if (!selectedMessage) return;

    try {
      await fetch(`/api/messages/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replied: true }),
      });

      setSelectedMessage({
        ...selectedMessage,
        reply_sent_at: new Date().toISOString(),
      });

      setMessages(messages.map(m =>
        m.id === selectedMessage.id
          ? { ...m, reply_sent_at: new Date().toISOString() }
          : m
      ));

      toast.success("Marked as replied");
    } catch (error) {
      console.error("Mark replied error:", error);
      toast.error("Failed to mark as replied");
    }
  };

  const handleDeleteMessage = async (messageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((m) => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        toast.success("Message deleted");
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-10 h-10 text-sky-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No messages yet</h3>
        <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
          When patients send inquiries through your profile, they&apos;ll appear here. Share your profile to start receiving messages!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Search, Filter & Actions Bar */}
      <div className="space-y-3">
        {/* Search + Mark All Read */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={isMarkingAllRead}
              className="whitespace-nowrap text-xs h-10"
            >
              {isMarkingAllRead ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Reading...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Read all</span>
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
          {categories.map((cat) => {
            const count = cat.key === "all"
              ? messages.length
              : messages.filter(m => categorizeMessage(m.message_content) === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  activeCategory === cat.key
                    ? "bg-[#0099F7] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                )}
              >
                {cat.icon}
                {cat.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  activeCategory === cat.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No messages match your search</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((message) => {
              const isAdminMessage = message.is_admin_message;
              const messageCategory = categorizeMessage(message.message_content);

              return (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={cn(
                    "relative group",
                    isAdminMessage ? "bg-gradient-to-r from-rose-50 to-pink-50" : ""
                  )}
                >
                  <button
                    onClick={() => handleOpenMessage(message)}
                    className="w-full p-3.5 sm:p-4 text-left hover:bg-slate-50/50 transition-colors flex items-start gap-3 sm:gap-4"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold",
                        isAdminMessage
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                          : !message.is_read
                            ? "bg-[#0099F7] text-white"
                            : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {isAdminMessage ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        message.sender_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={cn(
                          "font-semibold text-sm",
                          isAdminMessage ? "text-rose-700" : "text-slate-900"
                        )}>
                          {message.sender_name}
                        </span>
                        {message.is_pinned && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-700 rounded flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5" />
                            Pinned
                          </span>
                        )}
                        {isAdminMessage && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-rose-500 text-white rounded">
                            Admin
                          </span>
                        )}
                        {!message.is_read && !isAdminMessage && (
                          <span className="w-2 h-2 rounded-full bg-[#0099F7]" />
                        )}
                        {message.reply_sent_at && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Replied
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm line-clamp-2",
                        isAdminMessage ? "text-rose-600" : "text-slate-600",
                        !message.is_read && !isAdminMessage && "font-medium"
                      )}>
                        {message.message_content}
                      </p>
                      {message.created_at && (
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-medium",
                            messageCategory === "appointments"
                              ? "bg-sky-50 text-sky-600"
                              : messageCategory === "inquiries"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-50 text-slate-500"
                          )}>
                            {messageCategory === "appointments" ? "Appointment" : messageCategory === "inquiries" ? "Inquiry" : "General"}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Delete button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3.5 right-3.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete message?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the message from your inbox. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e: React.MouseEvent) => handleDeleteMessage(message.id, e)}
                          className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => {
          setSelectedMessage(null);
          setShowQuickReplies(false);
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-base">Message from {selectedMessage?.sender_name}</DialogTitle>
            </div>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {(() => {
                const appointment = parseAppointmentMessage(selectedMessage.message_content);
                return appointment ? (
                  <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-[#0099F7]" />
                      <h4 className="text-sm font-semibold text-slate-900">Appointment Request</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {appointment.type && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-0.5">Consultation Type</p>
                          <p className="text-slate-800">{appointment.type}</p>
                        </div>
                      )}
                      {appointment.payment && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-0.5">Payment</p>
                          <p className="text-slate-800">{appointment.payment}</p>
                        </div>
                      )}
                    </div>

                    {appointment.slots.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Preferred Time Slots</p>
                        <div className="space-y-1.5">
                          {appointment.slots.map((slot, idx) => (
                            <div key={idx} className="inline-flex mr-2 mb-2 items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-sky-100 text-sm text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-[#0099F7]" />
                              {slot}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {appointment.concern && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Concern</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{appointment.concern}</p>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
              {/* Sender Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-mono">
                  {selectedMessage.sender_phone}
                </span>
              </div>

              {/* Message */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap text-sm">
                  {selectedMessage.message_content}
                </p>
                {selectedMessage.created_at && (
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDistanceToNow(new Date(selectedMessage.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>

              {/* Quick Reply Templates */}
              <div>
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="flex items-center gap-2 text-sm font-medium text-[#0099F7] hover:text-[#0080CC] transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Quick reply templates
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showQuickReplies && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showQuickReplies && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2">
                        {quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              copyToClipboard(reply, "Quick reply");
                              setShowQuickReplies(false);
                            }}
                            className="w-full text-left p-3 bg-sky-50 hover:bg-sky-100 rounded-lg text-sm text-slate-700 transition-colors border border-sky-100"
                          >
                            <div className="flex items-start gap-2">
                              <Copy className="w-3.5 h-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
                              <span>{reply}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Respond privately</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => copyToClipboard(selectedMessage.sender_phone, "Phone number")}
                  >
                    <Phone className="w-4 h-4 mr-3 text-slate-500" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{selectedMessage.sender_phone}</div>
                      <div className="text-xs text-slate-500">Click to copy phone</div>
                    </div>
                    <Copy className="w-4 h-4 text-slate-400" />
                  </Button>

                  {selectedMessage.sender_email && (
                    <Button
                      variant="outline"
                      className="justify-start h-auto py-3"
                      onClick={() => copyToClipboard(selectedMessage.sender_email!, "Email")}
                    >
                      <Mail className="w-4 h-4 mr-3 text-slate-500" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{selectedMessage.sender_email}</div>
                        <div className="text-xs text-slate-500">Click to copy email</div>
                      </div>
                      <Copy className="w-4 h-4 text-slate-400" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  Copy the contact details and respond via your preferred method (phone call, WhatsApp, email, etc.)
                </p>

                {/* Mark as replied status */}
                {selectedMessage.reply_sent_at ? (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                      Marked as replied{" "}
                      {formatDistanceToNow(new Date(selectedMessage.reply_sent_at), { addSuffix: true })}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={markAsReplied}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Replied
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
