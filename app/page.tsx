"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Play, AlertCircle } from "lucide-react";
import ResultCard, { VideoInfo } from "@/components/ResultCard";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "الرابط غير صحيح أو الموقع غير مدعوم.");

      setVideoInfo(data);
      setCurrentUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !mounted || loading || !url.trim();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      <div className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col items-center">
        
        {/* Minimal Logo/Header */}
        <div className="flex flex-col items-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
            <Play className="w-6 h-6 text-black fill-current transform rotate-180" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">واحد عراق</h1>
        </div>

        {/* Simplified Input Section */}
        <div className="w-full max-w-2xl text-right">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ضع الرابط هنا..."
              className="w-full bg-[#111] border border-white/10 rounded-2xl pr-6 pl-32 py-6 text-lg focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 text-right"
            />
            <button
              type="submit"
              disabled={isButtonDisabled}
              className="absolute left-3 top-3 bottom-3 px-8 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "جلب"}
            </button>
          </form>

          {/* Subtext */}
          <p className="mt-4 text-center text-white/20 text-sm">
            يدعم يوتيوب، تويتر، تيك توك، وأكثر من 1000 موقع آخر.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-8 flex items-center gap-3 text-red-400 bg-red-400/5 border border-red-400/10 px-6 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Result Area */}
        {videoInfo && !loading && (
          <ResultCard info={videoInfo} url={currentUrl} />
        )}

      </div>
    </main>
  );
}
