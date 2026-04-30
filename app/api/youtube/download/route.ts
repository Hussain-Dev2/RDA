// ── YouTube /api/youtube/download ────────────────────────────────────────────
import { optionsResponse, corsHeaders, DEFAULT_FORMAT_MAP, buildMp4Response, buildMp3Response, qualityToBitrate, getParam, Quality } from '../../_lib/platform';
import { NextResponse } from 'next/server';

// YouTube-specific: prefer mp4+m4a merge for best compat
const FORMAT_MAP = {
  ...DEFAULT_FORMAT_MAP,
  mp4: {
    high:   'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    medium: 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
    low:    'bestvideo[ext=mp4][height<=360]+bestaudio[ext=m4a]/worst[ext=mp4]/worst',
  },
};

const EXTRA = [
  '--referer', 'https://www.youtube.com/',
];

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request: Request) {
  const url     = getParam(request, 'url');
  const type    = getParam(request, 'type');
  const quality = (getParam(request, 'quality') || 'high') as Quality;

  if (!url || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'رابط غير صحيح' }, { status: 422 });
  }

  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) cleanUrl = `https://www.youtube.com/watch?v=${v}`;
    }
  } catch (e) {}

  if (type === 'mp4') return buildMp4Response(cleanUrl, FORMAT_MAP.mp4[quality], EXTRA);
  if (type === 'mp3') return buildMp3Response(cleanUrl, FORMAT_MAP.mp3[quality], qualityToBitrate(quality), EXTRA);

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
