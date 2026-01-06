import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

const baseUrl = "https://verified.doctor";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Verified.Doctor account and claim your unique URL. Join 600+ verified medical professionals.",
  alternates: {
    canonical: `${baseUrl}/sign-up`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
