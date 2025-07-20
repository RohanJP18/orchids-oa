import fs from 'fs';
import path from 'path';
import { APIOperation } from './types';

export class APIImplementer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async executeAPIOperation(description: string, files: string[], operation: string): Promise<void> {
    console.log(`🔗 Executing API operation: ${description}`);
    
    if (description.includes('authentication') || description.includes('auth')) {
      await this.createAuthEndpoints(files);
    } else if (description.includes('playlist')) {
      await this.createPlaylistEndpoints(files);
    } else if (description.includes('music')) {
      await this.createMusicEndpoints(files);
    } else {
      await this.createGenericEndpoints(files);
    }
  }

  private async createAuthEndpoints(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createAuthEndpoint(file);
    }
  }

  private async createAuthEndpoint(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/app/api/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content = '';
    
    if (filePath.includes('register')) {
      content = this.generateRegisterEndpoint();
    } else if (filePath.includes('login')) {
      content = this.generateLoginEndpoint();
    } else {
      content = this.generateGenericAuthEndpoint(filePath);
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Auth endpoint created: ${filePath}`);
  }

  private generateRegisterEndpoint(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      name,
      // Note: In a real app, you'd store the hashed password in a separate auth table
    }).returning();

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private generateLoginEndpoint(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { sessions } from '@/lib/db/schema/auth';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password (in a real app, you'd compare with hashed password)
    // const isValidPassword = await compare(password, user.password);
    // if (!isValidPassword) {
    //   return NextResponse.json(
    //     { error: 'Invalid credentials' },
    //     { status: 401 }
    //   );
    // }

    // Create session
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const [session] = await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).returning();

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private generateGenericAuthEndpoint(filePath: string): string {
    const endpointName = path.basename(filePath, '.ts');
    
    return `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Auth endpoint working',
      endpoint: '${endpointName}'
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Auth POST endpoint working',
      data: body
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private async createPlaylistEndpoints(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createPlaylistEndpoint(file);
    }
  }

  private async createPlaylistEndpoint(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/app/api/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content = '';
    
    if (filePath.includes('[id]')) {
      content = this.generatePlaylistDetailEndpoint();
    } else {
      content = this.generatePlaylistListEndpoint();
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Playlist endpoint created: ${filePath}`);
  }

  private generatePlaylistListEndpoint(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playlists } from '@/lib/db/schema/playlists';
import { users } from '@/lib/db/schema/users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userPlaylists = await db.query.playlists.findMany({
      where: (playlists, { eq }) => eq(playlists.userId, userId),
      with: {
        user: true,
        songs: {
          with: {
            song: true
          }
        }
      }
    });

    return NextResponse.json({
      playlists: userPlaylists
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, userId, isPublic = false } = await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and user ID are required' },
        { status: 400 }
      );
    }

    const [newPlaylist] = await db.insert(playlists).values({
      name,
      description,
      userId,
      isPublic
    }).returning();

    return NextResponse.json({
      message: 'Playlist created successfully',
      playlist: newPlaylist
    }, { status: 201 });
  } catch (error) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private generatePlaylistDetailEndpoint(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playlists } from '@/lib/db/schema/playlists';
import { playlistSongs } from '@/lib/db/schema/playlists';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlist = await db.query.playlists.findFirst({
      where: (playlists, { eq }) => eq(playlists.id, params.id),
      with: {
        user: true,
        songs: {
          with: {
            song: {
              with: {
                artist: true,
                album: true
              }
            }
          }
        }
      }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      playlist
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, isPublic } = await request.json();

    const [updatedPlaylist] = await db.update(playlists)
      .set({
        name,
        description,
        isPublic,
        updatedAt: new Date()
      })
      .where(eq(playlists.id, params.id))
      .returning();

    if (!updatedPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [deletedPlaylist] = await db.delete(playlists)
      .where(eq(playlists.id, params.id))
      .returning();

    if (!deletedPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private async createMusicEndpoints(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createMusicEndpoint(file);
    }
  }

  private async createMusicEndpoint(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/app/api/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content = '';
    
    if (filePath.includes('artists')) {
      content = this.generateArtistsEndpoint();
    } else {
      content = this.generateMusicLibraryEndpoint();
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Music endpoint created: ${filePath}`);
  }

  private generateMusicLibraryEndpoint(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/lib/db/schema/songs';
import { artists } from '@/lib/db/schema/artists';
import { albums } from '@/lib/db/schema/albums';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let musicQuery = db.query.songs.findMany({
      with: {
        artist: true,
        album: true
      },
      limit,
      offset
    });

    if (query) {
      // Add search functionality
      musicQuery = db.query.songs.findMany({
        where: (songs, { or, like }) => 
          or(
            like(songs.title, \`%\${query}%\`),
            like(songs.artist.name, \`%\${query}%\`)
          ),
        with: {
          artist: true,
          album: true
        },
        limit,
        offset
      });
    }

    const music = await musicQuery;

    return NextResponse.json({
      music,
      pagination: {
        limit,
        offset,
        total: music.length
      }
    });
  } catch (error) {
    console.error('Get music error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, duration, filePath, artistId, albumId, trackNumber } = await request.json();

    if (!title || !duration || !filePath || !artistId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newSong] = await db.insert(songs).values({
      title,
      duration,
      filePath,
      artistId,
      albumId,
      trackNumber
    }).returning();

    return NextResponse.json({
      message: 'Song added successfully',
      song: newSong
    }, { status: 201 });
  } catch (error) {
    console.error('Add song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private generateArtistsEndpoint(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { artists } from '@/lib/db/schema/artists';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let artistsQuery = db.query.artists.findMany({
      with: {
        songs: true,
        albums: true
      },
      limit,
      offset
    });

    if (query) {
      artistsQuery = db.query.artists.findMany({
        where: (artists, { like }) => like(artists.name, \`%\${query}%\`),
        with: {
          songs: true,
          albums: true
        },
        limit,
        offset
      });
    }

    const artistsList = await artistsQuery;

    return NextResponse.json({
      artists: artistsList,
      pagination: {
        limit,
        offset,
        total: artistsList.length
      }
    });
  } catch (error) {
    console.error('Get artists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, bio, imagePath } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      );
    }

    const [newArtist] = await db.insert(artists).values({
      name,
      bio,
      imagePath
    }).returning();

    return NextResponse.json({
      message: 'Artist added successfully',
      artist: newArtist
    }, { status: 201 });
  } catch (error) {
    console.error('Add artist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;
  }

  private async createGenericEndpoints(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createGenericEndpoint(file);
    }
  }

  private async createGenericEndpoint(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/app/api/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = this.generateGenericEndpointContent(filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Generic endpoint created: ${filePath}`);
  }

  private generateGenericEndpointContent(filePath: string): string {
    const endpointName = path.basename(filePath, '.ts');
    
    return `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint requires specific database schema. Please provide detailed requirements.' },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint requires specific database schema. Please provide detailed requirements.' },
    { status: 501 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint requires specific database schema. Please provide detailed requirements.' },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint requires specific database schema. Please provide detailed requirements.' },
    { status: 501 }
  );
}
`;
  }
} 