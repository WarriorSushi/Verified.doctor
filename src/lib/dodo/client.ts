import DodoPayments from "dodopayments";

// Determine environment
const environment =
  process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "live_mode"
    : "test_mode";

// Initialize Dodo client
export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: environment as "test_mode" | "live_mode",
});

// Product IDs from Dodo Dashboard
export const PRODUCTS = {
  PRO_MONTHLY: process.env.DODO_PRODUCT_PRO_MONTHLY || "",
  PRO_YEARLY: process.env.DODO_PRODUCT_PRO_YEARLY || "",
} as const;

// Check if Dodo is configured
export function isDodoConfigured(): boolean {
  return !!(
    process.env.DODO_PAYMENTS_API_KEY &&
    process.env.DODO_PRODUCT_PRO_MONTHLY &&
    process.env.DODO_PRODUCT_PRO_YEARLY
  );
}
