import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Verified.Doctor. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link href="/terms" className="hover:text-sky-600">Terms</Link>
          <Link href="/privacy" className="hover:text-sky-600">Privacy</Link>
          <Link href="/contact" className="hover:text-sky-600">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
