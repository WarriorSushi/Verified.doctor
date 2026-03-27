"use client";

import { useState, useEffect } from "react";
import { Video, AlertCircle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VideoEmbedPreviewProps {
  value: string;
  onChange: (value: string) => void;
}

type VideoProvider = "youtube" | "vimeo" | "unknown";

interface VideoInfo {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

function parseVideoUrl(url: string): VideoInfo | null {
  if (!url) return null;

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        provider: "youtube",
        videoId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
      };
    }
  }

  // Vimeo patterns
  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      thumbnailUrl: "", // Vimeo requires API call for thumbnails
    };
  }

  return null;
}

export function VideoEmbedPreview({ value, onChange }: VideoEmbedPreviewProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    if (!value) {
      const timer = setTimeout(() => setVideoInfo(null), 0);
      const timer2 = setTimeout(() => setIsValidUrl(true), 0);
      return;
    }

    const info = parseVideoUrl(value);
    setVideoInfo(info);
    setIsValidUrl(info !== null || !value);
  }, [value]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-slate-700">Video URL</Label>
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className={!isValidUrl ? "border-red-300 focus:ring-red-100" : ""}
        />
        {!isValidUrl && value && (
          <p className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            Please enter a valid YouTube or Vimeo URL
          </p>
        )}
        <p className="text-xs text-slate-500">
          Supports YouTube and Vimeo videos
        </p>
      </div>

      {/* Video Preview */}
      {videoInfo ? (
        <div className="space-y-2">
          <Label className="text-sm text-slate-700">Preview</Label>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <iframe
              src={videoInfo.embedUrl}
              title="Video preview"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              {videoInfo.provider === "youtube" ? "YouTube" : "Vimeo"}
            </span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#0099F7] hover:underline"
            >
              Open in new tab
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        !value && (
          <div className="aspect-video rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Video className="w-8 h-8" />
            <p className="text-sm">Paste a YouTube or Vimeo URL to preview</p>
          </div>
        )
      )}
    </div>
  );
}
