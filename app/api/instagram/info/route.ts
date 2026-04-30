// ── Instagram /api/instagram/info ─────────────────────────────────────────────
// Supports: instagram.com/reel/, /p/, /tv/
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('instagram.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط Instagram صحيح.' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url, [
    '--user-agent', 'Instagram 219.0.0.12.117 Android',
    '--add-header', 'Accept-Language:en-US,en;q=0.9',
  ]);
}
