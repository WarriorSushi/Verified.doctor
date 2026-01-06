import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

const baseUrl = "https://verified.doctor";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Verified.Doctor account to manage your professional profile and connect with patients.",
  alternates: {
    canonical: `${baseUrl}/sign-in`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignInPage() {
  return <SignInForm />;
}
