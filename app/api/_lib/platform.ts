/**
 * Shared yt-dlp utility for all platform API routes.
 * Each platform imports this and passes its own args/format overrides.
 */
import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Helper to handle YT_COOKIES env var and create a temp file for yt-dlp
 */
function getCookiesPath(): string | null {
  let cookiesData = (process.env.YT_COOKIES || '').trim();
  if (!cookiesData) {
    console.log("[Cookies] YT_COOKIES environment variable is missing.");
    return null;
  }

  // Check if it's Base64 encoded
  if (!cookiesData.includes('\t') && !cookiesData.includes(' ') && cookiesData.length > 50) {
    try {
      // Netscape files usually start with # Netscape (IyBOZXRzY2FwZ in base64)
      if (cookiesData.startsWith('IyB') || cookiesData.length % 4 === 0) {
        console.log("[Cookies] Detected Base64 encoding, decoding...");
        cookiesData = Buffer.from(cookiesData, 'base64').toString('utf-8');
      }
    } catch (e) {
      console.log("[Cookies] Failed to decode Base64, using raw data.");
    }
  }

  // Attempt to fix common mangling where newlines are replaced by spaces
  if (!cookiesData.includes('\n') && cookiesData.includes('.youtube.com')) {
     console.log("[Cookies] Detected potential newline mangling, attempting fix...");
     cookiesData = cookiesData.replace(/(\.youtube\.com\s+TRUE\s+\/\s+(TRUE|FALSE)\s+\d+\s+[\w-]+)/g, '\n$1');
  }

  try {
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `youtube_cookies_${Date.now()}.txt`);
    fs.writeFileSync(filePath, cookiesData.trim());
    console.log(`[Cookies] Created temp file, size: ${cookiesData.length} bytes`);
    return filePath;
  } catch (err) {
    console.error("[Cookies] Error creating temp cookies file:", err);
    return null;
  }
}

function cleanupCookies(filePath: string | null) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error deleting temp cookies file:", err);
    }
  }
}

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
const YT_DLP = 'yt-dlp';
const FFMPEG = 'ffmpeg';

// ── Core spawn wrapper ─────────────────────────────────────────────────────
export function runYtDlp(args: string[], cookiesPath?: string | null): Promise<string> {
  return new Promise((resolve, reject) => {
    const finalArgs = [...args];
    if (cookiesPath) {
      finalArgs.unshift('--cookies', cookiesPath);
    }

    // On Windows, shell: true is often needed to find commands in PATH.
    // On Linux/Docker, shell: false is safer to avoid shell syntax errors with special chars.
    const useShell = process.platform === 'win32';
    
    const child = spawn(YT_DLP, finalArgs, { 
      shell: useShell,
      maxBuffer: 10 * 1024 * 1024 
    } as any);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { 
      const str = data.toString();
      stderr += str; 
      if (str.includes('google.com/device') || str.includes('To give yt-dlp access')) {
        console.warn('\n\n🚨 [YOUTUBE OAUTH REQUIRED] 🚨\n' + str + '\n\n');
      }
    });

    child.on('close', (code) => {
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

    child.on('error', (err: any) => {
      reject(err);
    });
  });
}

// ── Fetch video info ──────────────────────────────────────────────────────────
export async function buildInfoResponse(
  url: string,
  extraArgs: string[] = []
): Promise<NextResponse> {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const cookiesPath = isYoutube ? getCookiesPath() : null;
  const authArgs = isYoutube ? ['--username', 'oauth2'] : [];

  if (process.env.YT_COOKIES) {
    console.log(`[Cookies] Data found, length: ${process.env.YT_COOKIES.length}`);
  }

  try {
    const stdout = await runYtDlp([
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--force-ipv4',
      ...authArgs,
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--extractor-args', 'youtube:player_client=web_creator',
      '--socket-timeout', '15',
      ...extraArgs,
      url,
    ], cookiesPath);

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
  extraArgs: string[] = [],
  filename?: string
): Promise<Response> {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const cookiesPath = isYoutube ? getCookiesPath() : null;
  const authArgs = isYoutube ? ['--username', 'oauth2'] : [];

  try {
    const stdout = await runYtDlp([
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--socket-timeout', '15',
      ...authArgs,
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '-f', format,
      '-g',
      ...extraArgs,
      url,
    ], cookiesPath);
    
    const directUrl = stdout.trim().split('\n')[0];
    if (!directUrl) throw new Error('Empty URL from yt-dlp');

    // Proxy the stream to set proper attachment headers
    const res = await fetch(directUrl);
    const headers = new Headers(res.headers);
    
    const safeName = filename ? filename.replace(/[^\w\s.-]/g, '') : 'video.mp4';
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`);
    headers.set('Content-Type', 'video/mp4');

    return new Response(res.body, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error('[mp4 download error]', err?.message);
    return NextResponse.json(
      { error: 'فشل في معالجة رابط الفيديو.' },
      { status: 500, headers: corsHeaders }
    ) as any;
  } finally {
    cleanupCookies(cookiesPath);
  }
}

// ── MP3 download (stream through ffmpeg) ─────────────────────────────────────
export function buildMp3Response(
  url: string,
  format: string,
  bitrate: string,
  extraArgs: string[] = []
): NextResponse {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const cookiesPath = isYoutube ? getCookiesPath() : null;
  const authArgs = isYoutube ? ['--username', 'oauth2'] : [];
  const useShell = process.platform === 'win32';

  const ytArgs = [
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--socket-timeout', '15',
    ...authArgs,
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    '-o', '-',
    '-f', format,
    ...extraArgs,
    url,
  ];

  if (cookiesPath) {
    ytArgs.unshift('--cookies', cookiesPath);
  }

  const ytdlp = spawn(YT_DLP, ytArgs, { shell: useShell });
  
  // Cleanup cookies when ytdlp ends
  ytdlp.on('close', () => cleanupCookies(cookiesPath));

  const ffmpeg = spawn(FFMPEG, [
    '-i', 'pipe:0',
    '-f', 'mp3',
    '-acodec', 'libmp3lame',
    '-ab', bitrate,
    'pipe:1',
  ], { shell: useShell });

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
