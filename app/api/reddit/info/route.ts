// ── Reddit /api/reddit/info ───────────────────────────────────────────────────
// Supports: reddit.com/r/subreddit/comments/ID/title/
import { buildInfoResponse, optionsResponse, getParam, corsHeaders } from '../../_lib/platform';
import { NextResponse } from 'next/server';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url = getParam(request, 'url');
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });

  if (!url.includes('reddit.com')) {
    return NextResponse.json({ error: 'يرجى إدخال رابط Reddit صحيح.' }, { status: 422, headers: corsHeaders });
  }

  return buildInfoResponse(url);
}
