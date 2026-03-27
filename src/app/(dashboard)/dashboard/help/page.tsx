"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  Users,
  QrCode,
  Share2,
  Shield,
  Star,
  Zap,
  Globe,
  Smartphone,
  Mail,
  Clock,
  ArrowRight,
  Play,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTour } from "@/components/tour";
import { cn } from "@/lib/utils";

// Getting Started Checklist
const checklistItems = [
  {
    key: "profile_photo",
    label: "Upload a profile photo",
    description: "A professional photo builds trust with patients",
    href: "/dashboard/profile-builder?tab=basics",
    icon: "📸",
  },
  {
    key: "complete_bio",
    label: "Write your bio",
    description: "Tell patients about yourself and your practice",
    href: "/dashboard/profile-builder?tab=basics",
    icon: "✍️",
  },
  {
    key: "add_specialty",
    label: "Set your specialty",
    description: "Helps patients find you for their specific needs",
    href: "/dashboard/profile-builder?tab=basics",
    icon: "🩺",
  },
  {
    key: "get_verified",
    label: "Get verified",
    description: "Upload your medical registration for the verified badge",
    href: "/dashboard/profile-builder?tab=settings",
    icon: "✅",
  },
  {
    key: "share_profile",
    label: "Share your profile",
    description: "Share your verified.doctor link with patients",
    href: "/dashboard",
    icon: "🔗",
  },
  {
    key: "invite_colleague",
    label: "Invite a colleague",
    description: "Grow your network by inviting fellow doctors",
    href: "/dashboard/connections",
    icon: "👥",
  },
];

// Getting Started Steps
const gettingStartedSteps = [
  {
    step: 1,
    title: "Complete Your Profile",
    description: "Add your qualifications, clinic details, and a professional photo. A complete profile builds trust with patients.",
    icon: BookOpen,
  },
  {
    step: 2,
    title: "Get Verified",
    description: "Upload your medical registration certificate to receive the verified badge. This distinguishes you as a legitimate healthcare provider.",
    icon: Shield,
  },
  {
    step: 3,
    title: "Share Your QR Code",
    description: "Download your unique QR code and display it in your clinic. Patients can scan to save your contact and view your profile.",
    icon: QrCode,
  },
  {
    step: 4,
    title: "Grow Your Network",
    description: "Invite colleagues to join and build your professional network. More connections mean more credibility.",
    icon: Users,
  },
];

// Feature Guides
const featureGuides = [
  {
    title: "Profile Builder",
    description: "Create a comprehensive profile showcasing your expertise",
    details: [
      "Add your education timeline and qualifications",
      "List hospital affiliations and clinic details",
      "Showcase conditions you treat and procedures you perform",
      "Use AI to enhance your bio and descriptions",
      "Upload clinic photos to give patients a preview",
    ],
    icon: BookOpen,
  },
  {
    title: "Patient Recommendations",
    description: "Build your reputation through positive patient feedback",
    details: [
      "Patients can recommend you with a single tap",
      "No negative reviews - only positive recommendations",
      "Recommendations display in tiers (10+, 50+, 100+)",
      "Higher recommendations boost your credibility",
      "Share your profile link to collect more recommendations",
    ],
    icon: Star,
  },
  {
    title: "Doctor Connections",
    description: "Network with fellow medical professionals",
    details: [
      "Connect with colleagues to expand your network",
      "Send invite links via email or messaging apps",
      "Auto-connect when colleagues sign up using your invite",
      "Showcase your connections on your public profile",
      "Build referral relationships with specialists",
    ],
    icon: Users,
  },
  {
    title: "Patient Messaging",
    description: "Communicate securely with patients",
    details: [
      "Receive inquiries directly from your profile page",
      "Reply to patients via SMS without sharing your number",
      "Manage all messages from your dashboard",
      "Use templates for common responses",
      "Never miss a patient inquiry",
    ],
    icon: MessageSquare,
  },
  {
    title: "QR Code System",
    description: "Bridge offline and online presence",
    details: [
      "Get a unique QR code for your profile",
      "Print and display in your clinic reception",
      "Patients scan to save your contact instantly",
      "Track profile views from QR code scans",
      "Order premium QR stands (coming soon)",
    ],
    icon: QrCode,
  },
  {
    title: "AI-Powered Tools",
    description: "Let AI help you create compelling content",
    details: [
      "Enhance your bio with AI suggestions",
      "Get specialty-specific condition suggestions",
      "AI-powered procedure recommendations",
      "Choose response length (short, medium, long)",
      "Save time while maintaining quality",
    ],
    icon: Zap,
  },
];

// Use Cases
const useCases = [
  {
    title: "New Practice Launch",
    description: "Just started your practice? Create a professional online presence instantly. Share your verified.doctor link on social media, business cards, and clinic materials.",
    icon: Globe,
  },
  {
    title: "Patient Follow-ups",
    description: "Give patients a way to reach you between visits. They can send inquiries through your profile, and you respond via SMS without sharing personal contact details.",
    icon: MessageSquare,
  },
  {
    title: "Building Referrals",
    description: "Connect with other doctors to build a referral network. When you invite colleagues, you both benefit from increased visibility and connection counts.",
    icon: Share2,
  },
  {
    title: "Clinic Waiting Room",
    description: "Display your QR code in the waiting room. Patients can scan to save your contact, view your credentials, and leave recommendations after their visit.",
    icon: Smartphone,
  },
];

// FAQs
const faqs = [
  {
    question: "How do I get verified?",
    answer: "Go to Dashboard > Settings > Verification. Upload a clear photo of your medical registration certificate (MCI/State Medical Council). Our team reviews submissions within 24-48 hours. Once approved, the verified badge appears on your profile.",
  },
  {
    question: "Can patients leave negative reviews?",
    answer: "No. We believe in a positive-only reputation system. Patients can only recommend doctors, not leave negative reviews. This protects you from unfair criticism while still allowing satisfied patients to vouch for your care.",
  },
  {
    question: "How do patient messages work?",
    answer: "When a patient sends you a message through your profile, you receive it in your dashboard. You can reply directly, and the patient receives your response via SMS. Your personal phone number is never revealed to patients.",
  },
  {
    question: "What happens when I invite a colleague?",
    answer: "You get a unique invite link. When your colleague signs up using that link, you're automatically connected. Both of your connection counts increase, boosting your network visibility.",
  },
  {
    question: "How do I share my profile?",
    answer: "Your profile is available at verified.doctor/[your-handle]. Share this link on social media, WhatsApp, email signatures, or business cards. You can also download your QR code from the dashboard.",
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes. We never share your personal contact details with patients. Messages are relayed through our secure system. Verification documents are stored securely and deleted after review.",
  },
  {
    question: "Can I customize my profile appearance?",
    answer: "Yes! Choose from multiple profile layouts and color themes. Go to Dashboard > Profile Builder > Look to change your layout and theme.",
  },
  {
    question: "What's included in the free plan?",
    answer: "Everything! Profile creation, verification, QR code, patient messaging, connections, and recommendations are all free. We believe every doctor deserves a professional online presence.",
  },
];

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"guides" | "support">("guides");
  const [completedChecklist, setCompletedChecklist] = useState<Set<string>>(new Set());
  const { startTour } = useTour();

  // Load completed items from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vd_help_checklist");
      if (saved) {
        setCompletedChecklist(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleChecklistItem = (key: string) => {
    setCompletedChecklist(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem("vd_help_checklist", JSON.stringify([...next]));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Support form state
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supportForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      setSupportForm({ subject: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checklistProgress = (completedChecklist.size / checklistItems.length) * 100;

  return (
    <div className="space-y-5 sm:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#0099F7]" />
            Help & Support
          </h1>
          <p className="text-sm text-slate-600">
            Everything you need to get the most out of Verified.Doctor
          </p>
        </div>
        <Button
          onClick={startTour}
          variant="outline"
          size="sm"
          className="w-fit text-[#0099F7] border-[#0099F7]/30 hover:bg-sky-50"
        >
          <Play className="w-3.5 h-3.5 mr-1.5 fill-[#0099F7]" />
          Replay Feature Tour
        </Button>
      </div>

      {/* Getting Started Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Getting Started</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {completedChecklist.size}/{checklistItems.length} done
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#0099F7] to-[#0080CC] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${checklistProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-1">
          {checklistItems.map((item) => {
            const isCompleted = completedChecklist.has(item.key);
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                  isCompleted ? "bg-emerald-50/50" : "hover:bg-slate-50"
                )}
              >
                <button
                  onClick={() => toggleChecklistItem(item.key)}
                  className="flex-shrink-0"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-[#0099F7] transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-slate-400 line-through" : "text-slate-900"
                  )}>
                    {item.icon} {item.label}
                  </p>
                  <p className="text-xs text-slate-500 hidden sm:block">{item.description}</p>
                </div>
                {!isCompleted && (
                  <a
                    href={item.href}
                    className="text-xs text-[#0099F7] hover:underline flex-shrink-0 flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Go</span>
                    <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("guides")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "guides"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4 inline-block mr-2" />
          Guides & FAQs
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "support"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail className="w-4 h-4 inline-block mr-2" />
          Contact Support
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "guides" ? (
          <motion.div
            key="guides"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* How It Works */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  How It Works
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gettingStartedSteps.map((item) => (
                  <div
                    key={item.step}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Feature Guides */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Feature Guides
                </h2>
              </div>
              <div className="space-y-2">
                {featureGuides.map((guide, index) => (
                  <div
                    key={guide.title}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedGuide(expandedGuide === index ? null : index)
                      }
                      className="w-full px-4 py-3 sm:py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <guide.icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {guide.description}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                          expandedGuide === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedGuide === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <ul className="space-y-2 ml-12">
                              {guide.details.map((detail, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-xs sm:text-sm text-slate-600"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 text-[#0099F7] flex-shrink-0 mt-0.5" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

            {/* Use Cases */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-teal-500" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Use Cases
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {useCases.map((useCase) => (
                  <div
                    key={useCase.title}
                    className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-4"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-sky-100 flex items-center justify-center mb-3">
                      <useCase.icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                      {useCase.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-sky-500" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === index ? null : index)
                      }
                      className="w-full px-4 py-3 sm:py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 text-sm">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                          expandedFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

            {/* Still Need Help CTA */}
            <div className="bg-gradient-to-br from-[#0099F7]/10 to-[#A4FDFF]/10 rounded-xl border border-[#0099F7]/20 p-5 text-center">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Our support team is here to help you succeed.
              </p>
              <Button
                onClick={() => setActiveTab("support")}
                className="bg-[#0099F7] hover:bg-[#0080CC] text-white"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="support"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Support Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Response Time
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  We typically respond within 24-48 hours on business days.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center mb-3">
                  <Mail className="w-4 h-4 text-sky-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Email Support
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  You can also email us directly at support@verified.doctor
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Send us a message
              </h2>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={supportForm.subject}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, subject: e.target.value })
                      }
                      placeholder="What can we help you with?"
                      className="h-10"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Message</Label>
                    <Textarea
                      id="message"
                      value={supportForm.message}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, message: e.target.value })
                      }
                      placeholder="Describe your issue or question in detail..."
                      className="min-h-[120px] resize-none"
                      maxLength={2000}
                    />
                    <p className="text-xs text-slate-400 text-right">
                      {supportForm.message.length}/2000
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#0099F7] hover:bg-[#0080CC] text-white"
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Back to Guides */}
            <button
              onClick={() => setActiveTab("guides")}
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Guides & FAQs
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
