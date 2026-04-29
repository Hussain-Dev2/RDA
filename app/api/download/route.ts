import { NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    return NextResponse.json({ error: 'URL and type are required' }, { status: 400 }, { headers: corsHeaders });
  }

  const safeUrl = url.replace(/"/g, '\\"');

  const formatMap = {
    mp4: {
      high: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      medium: "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best",
      low: "worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst[ext=mp4]/worst"
    },
    mp3: {
      high: "bestaudio",
      medium: "bestaudio[abr<=128]",
      low: "worstaudio"
    }
  };

  const selectedFormat = formatMap[type as keyof typeof formatMap]?.[quality as keyof (typeof formatMap)['mp4']] || formatMap.mp4.high;

  if (type === 'mp4') {
    try {
      const { stdout } = await execAsync(`yt-dlp -f "${selectedFormat}" -g "${safeUrl}"`);
      const directUrl = stdout.trim().split('\n')[0];

      if (!directUrl) return NextResponse.json({ error: 'Format not available' }, { status: 404 }, { headers: corsHeaders });
      return NextResponse.redirect(directUrl);
    } catch (error) {
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 }, { headers: corsHeaders });
    }
  } else if (type === 'mp3') {
    try {
      const ytdlp = spawn('yt-dlp', ['-o', '-', '-f', selectedFormat, url]);
      const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-f', 'mp3', '-acodec', 'libmp3lame', '-ab', quality === 'high' ? '320k' : quality === 'medium' ? '128k' : '64k', 'pipe:1']);

      ytdlp.stdout.pipe(ffmpeg.stdin);

      const stream = new ReadableStream({
        start(controller) {
          ffmpeg.stdout.on('data', (chunk) => controller.enqueue(chunk));
          ffmpeg.stdout.on('end', () => controller.close());
          ffmpeg.stdout.on('error', (err) => controller.error(err));
        },
        cancel() {
          ytdlp.kill();
          ffmpeg.kill();
        }
      });

      return new NextResponse(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="audio.mp3"`,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Conversion failed' }, { status: 500 }, { headers: corsHeaders });
    }
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 }, { headers: corsHeaders });
}
