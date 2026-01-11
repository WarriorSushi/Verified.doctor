"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Crown,
  Check,
  BarChart3,
  Users,
  Headphones,
  Palette,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Loader2,
  Layout,
  Image as ImageIcon,
  Wand2,
  Calendar,
  CheckCircle2,
  Star,
  Zap,
  TrendingUp,
  Shield,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Get current month name for dynamic sale messaging
const getCurrentMonth = () => {
  return new Date().toLocaleString("default", { month: "long" });
};

const proFeatures = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "See where your visitors come from with referrer tracking, device breakdowns, and unlimited history. Make data-driven decisions about your practice.",
    highlight: "Unlimited history",
  },
  {
    icon: Users,
    title: "Unlimited Connections",
    description: "Build your professional network without limits. Free users are capped at 20 connections — Pro members can connect with every colleague.",
    highlight: "Free: 20 max",
  },
  {
    icon: Layout,
    title: "Premium Templates",
    description: "Stand out with Timeline, Magazine, Grid, and Minimal layouts. Each template is designed to showcase your unique practice style.",
    highlight: "4 exclusive layouts",
  },
  {
    icon: Palette,
    title: "All Color Themes",
    description: "Express your brand with Sage, Warm, Teal, and Executive color themes. Create a profile that truly represents you.",
    highlight: "4 premium themes",
  },
  {
    icon: ImageIcon,
    title: "Rich Profile Sections",
    description: "Add video introductions, clinic gallery photos, detailed case studies, and publications to give patients the full picture.",
    highlight: "Video + Gallery",
  },
  {
    icon: Wand2,
    title: "Unlimited AI Assistance",
    description: "Let AI help you write compelling profile content. Free users get 3 suggestions per month — Pro members get unlimited.",
    highlight: "Free: 3/month",
  },
  {
    icon: MessageSquare,
    title: "Unlimited Messages",
    description: "Never miss a patient inquiry. Free users are limited to 50 messages/month — Pro members receive unlimited patient messages.",
    highlight: "Free: 50/month",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Get faster responses from our support team. Pro members jump to the front of the queue.",
    highlight: "VIP access",
  },
];

const comparisonTable = [
  { feature: "Profile Page", free: true, pro: true },
  { feature: "Verified Badge", free: true, pro: true },
  { feature: "Recommendations", free: "Unlimited", pro: "Unlimited" },
  { feature: "Analytics History", free: "Today only", pro: "Unlimited" },
  { feature: "Connections", free: "20", pro: "Unlimited" },
  { feature: "Messages/Month", free: "50", pro: "Unlimited" },
  { feature: "AI Suggestions/Month", free: "3", pro: "Unlimited" },
  { feature: "Templates", free: "2", pro: "All 6" },
  { feature: "Color Themes", free: "2", pro: "All 6" },
  { feature: "Video Introduction", free: false, pro: true },
  { feature: "Clinic Gallery", free: false, pro: true },
  { feature: "Case Studies", free: false, pro: true },
  { feature: "Publications", free: false, pro: true },
  { feature: "Custom QR Colors", free: false, pro: true },
  { feature: "Referrer Analytics", free: false, pro: true },
  { feature: "Priority Support", free: false, pro: true },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    location: "Mumbai",
    image: "/testimonials/testimonial-1.webp",
    quote: "The premium templates completely transformed my online presence. Patients tell me my profile looks incredibly professional.",
    rating: 5,
  },
  {
    name: "Dr. Arjun Patel",
    specialty: "Orthopedic Surgeon",
    location: "Delhi",
    image: "/testimonials/testimonial-2.webp",
    quote: "Unlimited analytics helped me understand my patient demographics. I now know exactly where my referrals come from.",
    rating: 5,
  },
  {
    name: "Dr. Meera Reddy",
    specialty: "Dermatologist",
    location: "Bangalore",
    image: "/testimonials/testimonial-3.webp",
    quote: "The video introduction feature is a game-changer. Patients feel like they know me before their first visit.",
    rating: 5,
  },
  {
    name: "Dr. Rahul Kumar",
    specialty: "Pediatrician",
    location: "Chennai",
    image: "/testimonials/testimonial-4.webp",
    quote: "Worth every rupee. The AI suggestions saved me hours writing my profile content. Highly recommend Pro!",
    rating: 5,
  },
];

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user just upgraded
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setShowSuccess(true);
      // Remove the query param
      window.history.replaceState({}, "", "/dashboard/upgrade");
    }
  }, [searchParams]);

  // Check subscription status
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/subscription/status");
        if (response.ok) {
          const data = await response.json();
          setIsPro(data.isPro);
        }
      } catch (error) {
        console.error("Failed to check subscription status");
      } finally {
        setIsCheckingStatus(false);
      }
    }
    checkStatus();
  }, []);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      // Redirect to Dodo checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  // Success state after upgrade
  if (showSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Welcome to Pro!
        </h1>
        <p className="text-slate-600 mb-6">
          Your account has been upgraded. Enjoy all the premium features!
        </p>
        <Link href="/dashboard">
          <Button className="bg-gradient-to-r from-[#0099F7] to-[#0080CC]">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Already Pro state
  if (!isCheckingStatus && isPro) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          You&apos;re Already Pro!
        </h1>
        <p className="text-slate-600 mb-6">
          You have access to all premium features. Thank you for your support!
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline">Manage Subscription</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 mb-5 shadow-lg shadow-orange-500/25">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Pro</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
          Join thousands of doctors who&apos;ve elevated their digital presence.
          Get premium templates, unlimited analytics, and features that help you stand out.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
        <div className="flex items-center gap-2 text-slate-600">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">Secure checkout</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">Instant activation</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">Cancel anytime</span>
        </div>
      </div>

      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-5 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNCAwLTQgMi0yIDQtMiA0IDItMiA0LTIgNCAwIDQgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-xl">
              {getCurrentMonth()} Launch Offer
            </span>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-emerald-100 text-sm sm:text-base">
            Lock in early adopter pricing — save 33% with yearly billing. Prices shown in your local currency at checkout.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {/* Monthly Plan */}
        <button
          onClick={() => setSelectedPlan("monthly")}
          disabled={isLoading}
          className={cn(
            "relative p-6 sm:p-8 rounded-2xl border-2 text-left transition-all",
            selectedPlan === "monthly"
              ? "border-[#0099F7] bg-sky-50/50 shadow-lg shadow-sky-500/10"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Monthly</h3>
              <p className="text-sm text-slate-500">Flexible billing</p>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                selectedPlan === "monthly"
                  ? "border-[#0099F7] bg-[#0099F7]"
                  : "border-slate-300"
              )}
            >
              {selectedPlan === "monthly" && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900">$4.99</span>
            <span className="text-slate-500 text-lg">/month</span>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Billed monthly. Cancel anytime.
          </p>
        </button>

        {/* Yearly Plan */}
        <button
          onClick={() => setSelectedPlan("yearly")}
          disabled={isLoading}
          className={cn(
            "relative p-6 sm:p-8 rounded-2xl border-2 text-left transition-all",
            selectedPlan === "yearly"
              ? "border-[#0099F7] bg-sky-50/50 shadow-lg shadow-sky-500/10"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="absolute -top-3 left-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              SAVE 33%
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Yearly</h3>
              <p className="text-sm text-slate-500">Best value</p>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                selectedPlan === "yearly"
                  ? "border-[#0099F7] bg-[#0099F7]"
                  : "border-slate-300"
              )}
            >
              {selectedPlan === "yearly" && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900">$39.99</span>
            <span className="text-slate-500 text-lg">/year</span>
          </div>
          <p className="text-sm text-emerald-600 font-medium mt-3 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Just $3.33/month — billed annually
          </p>
        </button>
      </div>

      {/* Upgrade Button */}
      <div className="mb-16">
        <Button
          onClick={handleUpgrade}
          disabled={isLoading || isCheckingStatus}
          className="w-full py-7 text-lg font-semibold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro Now
            </>
          )}
        </Button>
        <p className="text-center text-sm text-slate-500 mt-4">
          Secure checkout powered by Dodo Payments. Cancel anytime with one click.
        </p>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Loved by Doctors Across India
          </h2>
          <p className="text-slate-600">
            See what our Pro members have to say
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-[#0099F7]">{testimonial.specialty}</p>
                  <p className="text-xs text-slate-500">{testimonial.location}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 w-6 h-6 text-slate-200" />
                <p className="text-slate-600 pl-5 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Everything You Get with Pro
          </h2>
          <p className="text-slate-600">
            Premium features designed to help your practice grow
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {proFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-amber-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                    {feature.highlight && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        {feature.highlight}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-16">
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
          <div className="p-5 font-semibold text-slate-700">Feature</div>
          <div className="p-5 font-semibold text-slate-700 text-center">Free</div>
          <div className="p-5 font-semibold text-center">
            <span className="inline-flex items-center gap-1.5 text-amber-600">
              <Crown className="w-4 h-4" />
              Pro
            </span>
          </div>
        </div>
        {comparisonTable.map((row, i) => (
          <div
            key={row.feature}
            className={cn(
              "grid grid-cols-3",
              i !== comparisonTable.length - 1 && "border-b border-slate-100"
            )}
          >
            <div className="p-4 text-sm text-slate-700">{row.feature}</div>
            <div className="p-4 text-sm text-center text-slate-600">
              {typeof row.free === "boolean" ? (
                row.free ? (
                  <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                ) : (
                  <span className="text-slate-300">—</span>
                )
              ) : (
                <span className="text-slate-500">{row.free}</span>
              )}
            </div>
            <div className="p-4 text-sm text-center">
              {typeof row.pro === "boolean" ? (
                row.pro ? (
                  <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                ) : (
                  <span className="text-slate-300">—</span>
                )
              ) : (
                <span className="text-slate-900 font-semibold">{row.pro}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              q: "Can I cancel anytime?",
              a: "Yes! You can cancel your subscription at any time with one click. You'll continue to have Pro access until your billing period ends.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit/debit cards, UPI (India), and many local payment methods. The checkout will show options available in your country.",
            },
            {
              q: "Is my payment information secure?",
              a: "Absolutely. Payments are processed by Dodo Payments, a PCI-DSS compliant payment provider. We never store your card details.",
            },
            {
              q: "What happens to my profile if I cancel?",
              a: "Your profile stays live! You'll just lose access to Pro-exclusive features like premium templates. You can always upgrade again later.",
            },
            {
              q: "Can I switch from monthly to yearly?",
              a: "Yes! Contact our support team and we'll help you switch plans. You'll get credit for any remaining time on your monthly subscription.",
            },
            {
              q: "Do you offer refunds?",
              a: "We offer a 7-day money-back guarantee. If you're not satisfied with Pro within the first week, contact us for a full refund.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 text-center">
        <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">
          Ready to Go Pro?
        </h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Join thousands of doctors who&apos;ve upgraded their digital presence.
          Start your Pro journey today.
        </p>
        <Button
          onClick={handleUpgrade}
          disabled={isLoading || isCheckingStatus}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-6 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Please wait...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </>
          )}
        </Button>
        <p className="text-slate-500 text-sm mt-4">
          Still have questions?{" "}
          <Link href="/contact" className="text-[#0099F7] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
