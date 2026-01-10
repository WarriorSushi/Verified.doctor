"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Loader2, Mail, MessageSquare, HelpCircle } from "lucide-react";

export function ContactFormContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <Send className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h1>
        <p className="text-slate-600 mb-8">
          Thank you for reaching out. We&apos;ve received your message and will get back to you within 24-48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Contact Us</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Have a question, feedback, or need assistance? We&apos;re here to help. Fill out the form below and our team will get back to you.
        </p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-8">
        {/* Contact Options - Shows after form on mobile */}
        <div className="order-2 md:order-1 md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">General Inquiries</h3>
            <p className="text-sm text-slate-600">
              Questions about the platform, features, or getting started.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Support</h3>
            <p className="text-sm text-slate-600">
              Technical issues, account problems, or verification help.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Feedback</h3>
            <p className="text-sm text-slate-600">
              Share your suggestions to help us improve the platform.
            </p>
          </div>
        </div>

        {/* Contact Form - Shows first on mobile */}
        <div className="order-1 md:order-2 md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Dr. John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Inquiry Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="verification">Verification Help</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What is your inquiry about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your inquiry in detail..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">{formData.message.length}/2000 characters</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-600 hover:bg-sky-700 py-6 text-base"
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

              <p className="text-xs text-slate-500 text-center">
                By submitting this form, you agree to our{" "}
                <Link href="/privacy" className="text-sky-600 hover:underline">
                  Privacy Policy
                </Link>
                . We typically respond within 24-48 hours.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Keep old export for backwards compatibility if needed elsewhere
export const ContactForm = ContactFormContent;
