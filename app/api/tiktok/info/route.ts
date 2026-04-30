// ── TikTok /api/tiktok/info ───────────────────────────────────────────────────
// Supports: tiktok.com/@user/video/ID, vm.tiktok.com/ID
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('tiktok.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط TikTok صحيح.' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url, [
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    '--referer', 'https://www.tiktok.com/',
  ]);
}
