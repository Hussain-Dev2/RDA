"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Play, AlertCircle, Copy, Check, Link } from "lucide-react";
import ResultCard, { VideoInfo } from "@/components/ResultCard";

// ── Site definitions ─────────────────────────────────────────────────────────
const SITES = [
  {
    id: "youtube",
    name: "YouTube",
    placeholder: "https://www.youtube.com/watch?v=...",
    color: "#FF0000",
    glow: "rgba(255,0,0,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    name: "TikTok",
    placeholder: "https://www.tiktok.com/@user/video/...",
    color: "#010101",
    glow: "rgba(100,220,220,0.35)",
    textColor: "#69C9D0",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    placeholder: "https://www.instagram.com/reel/...",
    color: "#E1306C",
    glow: "rgba(225,48,108,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    name: "Twitter / X",
    placeholder: "https://x.com/user/status/...",
    color: "#000000",
    glow: "rgba(255,255,255,0.2)",
    textColor: "#ffffff",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    placeholder: "https://www.facebook.com/watch?v=...",
    color: "#1877F2",
    glow: "rgba(24,119,242,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "vimeo",
    name: "Vimeo",
    placeholder: "https://vimeo.com/...",
    color: "#1AB7EA",
    glow: "rgba(26,183,234,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.123C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.612-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.478 4.807z" />
      </svg>
    ),
  },
  {
    id: "twitch",
    name: "Twitch",
    placeholder: "https://www.twitch.tv/videos/...",
    color: "#9146FF",
    glow: "rgba(145,70,255,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    placeholder: "https://www.dailymotion.com/video/...",
    color: "#0066DC",
    glow: "rgba(0,102,220,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 12c0 2.485-2.015 4.5-4.5 4.5S7.5 14.485 7.5 12 9.515 7.5 12 7.5s4.5 2.015 4.5 4.5zm-4.5-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    ),
  },
  {
    id: "reddit",
    name: "Reddit",
    placeholder: "https://www.reddit.com/r/.../comments/.../...",
    color: "#FF4500",
    glow: "rgba(255,69,0,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    placeholder: "https://soundcloud.com/artist/track",
    color: "#FF5500",
    glow: "rgba(255,85,0,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M1.175 12.225c-.015 0-.024.006-.034.006L.398 16.5l.743 4.213c.01.003.02.006.034.006.19 0 .348-.143.382-.33l.86-3.89-.86-4.007a.394.394 0 0 0-.382-.267zm1.61-.57c-.23 0-.415.18-.428.407L2 16.5l.357 4.084c.014.228.198.408.428.408.23 0 .414-.18.428-.408L3.6 16.5l-.387-4.438a.43.43 0 0 0-.428-.407zm1.662-.06c-.27 0-.49.218-.49.489L3.6 16.5l.357 4.635c0 .27.22.49.49.49s.49-.22.49-.49L5.293 16.5l-.356-4.816a.491.491 0 0 0-.49-.489zM6.07 9.98c-.31 0-.56.247-.562.556L5.15 16.5l.358 5.064c.002.308.252.557.562.557.31 0 .56-.249.562-.557L7 16.5l-.367-6.52a.562.562 0 0 0-.563-.556v.556zm1.703-1.82c-.35 0-.634.282-.634.632L6.78 16.5l.36 5.494a.634.634 0 0 0 1.268 0L8.768 16.5l-.36-8.14a.634.634 0 0 0-.635-.6zm1.74-.477c-.39 0-.706.314-.706.704L8.45 16.5l.357 5.924a.706.706 0 0 0 1.413 0L10.578 16.5l-.357-9.113a.706.706 0 0 0-.707-.704zm15.87 4.432A5.636 5.636 0 0 0 19.75 6.47a5.637 5.637 0 0 0-2.17.432C17.2 4.193 14.975 2.25 12.3 2.25c-.796 0-1.556.177-2.235.492a.777.777 0 0 0-.484.714l-.01 12.99.001.048v.006c.053 3.097 2.55 5.598 5.655 5.598 3.12 0 5.65-2.53 5.65-5.65 0-.197-.022-.392-.055-.585.3.07.612.107.933.107a3.773 3.773 0 0 0 3.774-3.773 3.773 3.773 0 0 0-3.774-3.773.69.69 0 0 0-.014.001z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [activeSite, setActiveSite] = useState(SITES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Select site: clear old results and focus input
  const handleSiteSelect = (site: typeof SITES[0]) => {
    setActiveSite(site);
    setUrl("");
    setVideoInfo(null);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // Copy URL from input
  const handleCopy = () => {
    if (!url.trim()) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Fetch video info
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      // Allow pointing to a remote backend (e.g. Render) via environment variable
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const fetchUrl = `${apiBase}/api/${activeSite.id}/info?url=${encodeURIComponent(trimmed)}`;
      
      console.log("Attempting fetch to:", fetchUrl);

      const res = await fetch(fetchUrl);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ غير متوقع.");
      }

      setVideoInfo(data);
      setCurrentUrl(trimmed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !mounted || loading || !url.trim();

  return (
    <main
      className="min-h-screen text-white selection:bg-white/20"
      style={{ fontFamily: "'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif" }}
    >
      {/* Ambient glow background that reacts to active site */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${activeSite.glow || "rgba(255,0,0,0.2)"} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">

        {/* Header */}
        <div className="flex flex-col items-center mb-12 gap-4">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500"
              style={{ background: activeSite.color, boxShadow: `0 0 40px ${activeSite.glow}` }}
            >
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">واحد عراق</h1>
          <p className="text-white/40 text-sm">حمّل من أشهر المنصات بضغطة واحدة</p>
        </div>

        {/* ── Site Selector Grid ─────────────────────────────────────────────── */}
        <div className="w-full mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25 text-center mb-4">اختر المنصة</p>
          <div className="grid grid-cols-5 gap-3">
            {SITES.map((site) => {
              const isActive = activeSite.id === site.id;
              return (
                <button
                  key={site.id}
                  id={`site-btn-${site.id}`}
                  onClick={() => handleSiteSelect(site)}
                  title={site.name}
                  className="relative flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 group overflow-hidden"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${site.color}33, ${site.color}11)`
                      : "rgba(255,255,255,0.03)",
                    borderColor: isActive ? `${site.color}88` : "rgba(255,255,255,0.07)",
                    boxShadow: isActive ? `0 0 20px ${site.glow || site.color + "44"}` : "none",
                    color: isActive ? (site.textColor || site.color) : "rgba(255,255,255,0.4)",
                  }}
                >
                  {/* Hover shimmer */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${site.color}15, transparent 70%)` }}
                  />
                  <span
                    className="relative transition-all duration-300"
                    style={{ color: isActive ? (site.textColor || site.color) : "rgba(255,255,255,0.45)" }}
                  >
                    {site.icon}
                  </span>
                  <span className="relative text-[10px] font-semibold leading-none tracking-wide text-center">
                    {site.name.split(" / ")[0]}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span
                      className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                      style={{ background: site.textColor || site.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── URL Input ─────────────────────────────────────────────────────── */}
        <div className="w-full mb-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            {/* Input row */}
            <div
              className="relative flex items-center rounded-2xl border transition-all duration-300 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: url ? `${activeSite.color}55` : "rgba(255,255,255,0.08)",
                boxShadow: url ? `0 0 0 1px ${activeSite.color}33` : "none",
              }}
            >
              {/* Site color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                style={{ background: activeSite.color }}
              />

              {/* Site icon inside input */}
              <span
                className="pl-5 pr-3 flex-shrink-0 transition-all duration-300"
                style={{ color: activeSite.textColor || activeSite.color, opacity: 0.8 }}
              >
                {activeSite.icon}
              </span>

              <input
                ref={inputRef}
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); setVideoInfo(null); }}
                placeholder={activeSite.placeholder}
                dir="ltr"
                className="flex-1 bg-transparent py-5 pr-3 text-sm text-white placeholder:text-white/25 focus:outline-none min-w-0"
              />

              {/* Copy button */}
              <button
                type="button"
                id="copy-url-btn"
                onClick={handleCopy}
                disabled={!url.trim()}
                title="نسخ الرابط"
                className="flex-shrink-0 p-3 mr-1 rounded-xl transition-all duration-200 disabled:opacity-20"
                style={{ color: copied ? "#4ade80" : "rgba(255,255,255,0.4)" }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-white/10 flex-shrink-0" />

              {/* Fetch button */}
              <button
                id="fetch-btn"
                type="submit"
                disabled={isButtonDisabled}
                className="flex-shrink-0 mr-2 ml-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: isButtonDisabled ? "rgba(255,255,255,0.06)" : activeSite.color,
                  color: "#fff",
                  boxShadow: isButtonDisabled ? "none" : `0 0 20px ${activeSite.glow}`,
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "جلب"}
              </button>
            </div>
          </form>

          {/* Active site hint */}
          <div className="flex items-center gap-2 mt-3 px-1">
            <span style={{ color: activeSite.textColor || activeSite.color }} className="opacity-70">
              {activeSite.icon && <span className="inline-block scale-75">{activeSite.icon}</span>}
            </span>
            <p className="text-xs text-white/30">
              الصق رابط {activeSite.name} في الحقل أعلاه
            </p>
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <div className="w-full mt-2 flex items-start gap-3 text-red-400 bg-red-500/8 border border-red-500/15 px-5 py-4 rounded-2xl">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">فشل الجلب</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Result ────────────────────────────────────────────────────────── */}
        {videoInfo && !loading && (
          <ResultCard 
            info={videoInfo} 
            url={currentUrl} 
            accentColor={activeSite.color} 
            siteId={activeSite.id}
          />
        )}

      </div>
    </main>
  );
}
