import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// CORS headers shared across methods
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
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
    const command = `yt-dlp --dump-json --no-playlist --flat-playlist --no-warnings --no-check-certificates --prefer-free-formats --user-agent "${userAgent}" --referer "https://www.google.com/" "${url.replace(/"/g, '\\"')}"`;
    const { stdout, stderr } = await execAsync(command);

    if (!stdout && stderr) {
      throw new Error(stderr);
    }

    const info = JSON.parse(stdout);

    return NextResponse.json({
      title: info.title || 'Unknown Title',
      thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
      duration: info.duration || 0,
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.message?.includes('not recognized') || error.message?.includes('command not found')) {
      return NextResponse.json({ 
        error: 'Media processor (yt-dlp) not found. Please restart your terminal or ensure it is installed.' 
      }, { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    return NextResponse.json(
      { error: 'Could not fetch info for this URL.' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
