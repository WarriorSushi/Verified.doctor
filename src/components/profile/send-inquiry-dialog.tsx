"use client";

import { useState, useCallback } from "react";
import {
  Loader2,
  Send,
  Check,
  Calendar,
  Video,
  Phone,
  MapPin,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ValidatedInput, validationRules } from "@/components/ui/validated-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";

type InquiryType = "general" | "appointment";
type ConsultationType = "in-person" | "video" | "phone";

interface TimeSlot {
  date: string;
  time: string;
}

interface SendInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  doctorName: string;
}

/**
 * Format a structured appointment request into a readable message.
 */
function formatAppointmentMessage(data: {
  name: string;
  phone: string;
  email: string;
  consultationType: ConsultationType;
  timeSlots: TimeSlot[];
  concern: string;
  paymentMethod: string;
}): string {
  const consultationLabels: Record<ConsultationType, string> = {
    "in-person": "🏥 In-Person",
    video: "📹 Video Call",
    phone: "📞 Phone Call",
  };

  let msg = `📋 APPOINTMENT REQUEST\n\n`;
  msg += `👤 Patient: ${data.name}\n`;
  msg += `📱 Phone: ${data.phone}\n`;
  if (data.email) msg += `✉️ Email: ${data.email}\n`;
  msg += `\n`;
  msg += `🏷️ Type: ${consultationLabels[data.consultationType]}\n`;

  if (data.timeSlots.length > 0) {
    msg += `\n⏰ Preferred Time Slots:\n`;
    data.timeSlots.forEach((slot, i) => {
      if (slot.date) {
        const dateStr = new Date(slot.date + "T00:00:00").toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        msg += `   ${i + 1}. ${dateStr}${slot.time ? ` at ${slot.time}` : ""}\n`;
      }
    });
  }

  if (data.concern) {
    msg += `\n📝 Concern:\n${data.concern}\n`;
  }

  if (data.paymentMethod) {
    msg += `\n💳 Payment: ${data.paymentMethod}\n`;
  }

  return msg;
}

export function SendInquiryDialog({
  open,
  onOpenChange,
  profileId,
  doctorName,
}: SendInquiryDialogProps) {
  const [inquiryType, setInquiryType] = useState<InquiryType>("general");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  // Appointment fields
  const [consultationType, setConsultationType] = useState<ConsultationType>("in-person");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ date: "", time: "" }]);
  const [concern, setConcern] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [formValid, setFormValid] = useState({ name: false, phone: false, email: true });

  const updateFieldValidity = useCallback(
    (field: keyof typeof formValid, isValid: boolean) => {
      setFormValid((prev) => ({ ...prev, [field]: isValid }));
    },
    []
  );

  const isGeneralFormValid =
    formValid.name && formValid.phone && formValid.email && message.trim().length > 0;

  const isAppointmentFormValid =
    formValid.name &&
    formValid.phone &&
    formValid.email &&
    timeSlots.some((s) => s.date);

  const isFormValid =
    inquiryType === "general" ? isGeneralFormValid : isAppointmentFormValid;

  const addTimeSlot = () => {
    if (timeSlots.length < 3) {
      setTimeSlots([...timeSlots, { date: "", time: "" }]);
    }
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const messageContent =
      inquiryType === "appointment"
        ? formatAppointmentMessage({
            name,
            phone,
            email,
            consultationType,
            timeSlots: timeSlots.filter((s) => s.date),
            concern,
            paymentMethod,
          })
        : message;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          senderName: name,
          senderPhone: phone,
          senderEmail: email || undefined,
          messageContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      trackEvent({ profileId, eventType: "inquiry_sent" });
      setStatus("success");
      toast.success(
        inquiryType === "appointment"
          ? "Appointment request sent!"
          : "Message sent successfully!"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setStatus("error");
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (status === "success") {
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setConcern("");
      setPaymentMethod("");
      setTimeSlots([{ date: "", time: "" }]);
      setConsultationType("in-person");
      setInquiryType("general");
      setStatus("idle");
    }
    onOpenChange(false);
  };

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inquiryType === "appointment"
              ? `Request Appointment with ${doctorName.split(" ")[0]}`
              : `Send Inquiry to ${doctorName.split(" ")[0]}`}
          </DialogTitle>
          <DialogDescription>
            {status === "success"
              ? "Your message has been sent!"
              : `${doctorName} typically responds within 24-48 hours.`}
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-slate-600">
              {inquiryType === "appointment"
                ? "Your appointment request has been sent. The doctor will confirm your preferred time slot."
                : "Your message has been sent. The doctor will contact you via phone or email."}
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inquiry Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setInquiryType("general")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  inquiryType === "general"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                General
              </button>
              <button
                type="button"
                onClick={() => setInquiryType("appointment")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  inquiryType === "appointment"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Appointment
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <ValidatedInput
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                rules={[
                  validationRules.required("Please enter your name"),
                  validationRules.minLength(2, "Name must be at least 2 characters"),
                ]}
                onValidationChange={(isValid) => updateFieldValidity("name", isValid)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <ValidatedInput
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                rules={[
                  validationRules.required("Please enter your phone number"),
                  validationRules.phone("Please enter a valid phone number"),
                ]}
                onValidationChange={(isValid) => updateFieldValidity("phone", isValid)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <ValidatedInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                rules={[validationRules.email("Please enter a valid email address")]}
                onValidationChange={(isValid) => updateFieldValidity("email", isValid)}
              />
            </div>

            {/* General Inquiry Fields */}
            {inquiryType === "general" && (
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi Doctor, I would like to schedule a consultation..."
                  rows={4}
                  maxLength={500}
                  required
                />
                <p className="text-xs text-slate-500 text-right">
                  {message.length}/500 characters
                </p>
              </div>
            )}

            {/* Appointment Fields */}
            {inquiryType === "appointment" && (
              <>
                {/* Consultation Type */}
                <div className="space-y-2">
                  <Label>Consultation Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "in-person", icon: MapPin, label: "In-Person" },
                        { value: "video", icon: Video, label: "Video" },
                        { value: "phone", icon: Phone, label: "Phone" },
                      ] as const
                    ).map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setConsultationType(value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
                          consultationType === value
                            ? "border-[#0099F7] bg-sky-50 text-[#0099F7]"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preferred Time Slots</Label>
                    {timeSlots.length < 3 && (
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="text-xs text-[#0099F7] font-medium flex items-center gap-0.5 hover:text-[#0088E0]"
                      >
                        <Plus className="w-3 h-3" />
                        Add slot
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {timeSlots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <input
                            type="date"
                            value={slot.date}
                            min={today}
                            onChange={(e) => updateTimeSlot(i, "date", e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0099F7]/30 focus:border-[#0099F7]"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <Select
                            value={slot.time}
                            onValueChange={(val) => updateTimeSlot(i, "time", val)}
                          >
                            <SelectTrigger className="w-[110px] h-8 text-sm">
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00">11:00 AM</SelectItem>
                              <SelectItem value="12:00">12:00 PM</SelectItem>
                              <SelectItem value="14:00">2:00 PM</SelectItem>
                              <SelectItem value="15:00">3:00 PM</SelectItem>
                              <SelectItem value="16:00">4:00 PM</SelectItem>
                              <SelectItem value="17:00">5:00 PM</SelectItem>
                              <SelectItem value="18:00">6:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {timeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(i)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concern */}
                <div className="space-y-2">
                  <Label htmlFor="concern">Brief Description of Concern</Label>
                  <Textarea
                    id="concern"
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="Briefly describe your reason for visit..."
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-slate-500 text-right">
                    {concern.length}/300 characters
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Insurance/Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="corporate">Corporate/Employer</SelectItem>
                      <SelectItem value="upi">UPI/Digital Payment</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === "loading" || !isFormValid}
                className="flex-1 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {inquiryType === "appointment" ? (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Request Appointment
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
