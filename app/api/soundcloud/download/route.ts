// ── SoundCloud /api/soundcloud/download ──────────────────────────────────────
import { optionsResponse, corsHeaders, DEFAULT_FORMAT_MAP, buildMp4Response, buildMp3Response, qualityToBitrate, getParam, Quality } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url     = getParam(request, 'url');
  const type    = getParam(request, 'type');
  const quality = (getParam(request, 'quality') || 'high') as Quality;

  if (!url || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400, headers: corsHeaders });
  if (!url.includes('soundcloud.com')) {
    return NextResponse.json({ error: 'رابط غير صحيح' }, { status: 422, headers: corsHeaders });
  }

  // SoundCloud is primarily audio.
  if (type === 'mp4') return buildMp4Response(url, DEFAULT_FORMAT_MAP.mp4[quality]);
  if (type === 'mp3') return buildMp3Response(url, DEFAULT_FORMAT_MAP.mp3[quality], qualityToBitrate(quality));

  return NextResponse.json({ error: 'Invalid type' }, { status: 400, headers: corsHeaders });
}
