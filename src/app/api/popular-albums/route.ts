import { NextResponse } from 'next/server'
import { db } from '@/db'
import { popularAlbums } from '@/db/schema'

export async function GET() {
  try {
    const albums = await db.select().from(popularAlbums).orderBy(popularAlbums.title)
    
    return NextResponse.json({
      success: true,
      data: albums
    })
  } catch (error) {
    console.error('Error fetching popular albums:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popular albums' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, artist, album, image, duration, releaseYear, genre } = body
    
    const newAlbum = await db.insert(popularAlbums).values({
      id,
      title,
      artist,
      album,
      image,
      duration,
      releaseYear,
      genre
    }).returning()
    
    return NextResponse.json({
      success: true,
      data: newAlbum[0]
    })
  } catch (error) {
    console.error('Error adding popular album:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add popular album' },
      { status: 500 }
    )
  }
} 