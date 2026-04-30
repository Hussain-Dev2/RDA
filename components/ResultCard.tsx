"use client";

import { Music, Video, Loader2, Check, Download } from "lucide-react";
import { useState } from "react";

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
}

interface ResultCardProps {
  info: VideoInfo;
  url: string;
  accentColor?: string;
  siteId: string;
}

export default function ResultCard({ info, url, accentColor = "#3b82f6", siteId }: ResultCardProps) {
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    setLoading(true);
    setDone(false);
    // Use site-specific download API
    const downloadUrl = `/api/${siteId}/download?type=${format}&quality=${quality}&url=${encodeURIComponent(url)}`;

    if (format === "mp4") {
      window.location.href = downloadUrl;
    } else {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${info.title.substring(0, 40).replace(/[^\w\s-]/g, "")}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => { setLoading(false); setDone(true); }, 3000);
    setTimeout(() => setDone(false), 6000);
  };

  const qualityOptions = [
    { id: "high",   label: "عالية",    sub: format === "mp4" ? "1080p+" : "320 kbps" },
    { id: "medium", label: "متوسطة",   sub: format === "mp4" ? "720p"   : "128 kbps" },
    { id: "low",    label: "منخفضة",   sub: format === "mp4" ? "360p"   : "64 kbps"  },
  ];

  return (
    <div className="mt-10 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div
        className="rounded-3xl border overflow-hidden shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: `${accentColor}30`,
          boxShadow: `0 0 60px ${accentColor}15`,
        }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }}
          />
          {/* Duration badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/60 backdrop-blur-sm border border-white/10">
            {formatDuration(info.duration)}
          </div>
          {/* Title */}
          <div className="absolute bottom-5 left-5 right-5 text-right">
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug">{info.title}</h3>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Format toggle */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3 text-right">التنسيق</p>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["mp4", "mp3"] as const).map((f) => (
                <button
                  key={f}
                  id={`format-${f}`}
                  onClick={() => setFormat(f)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: format === f ? accentColor : "transparent",
                    color: format === f ? "#fff" : "rgba(255,255,255,0.3)",
                    boxShadow: format === f ? `0 0 20px ${accentColor}55` : "none",
                  }}
                >
                  {f === "mp4" ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                  {f === "mp4" ? "فيديو" : "صوت"}
                </button>
              ))}
            </div>
          </div>

          {/* Quality selector */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3 text-right">الجودة</p>
            <div className="grid grid-cols-3 gap-2">
              {qualityOptions.map((q) => (
                <button
                  key={q.id}
                  id={`quality-${q.id}`}
                  onClick={() => setQuality(q.id as any)}
                  className="flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200"
                  style={{
                    borderColor: quality === q.id ? `${accentColor}88` : "rgba(255,255,255,0.07)",
                    background: quality === q.id ? `${accentColor}18` : "rgba(255,255,255,0.02)",
                    color: quality === q.id ? "#fff" : "rgba(255,255,255,0.3)",
                  }}
                >
                  <span className="text-sm font-bold">{q.label}</span>
                  <span className="text-[10px] mt-0.5 opacity-60 font-mono">{q.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Download button */}
          <button
            id="download-btn"
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: done
                ? "rgba(74,222,128,0.15)"
                : loading
                ? "rgba(255,255,255,0.06)"
                : accentColor,
              color: done ? "#4ade80" : "#fff",
              boxShadow: done || loading ? "none" : `0 0 40px ${accentColor}44`,
              border: done ? "1px solid rgba(74,222,128,0.3)" : "1px solid transparent",
            }}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ التحضير...</>
            ) : done ? (
              <><Check className="w-5 h-5" /> تم بدء التحميل</>
            ) : (
              <><Download className="w-5 h-5" /> ابدأ التحميل</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
