import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Run yt-dlp to get JSON dump
    // simulate a real browser to bypass YouTube's bot detection
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Check if the error is due to yt-dlp not being found
    if (error.message?.includes('not recognized') || error.message?.includes('command not found')) {
      return NextResponse.json({ 
        error: 'Media processor (yt-dlp) not found. Please restart your terminal or ensure it is installed.' 
      }, { status: 500 });
    }

    return NextResponse.json({ error: 'Could not fetch info for this URL.' }, { status: 500 });
  }
}
