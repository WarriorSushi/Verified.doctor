"use client";

import { useState } from "react";
import Link from "next/link";
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
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Get current month name for dynamic sale messaging
const getCurrentMonth = () => {
  return new Date().toLocaleString("default", { month: "long" });
};

const proFeatures = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Monthly, yearly, and custom date range analytics",
  },
  {
    icon: Users,
    title: "Unlimited Connections",
    description: "Connect with unlimited doctors in your network",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Get help faster with dedicated support",
  },
  {
    icon: Palette,
    title: "Custom QR Codes",
    description: "Personalize your QR code with custom colors",
  },
  {
    icon: MessageSquare,
    title: "Message Templates",
    description: "Save time with pre-written response templates",
  },
  {
    icon: TrendingUp,
    title: "Profile Insights",
    description: "Detailed breakdown of who's viewing your profile",
  },
];

type Region = "IN" | "US";

const pricing = {
  IN: {
    currency: "₹",
    monthly: 199,
    yearly: 1999,
    yearlySavings: "17%",
    locale: "en-IN",
  },
  US: {
    currency: "$",
    monthly: 4.99,
    yearly: 39.99,
    yearlySavings: "33%",
    locale: "en-US",
  },
};

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [region, setRegion] = useState<Region>("IN");

  const currentPricing = pricing[region];
  const monthlyEquivalent = region === "IN"
    ? Math.round(currentPricing.yearly / 12)
    : (currentPricing.yearly / 12).toFixed(2);

  const handleUpgrade = () => {
    // TODO: Integrate with payment provider (Dodo Payments / RevenueCat)
    alert("Payment integration coming soon! Thank you for your interest in Pro.");
  };

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
          83% of our users upgraded to Pro within 5 days. Our service works
          perfectly free, but Pro is for power users who want maximum value.
        </p>
      </div>

      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-lg">
            Super {getCurrentMonth()} Sale - 60% OFF!
          </span>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <p className="text-emerald-100 text-sm">
          Limited time offer. Lock in this price forever.
        </p>
      </div>

      {/* Region Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setRegion("IN")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              region === "IN"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span className="text-base">🇮🇳</span>
            India
          </button>
          <button
            onClick={() => setRegion("US")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              region === "US"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Globe className="w-4 h-4" />
            International
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Monthly Plan */}
        <button
          onClick={() => setSelectedPlan("monthly")}
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
            <span className="text-3xl font-bold text-slate-900">
              {currentPricing.currency}{currentPricing.monthly}
            </span>
            <span className="text-slate-500">/month</span>
          </div>
        </button>

        {/* Yearly Plan */}
        <button
          onClick={() => setSelectedPlan("yearly")}
          className={cn(
            "relative p-6 rounded-xl border-2 text-left transition-all",
            selectedPlan === "yearly"
              ? "border-[#0099F7] bg-sky-50/50"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="absolute -top-3 left-4">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SAVE {currentPricing.yearlySavings}
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
            <span className="text-3xl font-bold text-slate-900">
              {currentPricing.currency}{currentPricing.yearly}
            </span>
            <span className="text-slate-500">/year</span>
          </div>
          <p className="text-sm text-emerald-600 mt-2">
            Only {currentPricing.currency}{monthlyEquivalent}/month
          </p>
        </button>
      </div>

      {/* Upgrade Button */}
      <div className="mb-10">
        <Button
          onClick={handleUpgrade}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8]"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade to Pro - {currentPricing.currency}
          {selectedPlan === "monthly" ? currentPricing.monthly : currentPricing.yearly}
          {selectedPlan === "monthly" ? "/mo" : "/yr"}
        </Button>
        <p className="text-center text-xs text-slate-500 mt-3">
          Cancel anytime. No questions asked.
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
        {[
          { feature: "Profile Page", free: true, pro: true },
          { feature: "Basic Analytics", free: "7 days", pro: "Unlimited" },
          { feature: "Connections", free: "10", pro: "Unlimited" },
          { feature: "QR Code", free: true, pro: "Custom colors" },
          { feature: "Support", free: "Email", pro: "Priority" },
          { feature: "Message Templates", free: false, pro: true },
          { feature: "Profile Insights", free: false, pro: true },
        ].map((row, i) => (
          <div
            key={row.feature}
            className={cn(
              "grid grid-cols-3",
              i !== 6 && "border-b border-slate-100"
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
              a: "We accept all major credit/debit cards, UPI, and net banking for Indian users.",
            },
            {
              q: "Is my payment information secure?",
              a: "Absolutely. We use industry-standard encryption and never store your card details on our servers.",
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
