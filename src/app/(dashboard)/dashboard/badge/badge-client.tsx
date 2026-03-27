"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Code, FileText, Sun, Moon, Eye } from "lucide-react";

interface BadgePageClientProps {
  handle: string;
  fullName: string;
  isVerified: boolean;
}

export function BadgePageClient({ handle, fullName, isVerified }: BadgePageClientProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState<string | null>(null);
  const [badgeKey, setBadgeKey] = useState(0);

  // Force badge refresh on theme change
  useEffect(() => {
    setBadgeKey((k) => k + 1);
  }, [theme]);

  const baseUrl = "https://verified.doctor";
  const badgeUrl = `${baseUrl}/api/badge/${handle}?theme=${theme}`;
  const profileUrl = `${baseUrl}/${handle}`;

  const htmlEmbed = `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="Verified on Verified.Doctor" />\n</a>`;

  const markdownEmbed = `[![Verified on Verified.Doctor](${badgeUrl})](${profileUrl})`;

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification Badge</h1>
        <p className="text-slate-600 mt-1">
          Embed your verification badge on your website, blog, or email signature.
        </p>
      </div>

      {/* Not verified notice */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">⚠️ Not Verified</p>
          <p className="text-sm text-amber-700 mt-1">
            Your profile isn&apos;t verified yet. The badge will show &quot;Not Verified&quot; until your verification is approved.
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Eye className="w-4 h-4" />
            Preview
          </div>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
          >
            {theme === "light" ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                Light
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                Dark
              </>
            )}
          </button>
        </div>
        <div
          className={`flex items-center justify-center p-8 transition-colors ${
            theme === "dark" ? "bg-slate-900" : "bg-white"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={badgeKey}
            src={`/api/badge/${handle}?theme=${theme}`}
            alt="Verification Badge Preview"
            className="max-w-full"
          />
        </div>

        {/* Size variants */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Available sizes</p>
          <div
            className={`flex flex-col gap-3 p-4 rounded-lg transition-colors ${
              theme === "dark" ? "bg-slate-900" : "bg-white border border-slate-100"
            }`}
          >
            {(["small", "medium", "large"] as const).map((size) => (
              <div key={size} className="flex items-center gap-3">
                <span className={`text-xs w-14 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  {size}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${size}-${badgeKey}`}
                  src={`/api/badge/${handle}?theme=${theme}&size=${size}`}
                  alt={`${size} badge`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embed Code: HTML */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Code className="w-4 h-4" />
            HTML Embed
          </div>
          <button
            onClick={() => copyToClipboard(htmlEmbed, "html")}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
          >
            {copied === "html" ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-teal-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-sm text-slate-700 bg-white overflow-x-auto">
          <code>{htmlEmbed}</code>
        </pre>
      </div>

      {/* Embed Code: Markdown */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <FileText className="w-4 h-4" />
            Markdown Embed
          </div>
          <button
            onClick={() => copyToClipboard(markdownEmbed, "md")}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
          >
            {copied === "md" ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-teal-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-sm text-slate-700 bg-white overflow-x-auto">
          <code>{markdownEmbed}</code>
        </pre>
      </div>

      {/* Usage tip */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-sm text-teal-800 font-medium">💡 Tip</p>
        <p className="text-sm text-teal-700 mt-1">
          Add <code className="bg-teal-100 px-1 py-0.5 rounded text-xs">?theme=dark</code> for dark backgrounds or{" "}
          <code className="bg-teal-100 px-1 py-0.5 rounded text-xs">?size=small</code> /{" "}
          <code className="bg-teal-100 px-1 py-0.5 rounded text-xs">?size=large</code> to change the badge size.
        </p>
      </div>
    </div>
  );
}
