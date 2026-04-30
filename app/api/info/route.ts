import { NextResponse } from 'next/server';
import { execFile } from 'child_process';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      // Use execFile with args array — no shell injection, handles & and = safely
      execFile(
        'yt-dlp',
        [
          '--dump-json',
          '--no-playlist',      // Take only the first video, ignore playlist
          '--no-warnings',
          '--no-check-certificates',
          '--socket-timeout', '15',
          url,
        ],
        { maxBuffer: 10 * 1024 * 1024 }, // 10MB buffer
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
            return;
          }
          if (!stdout.trim()) {
            reject(new Error('No output from yt-dlp'));
            return;
          }
          resolve(stdout);
        }
      );
    });

    // yt-dlp may output multiple JSON lines (e.g., for playlists) — take only the first
    const firstLine = stdout.trim().split('\n')[0];
    const info = JSON.parse(firstLine);

    return NextResponse.json(
      {
        title: info.title || 'Unknown Title',
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
        duration: info.duration || 0,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('API /info Error:', error?.message || error);

    const msg: string = error?.message || '';

    if (
      msg.includes('not recognized') ||
      msg.includes('command not found') ||
      msg.includes('No such file')
    ) {
      return NextResponse.json(
        { error: 'yt-dlp غير مثبت على السيرفر. يرجى التواصل مع الدعم.' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (msg.includes('Unsupported URL') || msg.includes('no video')) {
      return NextResponse.json(
        { error: 'الرابط غير مدعوم أو لا يحتوي على فيديو.' },
        { status: 422, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب معلومات الفيديو. تحقق من الرابط وحاول مرة أخرى.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
