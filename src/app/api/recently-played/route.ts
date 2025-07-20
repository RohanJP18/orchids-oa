import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recentlyPlayedSongs } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Retrieve recently played songs for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const songs = await db
      .select()
      .from(recentlyPlayedSongs)
      .where(eq(recentlyPlayedSongs.userId, userId))
      .orderBy(desc(recentlyPlayedSongs.playedAt))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: songs,
      count: songs.length
    });

  } catch (error) {
    console.error('Error fetching recently played songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recently played songs' },
      { status: 500 }
    );
  }
}

// POST - Add a new recently played song
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, songId, songTitle, artistName, albumName, duration } = body;

    // Validate required fields
    if (!userId || !songId || !songTitle || !artistName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, songId, songTitle, artistName' },
        { status: 400 }
      );
    }

    // Insert the recently played song
    const [newSong] = await db
      .insert(recentlyPlayedSongs)
      .values({
        userId,
        songId,
        songTitle,
        artistName,
        albumName,
        duration,
        playedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newSong,
      message: 'Recently played song added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding recently played song:', error);
    return NextResponse.json(
      { error: 'Failed to add recently played song' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a recently played song
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Both id and userId are required' },
        { status: 400 }
      );
    }

    // Delete the specific song for the user
    const [deletedSong] = await db
      .delete(recentlyPlayedSongs)
      .where(
        and(
          eq(recentlyPlayedSongs.id, id),
          eq(recentlyPlayedSongs.userId, userId)
        )
      )
      .returning();

    if (!deletedSong) {
      return NextResponse.json(
        { error: 'Recently played song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recently played song removed successfully'
    });

  } catch (error) {
    console.error('Error removing recently played song:', error);
    return NextResponse.json(
      { error: 'Failed to remove recently played song' },
      { status: 500 }
    );
  }
} 