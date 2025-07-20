import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userPlaylists } from '@/db/schema';

export async function GET() {
  try {
    const playlists = await db.select().from(userPlaylists).orderBy(userPlaylists.createdAt);
    return NextResponse.json({ success: true, data: playlists });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user playlists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPlaylist = await db.insert(userPlaylists).values(body).returning();
    return NextResponse.json({ success: true, data: newPlaylist[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user playlist' }, { status: 500 });
  }
}