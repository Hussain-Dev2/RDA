// ── Twitch /api/twitch/info ───────────────────────────────────────────────────
// Supports: twitch.tv/videos/ID (VODs), twitch.tv/clip/slug (clips), clips.twitch.tv
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('twitch.tv') && !url.includes('clips.twitch.tv')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط Twitch صحيح. (VOD أو Clip)' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url, [
    // Twitch needs no special args for VODs/clips
  ]);
}
