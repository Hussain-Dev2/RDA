// ── YouTube /api/youtube/download ────────────────────────────────────────────
import { optionsResponse, corsHeaders, getParam } from '../../_lib/platform';
import { NextResponse } from 'next/server';

const COBALT_INSTANCES = [
  "https://api.cobalt.tools/",
  "https://cobalt.hot-as-hell.club/api/json"
];

async function fetchFromCobalt(url: string, type: 'video' | 'audio') {
  let lastError = null;

  for (const api of COBALT_INSTANCES) {
    try {
      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          url: url,
          videoQuality: "720", 
          downloadMode: type === 'audio' ? 'audio' : 'video',
          youtubeVideoCodec: "h264",
          httpProxy: ""
        }),
        // @ts-ignore
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Cobalt Instance Error: ${api}]`, errorData);
        lastError = new Error(`Cobalt Error (${api}): ${errorData.text || errorData.message || 'Unknown failure'}`);
        continue;
      }

      const result = await response.json();
      if (result.status === 'stream' || result.status === 'redirect' || result.url) {
        return result.url;
      }
      
      lastError = new Error(`No download link found from ${api}. Status: ${result.status}`);
    } catch (e: any) {
      console.error(`Failed to fetch from ${api}:`, e.message);
      lastError = e;
      continue;
    }
  }
  
  throw lastError || new Error("All Cobalt instances are unreachable.");
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

    // Option 2: Proxy Stream (keeps user on domain, sets filename)
    const res = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch stream from Cobalt: ${res.status} ${res.statusText}`);
    }

    const headers = new Headers(res.headers);
    const safeName = type === 'mp3' ? 'audio.mp3' : 'video.mp4';
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`);
    headers.set('Content-Type', type === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    return new Response(res.body, { status: 200, headers });
  } catch (error: any) {
    console.error("Cobalt Fallback Failed:", error);
    return NextResponse.json({ 
      error: 'فشل في معالجة طلب التحميل',
      details: error.message || 'Unknown Error',
      cobalt_error: true
    }, { status: 500, headers: corsHeaders });
  }
}
