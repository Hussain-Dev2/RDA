/**
 * Shared yt-dlp utility for all platform API routes.
 * Each platform imports this and passes its own args/format overrides.
 */
import { execFile, spawn } from 'child_process';
import { NextResponse } from 'next/server';

// ── CORS ─────────────────────────────────────────────────────────────────────
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function optionsResponse() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ── Format maps ───────────────────────────────────────────────────────────────
export type Quality = 'high' | 'medium' | 'low';

export interface FormatMap {
  mp4: Record<Quality, string>;
  mp3: Record<Quality, string>;
}

/** Default format map — platforms can override individual entries */
export const DEFAULT_FORMAT_MAP: FormatMap = {
  mp4: {
    high:   'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    medium: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
    low:    'worst[ext=mp4]/worst',
  },
  mp3: {
    high:   'bestaudio/best',
    medium: 'bestaudio[abr<=128]/bestaudio',
    low:    'bestaudio[abr<=64]/worstaudio',
  },
};

// ── Platform-specific commands ──────────────────────────────────────────────
const YT_DLP = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const FFMPEG = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

// ── Core spawn wrapper ─────────────────────────────────────────────────────
export function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // We avoid shell: true to prevent syntax errors with special chars (like parens in User-Agent)
    const process = spawn(YT_DLP, args, { 
      maxBuffer: 10 * 1024 * 1024 
    } as any);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => { stdout += data; });
    process.stderr.on('data', (data) => { stderr += data; });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
        return;
      }
      if (!stdout.trim()) {
        reject(new Error('yt-dlp returned no output'));
        return;
      }
      resolve(stdout);
    });

    process.on('error', (err: any) => {
      // Fallback for Windows if .exe is not in path but command is
      if (err.code === 'ENOENT' && process.platform === 'win32') {
        // Retry with just 'yt-dlp' in case it's a script/alias
        return resolve(runYtDlpSimple('yt-dlp', args));
      }
      reject(err);
    });
  });
}

// Simple fallback helper
function runYtDlpSimple(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let o = ''; let e = '';
    p.stdout.on('data', (d) => o += d);
    p.stderr.on('data', (d) => e += d);
    p.on('close', (c) => c === 0 ? resolve(o) : reject(new Error(e)));
    p.on('error', (err) => reject(err));
  });
}

// ── Fetch video info ──────────────────────────────────────────────────────────
export async function buildInfoResponse(
  url: string,
  extraArgs: string[] = []
): Promise<NextResponse> {
  try {
    const stdout = await runYtDlp([
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--prefer-free-formats',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--socket-timeout', '15',
      ...extraArgs,
      url,
    ]);

    const lines = stdout.trim().split('\n');
    const jsonLine = lines.find(line => line.trim().startsWith('{'));
    
    if (!jsonLine) {
      throw new Error('لم يتم العثور على بيانات صالحة (JSON) في مخرجات المحرك.');
    }

    const info = JSON.parse(jsonLine);

    return NextResponse.json(
      {
        title:     info.title     || 'Unknown Title',
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
        duration:  info.duration  || 0,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    const msg: string = err?.message || '';
    console.error('[yt-dlp info error full]', err);

    if (msg.includes('ENOENT') || msg.includes('not found')) {
      return NextResponse.json(
        { error: 'المحرك غير مثبت أو غير معرف في مسار النظام (PATH).' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    if (msg.includes('Unsupported URL') || msg.includes('Unable to extract')) {
      return NextResponse.json(
        { error: 'الرابط غير مدعوم أو لا يحتوي على فيديو.' },
        { status: 422, headers: corsHeaders }
      );
    }

    if (msg.includes('Video unavailable') || msg.includes('private video')) {
      return NextResponse.json(
        { error: 'الفيديو غير متاح حالياً (ربما خاص أو محذوف).' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: `خطأ في المحرك: ${msg.substring(0, 100)}...` }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// ── MP4 download (redirect to direct URL) ────────────────────────────────────
export async function buildMp4Response(
  url: string,
  format: string,
  extraArgs: string[] = []
): Promise<NextResponse> {
  try {
    const stdout = await runYtDlp([
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--socket-timeout', '15',
      '-f', format,
      '-g',
      ...extraArgs,
      url,
    ]);
    const directUrl = stdout.trim().split('\n')[0];
    if (!directUrl) throw new Error('Empty URL from yt-dlp');
    return NextResponse.redirect(directUrl);
  } catch (err: any) {
    console.error('[mp4 download error]', err?.message);
    return NextResponse.json(
      { error: 'فشل في معالجة رابط الفيديو.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ── MP3 download (stream through ffmpeg) ─────────────────────────────────────
export function buildMp3Response(
  url: string,
  format: string,
  bitrate: string,
  extraArgs: string[] = []
): NextResponse {
  const ytdlp = spawn(YT_DLP, [
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--socket-timeout', '15',
    '-o', '-',
    '-f', format,
    ...extraArgs,
    url,
  ]);

  const ffmpeg = spawn(FFMPEG, [
    '-i', 'pipe:0',
    '-f', 'mp3',
    '-acodec', 'libmp3lame',
    '-ab', bitrate,
    'pipe:1',
  ]);

  ytdlp.stdout.pipe(ffmpeg.stdin);
  ytdlp.stderr.on('data', (d) => console.error('[yt-dlp mp3]', d.toString()));
  ffmpeg.stderr.on('data', (d) => console.error('[ffmpeg mp3]', d.toString()));

  const stream = new ReadableStream({
    start(controller) {
      ffmpeg.stdout.on('data', (chunk) => controller.enqueue(chunk));
      ffmpeg.stdout.on('end', () => controller.close());
      ffmpeg.stdout.on('error', (err) => controller.error(err));
    },
    cancel() { ytdlp.kill(); ffmpeg.kill(); },
  });

  return new NextResponse(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="audio.mp3"',
    },
  });
}

// ── Helper: pick bitrate ──────────────────────────────────────────────────────
export function qualityToBitrate(quality: Quality): string {
  return quality === 'high' ? '320k' : quality === 'medium' ? '128k' : '64k';
}

// ── Helper: get URL param ─────────────────────────────────────────────────────
export function getParam(request: Request, key: string): string | null {
  return new URL(request.url).searchParams.get(key);
}
