import { SPKG_BUFFER } from '@/substreams/serverConstants';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return new NextResponse(SPKG_BUFFER, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load SPKG file' },
      { status: 500 }
    );
  }
}
