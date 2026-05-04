// ── YouTube /api/youtube/info ─────────────────────────────────────────────────
// Supports: youtube.com/watch, youtu.be, youtube.com/shorts
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  // Basic domain validation
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط YouTube صحيح.' }, { status: 422, headers: corsHeaders });
  }

  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) cleanUrl = `https://www.youtube.com/watch?v=${v}`;
    }
  } catch (e) {}

  const ytRes = await buildInfoResponse(cleanUrl, [
    '--referer', 'https://www.youtube.com/',
  ]);

  // Fallback to noembed if yt-dlp info fails
  if (!ytRes.ok) {
    try {
      const noEmbedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`);
      const noEmbedData = await noEmbedRes.json();
      if (!noEmbedData.error) {
        return NextResponse.json({
          title: noEmbedData.title || 'Unknown Title',
          thumbnail: noEmbedData.thumbnail_url || '',
          duration: 0, // noembed doesn't provide duration
        }, { headers: corsHeaders });
      }
    } catch (e) {
      console.error("[noembed fallback error]", e);
    }
  }

  return ytRes;
}
