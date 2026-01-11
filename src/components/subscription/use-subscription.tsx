"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SubscriptionStatus {
  isPro: boolean;
  status: "free" | "pro" | "cancelled";
  plan: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  usage: {
    aiSuggestions: number;
    messages: number;
  };
  limits: {
    connections: number;
    messages_per_month: number;
    ai_suggestions_per_month: number;
    analytics_days: number;
  } | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  checkout: (plan: "monthly" | "yearly") => Promise<void>;
  cancel: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        setError(null);
      } else {
        setError("Failed to fetch subscription status");
      }
    } catch (err) {
      setError("Failed to fetch subscription status");
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async (plan: "monthly" | "yearly") => {
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout");
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Dodo checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      throw err;
    }
  };

  const cancel = async () => {
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }

      // Refresh subscription status
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
      throw err;
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isLoading, error, refresh, checkout, cancel }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}
