// ── YouTube /api/youtube/download ────────────────────────────────────────────
import { buildMp4Response, buildMp3Response, qualityToBitrate, DEFAULT_FORMAT_MAP, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import type { Quality } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url     = getParam(request, 'url');
  const type    = getParam(request, 'type'); // 'mp4' or 'mp3'
  const quality = (getParam(request, 'quality') || 'high') as Quality;

  if (!url || !type) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400, headers: corsHeaders });
  }
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'رابط غير صحيح' }, { status: 422, headers: corsHeaders });
  }

  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) cleanUrl = `https://www.youtube.com/watch?v=${v}`;
    } else if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (id) cleanUrl = `https://youtu.be/${id}`;
    }
  } catch (e) {}

  console.log(`[youtube-download] url=${cleanUrl} type=${type} quality=${quality}`);

  if (type === 'mp3') {
    const fmt = DEFAULT_FORMAT_MAP.mp3[quality] || DEFAULT_FORMAT_MAP.mp3.high;
    return buildMp3Response(cleanUrl, fmt, qualityToBitrate(quality));
  }

  const fmt = DEFAULT_FORMAT_MAP.mp4[quality] || DEFAULT_FORMAT_MAP.mp4.high;
  return buildMp4Response(cleanUrl, fmt);
}
