import type { Metadata } from "next";
import { ContactForm } from "@/components/legal/contact-form";

const baseUrl = "https://verified.doctor";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Verified.Doctor. We're here to help with questions, support, or feedback.",
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
