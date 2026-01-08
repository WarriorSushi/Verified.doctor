import { getAuth } from "@/lib/auth";
import { LegalHeader } from "@/components/legal/legal-header";
import { LegalFooter } from "@/components/legal/legal-footer";

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await getAuth();
  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LegalHeader isLoggedIn={isLoggedIn} />
      <main className="flex-1">{children}</main>
      <LegalFooter />
    </div>
  );
}
