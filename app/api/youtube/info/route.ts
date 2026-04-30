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

  return buildInfoResponse(url, [
    '--extractor-args', 'youtube:player_client=android',  // more reliable extraction
  ]);
}
