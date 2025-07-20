import { NextResponse } from 'next/server';
import { db } from '@/db';
import { searches } from '@/db/schema';

export async function GET() {
  try {
    const searchResults = await db.select().from(searches).orderBy(searches.searchedAt);
    return NextResponse.json({ success: true, data: searchResults });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch search results' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSearch = await db.insert(searches).values(body).returning();
    return NextResponse.json({ success: true, data: newSearch[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add search result' }, { status: 500 });
  }
}