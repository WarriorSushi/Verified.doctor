"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Crown,
  Check,
  BarChart3,
  Users,
  Headphones,
  Palette,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Loader2,
  Layout,
  Image as ImageIcon,
  Wand2,
  Calendar,
  CheckCircle2,
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
    description: "Unlimited history, referrer tracking, custom date ranges",
  },
  {
    icon: Users,
    title: "Unlimited Connections",
    description: "Connect with unlimited doctors (Free: 20 max)",
  },
  {
    icon: Layout,
    title: "Premium Templates",
    description: "Access Timeline, Magazine, Grid, Minimal layouts",
  },
  {
    icon: Palette,
    title: "All Color Themes",
    description: "Sage, Warm, Teal, Executive themes unlocked",
  },
  {
    icon: ImageIcon,
    title: "Rich Profile Sections",
    description: "Video intro, clinic gallery, case studies, publications",
  },
  {
    icon: Wand2,
    title: "Unlimited AI",
    description: "Unlimited AI profile suggestions (Free: 3/month)",
  },
  {
    icon: MessageSquare,
    title: "Unlimited Messages",
    description: "Receive unlimited patient inquiries (Free: 50/month)",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Get help faster with dedicated support",
  },
];

const comparisonTable = [
  { feature: "Profile Page", free: true, pro: true },
  { feature: "Verified Badge", free: true, pro: true },
  { feature: "Recommendations", free: "Unlimited", pro: "Unlimited" },
  { feature: "Analytics History", free: "7 days", pro: "Unlimited" },
  { feature: "Connections", free: "20", pro: "Unlimited" },
  { feature: "Messages/Month", free: "50", pro: "Unlimited" },
  { feature: "AI Suggestions/Month", free: "3", pro: "Unlimited" },
  { feature: "Templates", free: "2", pro: "All 6" },
  { feature: "Color Themes", free: "2", pro: "All 6" },
  { feature: "Video Introduction", free: false, pro: true },
  { feature: "Clinic Gallery", free: false, pro: true },
  { feature: "Case Studies", free: false, pro: true },
  { feature: "Custom QR Colors", free: false, pro: true },
  { feature: "Referrer Analytics", free: false, pro: true },
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
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Upgrade to Pro
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
          Unlock premium templates, unlimited connections, advanced analytics, and more.
          Join thousands of doctors who&apos;ve upgraded their digital presence.
        </p>
      </div>

      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-lg">
            {getCurrentMonth()} Launch Offer
          </span>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <p className="text-emerald-100 text-sm">
          Lock in early adopter pricing. Prices shown in your local currency at checkout.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Monthly Plan */}
        <button
          onClick={() => setSelectedPlan("monthly")}
          disabled={isLoading}
          className={cn(
            "relative p-6 rounded-xl border-2 text-left transition-all",
            selectedPlan === "monthly"
              ? "border-[#0099F7] bg-sky-50/50"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Monthly</h3>
              <p className="text-sm text-slate-500">Flexible billing</p>
            </div>
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                selectedPlan === "monthly"
                  ? "border-[#0099F7] bg-[#0099F7]"
                  : "border-slate-300"
              )}
            >
              {selectedPlan === "monthly" && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">$4.99</span>
            <span className="text-slate-500">/month</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Billed monthly. Cancel anytime.
          </p>
        </button>

        {/* Yearly Plan */}
        <button
          onClick={() => setSelectedPlan("yearly")}
          disabled={isLoading}
          className={cn(
            "relative p-6 rounded-xl border-2 text-left transition-all",
            selectedPlan === "yearly"
              ? "border-[#0099F7] bg-sky-50/50"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="absolute -top-3 left-4">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SAVE 33%
            </span>
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Yearly</h3>
              <p className="text-sm text-slate-500">Best value</p>
            </div>
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                selectedPlan === "yearly"
                  ? "border-[#0099F7] bg-[#0099F7]"
                  : "border-slate-300"
              )}
            >
              {selectedPlan === "yearly" && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">$39.99</span>
            <span className="text-slate-500">/year</span>
          </div>
          <p className="text-sm text-emerald-600 mt-2">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            Just $3.33/month — billed annually
          </p>
        </button>
      </div>

      {/* Upgrade Button */}
      <div className="mb-10">
        <Button
          onClick={handleUpgrade}
          disabled={isLoading || isCheckingStatus}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </>
          )}
        </Button>
        <p className="text-center text-xs text-slate-500 mt-3">
          Secure checkout powered by Dodo Payments. Cancel anytime.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          Everything you get with Pro
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {proFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
          <div className="p-4 font-medium text-slate-700">Feature</div>
          <div className="p-4 font-medium text-slate-700 text-center">Free</div>
          <div className="p-4 font-medium text-center">
            <span className="inline-flex items-center gap-1 text-amber-600">
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
                  <span className="text-slate-400">—</span>
                )
              ) : (
                row.free
              )}
            </div>
            <div className="p-4 text-sm text-center text-slate-900 font-medium">
              {typeof row.pro === "boolean" ? (
                row.pro ? (
                  <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                ) : (
                  <span className="text-slate-400">—</span>
                )
              ) : (
                row.pro
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "Can I cancel anytime?",
              a: "Yes! You can cancel your subscription at any time. You'll continue to have Pro access until your billing period ends.",
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
              a: "Your profile stays live! You'll just lose access to Pro features. You can always upgrade again later.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <h3 className="font-medium text-slate-900 mb-1">{faq.q}</h3>
              <p className="text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pb-8">
        <p className="text-slate-600 mb-4">
          Still have questions?{" "}
          <Link href="/dashboard/help" className="text-[#0099F7] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
