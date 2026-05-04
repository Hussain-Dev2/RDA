// ── YouTube /api/youtube/download ────────────────────────────────────────────
import { optionsResponse, corsHeaders, getParam } from '../../_lib/platform';
import { NextResponse } from 'next/server';

async function fetchFromCobalt(url: string, type: 'video' | 'audio') {
  const COBALT_API = "https://api.cobalt.tools/api/json";
  
  const response = await fetch(COBALT_API, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
      downloadMode: type === 'audio' ? 'audio' : 'video',
      videoQuality: "720", // Balanced quality for faster response
      filenamePattern: "basic"
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Cobalt Error: ${errorData.text || 'Unknown failure'}`);
  }

  const result = await response.json();
  // Cobalt returns { status: 'stream', url: '...' } or { status: 'redirect', url: '...' }
  if (result.status === 'stream' || result.status === 'redirect') {
    return result.url;
  }
  
  throw new Error("No download link found in Cobalt response.");
}

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url     = getParam(request, 'url');
  const type    = getParam(request, 'type'); // 'mp4' or 'mp3'

  if (!url || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400, headers: corsHeaders });
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'رابط غير صحيح' }, { status: 422, headers: corsHeaders });
  }

  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) cleanUrl = `https://www.youtube.com/watch?v=${v}`;
    }
  } catch (e) {}

  try {
    const cobaltMode = type === 'mp3' ? 'audio' : 'video';
    const streamUrl = await fetchFromCobalt(cleanUrl, cobaltMode);

    // Option 1: Redirect (saves server bandwidth)
    // return NextResponse.redirect(streamUrl);

    // Option 2: Proxy Stream (keeps user on domain, sets filename)
    const res = await fetch(streamUrl);
    const headers = new Headers(res.headers);
    const safeName = type === 'mp3' ? 'audio.mp3' : 'video.mp4';
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`);
    headers.set('Content-Type', type === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    return new Response(res.body, { status: 200, headers });
  } catch (error: any) {
    console.error("Cobalt Fallback Failed:", error);
    return NextResponse.json({ error: 'فشل في معالجة طلب التحميل (Cobalt Fallback Failed)' }, { status: 500, headers: corsHeaders });
  }
}
