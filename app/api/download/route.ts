import { NextResponse } from 'next/server';
import { spawn, execFile } from 'child_process';

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
  const type = searchParams.get('type');
  const quality = searchParams.get('quality') || 'high';

  if (!url || !type) {
    return NextResponse.json(
      { error: 'URL and type are required' },
      { status: 400, headers: corsHeaders }
    );
  }

  const formatMap = {
    mp4: {
      high: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      medium: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
      low: 'worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst[ext=mp4]/worst',
    },
    mp3: {
      high: 'bestaudio',
      medium: 'bestaudio[abr<=128]',
      low: 'worstaudio',
    },
  };

  const selectedFormat =
    formatMap[type as keyof typeof formatMap]?.[
      quality as keyof (typeof formatMap)['mp4']
    ] || formatMap.mp4.high;

  // ── MP4: resolve direct URL and redirect ────────────────────────────────────
  if (type === 'mp4') {
    try {
      const directUrl = await new Promise<string>((resolve, reject) => {
        execFile(
          'yt-dlp',
          [
            '--no-playlist',
            '--no-warnings',
            '--no-check-certificates',
            '--socket-timeout', '15',
            '-f', selectedFormat,
            '-g',       // print URL only
            url,
          ],
          { maxBuffer: 5 * 1024 * 1024 },
          (error, stdout, stderr) => {
            if (error) { reject(new Error(stderr || error.message)); return; }
            const line = stdout.trim().split('\n')[0];
            if (!line) { reject(new Error('Empty URL from yt-dlp')); return; }
            resolve(line);
          }
        );
      });

      return NextResponse.redirect(directUrl);
    } catch (error: any) {
      console.error('Download MP4 error:', error?.message);
      return NextResponse.json(
        { error: 'فشل في معالجة رابط الفيديو. حاول مرة أخرى.' },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // ── MP3: stream through ffmpeg ───────────────────────────────────────────────
  if (type === 'mp3') {
    try {
      const bitrateArg =
        quality === 'high' ? '320k' : quality === 'medium' ? '128k' : '64k';

      const ytdlp = spawn('yt-dlp', [
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--socket-timeout', '15',
        '-o', '-',
        '-f', selectedFormat,
        url,
      ]);

      const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-f', 'mp3',
        '-acodec', 'libmp3lame',
        '-ab', bitrateArg,
        'pipe:1',
      ]);

      ytdlp.stdout.pipe(ffmpeg.stdin);

      // Forward yt-dlp errors to ffmpeg so stream doesn't hang
      ytdlp.stderr.on('data', (d) => console.error('[yt-dlp]', d.toString()));
      ffmpeg.stderr.on('data', (d) => console.error('[ffmpeg]', d.toString()));

      const stream = new ReadableStream({
        start(controller) {
          ffmpeg.stdout.on('data', (chunk) => controller.enqueue(chunk));
          ffmpeg.stdout.on('end', () => controller.close());
          ffmpeg.stdout.on('error', (err) => controller.error(err));
        },
        cancel() {
          ytdlp.kill();
          ffmpeg.kill();
        },
      });

      return new NextResponse(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="audio.mp3"',
        },
      });
    } catch (error: any) {
      console.error('Download MP3 error:', error?.message);
      return NextResponse.json(
        { error: 'فشل في تحويل الصوت. حاول مرة أخرى.' },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return NextResponse.json(
    { error: 'نوع التحميل غير صحيح.' },
    { status: 400, headers: corsHeaders }
  );
}
