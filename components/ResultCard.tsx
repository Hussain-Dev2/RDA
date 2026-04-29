"use client";

import { Music, Video, Loader2, Check } from "lucide-react";
import { useState } from "react";

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
}

interface ResultCardProps {
  info: VideoInfo;
  url: string;
}

export default function ResultCard({ info, url }: ResultCardProps) {
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [loading, setLoading] = useState(false);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const downloadUrl = apiUrl 
      ? `${apiUrl}/api/download?type=${format}&quality=${quality}&url=${encodeURIComponent(url)}`
      : `/api/download?type=${format}&quality=${quality}&url=${encodeURIComponent(url)}`;
    
    if (format === "mp4") {
      window.location.href = downloadUrl;
    } else {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${info.title.substring(0, 20)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="mt-12 w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 text-right">
      <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Preview Area */}
        <div className="relative aspect-video w-full group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={info.thumbnail} alt={info.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-right">
            <h3 className="text-xl font-medium text-white line-clamp-2 mb-2">{info.title}</h3>
            <p className="text-white/50 text-sm font-mono">{formatDuration(info.duration)}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Format Selector */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">اختر التنسيق</p>
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setFormat("mp4")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${format === "mp4" ? "bg-white text-black font-bold shadow-lg" : "text-white/50 hover:text-white"}`}
              >
                <Video className="w-4 h-4" /> فيديو
              </button>
              <button 
                onClick={() => setFormat("mp3")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${format === "mp3" ? "bg-white text-black font-bold shadow-lg" : "text-white/50 hover:text-white"}`}
              >
                <Music className="w-4 h-4" /> صوت
              </button>
            </div>
          </div>

          {/* Quality Selector */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">اختر الجودة</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "high", label: "عالية" },
                { id: "medium", label: "متوسطة" },
                { id: "low", label: "منخفضة" }
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuality(q.id as any)}
                  className={`py-3 rounded-xl border transition-all text-sm ${quality === q.id ? "bg-white/10 border-white/40 text-white font-bold" : "border-white/5 text-white/30 hover:border-white/20"}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white font-bold py-5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.2)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ابدأ التحميل"}
          </button>
        </div>
      </div>
    </div>
  );
}
