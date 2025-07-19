import { NextResponse } from 'next/server'
import { db } from '@/db'
import { madeForYou } from '@/db/schema'

export async function GET() {
  try {
    const playlists = await db.select().from(madeForYou).orderBy(madeForYou.title)
    
    return NextResponse.json({
      success: true,
      data: playlists
    })
  } catch (error) {
    console.error('Error fetching made for you playlists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch made for you playlists' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, artist, album, image, duration, description, category } = body
    
    const newPlaylist = await db.insert(madeForYou).values({
      id,
      title,
      artist,
      album,
      image,
      duration,
      description,
      category: category || 'playlist'
    }).returning()
    
    return NextResponse.json({
      success: true,
      data: newPlaylist[0]
    })
  } catch (error) {
    console.error('Error adding made for you playlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add made for you playlist' },
      { status: 500 }
    )
  }
} 