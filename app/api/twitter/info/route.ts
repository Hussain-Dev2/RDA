// ── Twitter/X /api/twitter/info ───────────────────────────────────────────────
// Supports: x.com/user/status/ID, twitter.com/user/status/ID
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('x.com') && !url.includes('twitter.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط Twitter / X صحيح.' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url, [
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  ]);
}
