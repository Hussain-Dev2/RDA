// ── Facebook /api/facebook/info ───────────────────────────────────────────────
// Supports: facebook.com/watch, facebook.com/reel, fb.watch short links
// Note: Only works with public videos (no login required)
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط Facebook صحيح.' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url, [
    '--user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  ]);
}
