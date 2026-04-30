// ── Facebook /api/facebook/download ──────────────────────────────────────────
import { optionsResponse, corsHeaders, buildMp4Response, buildMp3Response, qualityToBitrate, getParam, Quality } from '../../_lib/platform';
import { NextResponse } from 'next/server';

const EXTRA = ['--user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'];

const FORMAT_MAP = {
  mp4: {
    high:   'best[ext=mp4]/best',
    medium: 'best[height<=720][ext=mp4]/best[height<=720]/best',
    low:    'worst[ext=mp4]/worst',
  },
  mp3: {
    high:   'bestaudio/best',
    medium: 'bestaudio[abr<=128]/bestaudio',
    low:    'bestaudio[abr<=64]/worstaudio',
  },
};

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url     = getParam(request, 'url');
  const type    = getParam(request, 'type');
  const quality = (getParam(request, 'quality') || 'high') as Quality;

  if (!url || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400, headers: corsHeaders });
  if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.com')) {
    return NextResponse.json({ error: 'رابط غير صحيح' }, { status: 422, headers: corsHeaders });
  }

  if (type === 'mp4') return buildMp4Response(url, FORMAT_MAP.mp4[quality], EXTRA);
  if (type === 'mp3') return buildMp3Response(url, FORMAT_MAP.mp3[quality], qualityToBitrate(quality), EXTRA);

  return NextResponse.json({ error: 'Invalid type' }, { status: 400, headers: corsHeaders });
}
