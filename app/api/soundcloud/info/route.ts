// ── SoundCloud /api/soundcloud/info ───────────────────────────────────────────
// Supports: soundcloud.com/artist/track
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('soundcloud.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط SoundCloud صحيح.' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url);
}
