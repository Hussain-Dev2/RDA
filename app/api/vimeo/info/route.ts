// ── Vimeo /api/vimeo/info ─────────────────────────────────────────────────────
// Supports: vimeo.com/ID, vimeo.com/channels/ID, password-protected (public only)
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('vimeo.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط Vimeo صحيح.' }, { status: 422, headers: corsHeaders });
  }

  // Vimeo works well with default args; referer helps with some embedded videos
  return buildInfoResponse(url, ['--referer', 'https://vimeo.com/']);
}
