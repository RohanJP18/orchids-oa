import { NextResponse } from 'next/server'
import { db } from '@/db'
import { recentlyPlayed } from '@/db/schema'

export async function GET() {
  try {
    const songs = await db.select().from(recentlyPlayed).orderBy(recentlyPlayed.playedAt)
    
    return NextResponse.json({
      success: true,
      data: songs
    })
  } catch (error) {
    console.error('Error fetching recently played songs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recently played songs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, artist, album, image, duration } = body
    
    const newSong = await db.insert(recentlyPlayed).values({
      id,
      title,
      artist,
      album,
      image,
      duration,
      playedAt: new Date()
    }).returning()
    
    return NextResponse.json({
      success: true,
      data: newSong[0]
    })
  } catch (error) {
    console.error('Error adding recently played song:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add recently played song' },
      { status: 500 }
    )
  }
} 