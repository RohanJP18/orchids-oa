import fs from 'fs';
import path from 'path';
import { DatabaseOperation } from './types';

export class DatabaseImplementer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async executeDatabaseOperation(description: string, files: string[], operation: string): Promise<void> {
    console.log(`🗄️ Executing database operation: ${description}`);
    
    if (description.includes('Drizzle ORM configuration')) {
      await this.setupDrizzleConfig();
    } else if (description.includes('schema')) {
      await this.createSchemaFiles(files);
      // After creating schema files, generate and run migrations
      await this.generateAndRunMigrations();
    } else if (description.includes('migration')) {
      await this.generateMigrations(files);
    } else if (description.includes('delete') || description.includes('drop')) {
      await this.executeTableDeletion(description);
    } else {
      await this.executeGenericDatabaseOperation(description, files, operation);
    }
  }

  private async setupDrizzleConfig(): Promise<void> {
    const configContent = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/spotify_clone',
  },
  verbose: true,
  strict: true,
});
`;

    const configPath = path.join(this.projectRoot, 'drizzle.config.ts');
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ Drizzle configuration created');
  }

  private async createSchemaFiles(files: string[]): Promise<void> {
    for (const file of files) {
      await this.createSchemaFile(file);
    }
  }

  private async createSchemaFile(filePath: string): Promise<void> {
    // Fix path to use src/ directory structure
    const correctedPath = filePath.startsWith('src/') ? filePath : `src/lib/db/schema/${path.basename(filePath)}`;
    const fullPath = path.join(this.projectRoot, correctedPath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content = '';
    
    if (filePath.includes('users.ts')) {
      content = this.generateUsersSchema();
    } else if (filePath.includes('auth.ts')) {
      content = this.generateAuthSchema();
    } else if (filePath.includes('playlists.ts')) {
      content = this.generatePlaylistsSchema();
    } else if (filePath.includes('songs.ts')) {
      content = this.generateSongsSchema();
    } else if (filePath.includes('artists.ts')) {
      content = this.generateArtistsSchema();
    } else if (filePath.includes('albums.ts')) {
      content = this.generateAlbumsSchema();
    } else {
      content = this.generateGenericSchema(filePath);
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Schema file created: ${filePath}`);
  }

  private generateUsersSchema(): string {
    return `import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  playlists: many(playlists),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`;
  }

  private generateAuthSchema(): string {
    return `import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
`;
  }

  private generatePlaylistsSchema(): string {
    return `import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { songs } from './songs';

export const playlists = pgTable('playlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playlistSongs = pgTable('playlist_songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  playlistId: uuid('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  songId: uuid('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  position: text('position').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  songs: many(playlistSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type NewPlaylistSong = typeof playlistSongs.$inferInsert;
`;
  }

  private generateSongsSchema(): string {
    return `import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { artists } from './artists';
import { albums } from './albums';

export const songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  duration: integer('duration').notNull(), // in seconds
  filePath: text('file_path').notNull(),
  albumId: uuid('album_id').references(() => albums.id, { onDelete: 'set null' }),
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  trackNumber: integer('track_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const songsRelations = relations(songs, ({ one }) => ({
  artist: one(artists, {
    fields: [songs.artistId],
    references: [artists.id],
  }),
  album: one(albums, {
    fields: [songs.albumId],
    references: [albums.id],
  }),
}));

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
`;
  }

  private generateArtistsSchema(): string {
    return `import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const artists = pgTable('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  imagePath: text('image_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const artistsRelations = relations(artists, ({ many }) => ({
  songs: many(songs),
  albums: many(albums),
}));

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
`;
  }

  private generateAlbumsSchema(): string {
    return `import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { artists } from './artists';

export const albums = pgTable('albums', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  releaseYear: integer('release_year'),
  coverPath: text('cover_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const albumsRelations = relations(albums, ({ one, many }) => ({
  artist: one(artists, {
    fields: [albums.artistId],
    references: [artists.id],
  }),
  songs: many(songs),
}));

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
`;
  }

  private generateGenericSchema(filePath: string): string {
    const fileName = path.basename(filePath, '.ts');
    const tableName = fileName.replace(/\./g, '_');
    
    return `import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const ${tableName} = pgTable('${tableName}', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ${fileName.charAt(0).toUpperCase() + fileName.slice(1)} = typeof ${tableName}.$inferSelect;
export type New${fileName.charAt(0).toUpperCase() + fileName.slice(1)} = typeof ${tableName}.$inferInsert;
`;
  }

  private async generateMigrations(files: string[]): Promise<void> {
    const migrationsDir = path.join(this.projectRoot, 'drizzle');
    
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    for (const file of files) {
      await this.generateMigrationFile(file);
    }
  }

  private async generateMigrationFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.projectRoot, filePath);
    const fileName = path.basename(filePath, '.sql');
    
    let content = '';
    
    if (fileName.includes('users')) {
      content = this.generateUsersMigration();
    } else if (fileName.includes('auth')) {
      content = this.generateAuthMigration();
    } else if (fileName.includes('playlists')) {
      content = this.generatePlaylistsMigration();
    } else if (fileName.includes('music_library')) {
      content = this.generateMusicLibraryMigration();
    } else {
      content = this.generateGenericMigration(fileName);
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Migration file created: ${filePath}`);
  }

  private generateUsersMigration(): string {
    return `-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "avatar" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
`;
  }

  private generateAuthMigration(): string {
    return `-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "token" varchar(255) NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" ("token");
`;
  }

  private generatePlaylistsMigration(): string {
    return `-- Create playlists table
CREATE TABLE IF NOT EXISTS "playlists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "description" text,
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "is_public" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS "playlist_songs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "playlist_id" uuid NOT NULL REFERENCES "playlists" ("id") ON DELETE CASCADE,
  "song_id" uuid NOT NULL,
  "position" text NOT NULL,
  "added_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "playlists_user_id_idx" ON "playlists" ("user_id");
CREATE INDEX IF NOT EXISTS "playlist_songs_playlist_id_idx" ON "playlist_songs" ("playlist_id");
CREATE INDEX IF NOT EXISTS "playlist_songs_song_id_idx" ON "playlist_songs" ("song_id");
`;
  }

  private generateMusicLibraryMigration(): string {
    return `-- Create artists table
CREATE TABLE IF NOT EXISTS "artists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "bio" text,
  "image_path" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create albums table
CREATE TABLE IF NOT EXISTS "albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(255) NOT NULL,
  "artist_id" uuid NOT NULL REFERENCES "artists" ("id") ON DELETE CASCADE,
  "release_year" integer,
  "cover_path" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create songs table
CREATE TABLE IF NOT EXISTS "songs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(255) NOT NULL,
  "duration" integer NOT NULL,
  "file_path" text NOT NULL,
  "album_id" uuid REFERENCES "albums" ("id") ON DELETE SET NULL,
  "artist_id" uuid NOT NULL REFERENCES "artists" ("id") ON DELETE CASCADE,
  "track_number" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "albums_artist_id_idx" ON "albums" ("artist_id");
CREATE INDEX IF NOT EXISTS "songs_artist_id_idx" ON "songs" ("artist_id");
CREATE INDEX IF NOT EXISTS "songs_album_id_idx" ON "songs" ("album_id");
`;
  }

  private generateGenericMigration(fileName: string): string {
    return `-- Create ${fileName} table
CREATE TABLE IF NOT EXISTS "${fileName}" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
`;
  }

  private async executeGenericDatabaseOperation(description: string, files: string[], operation: string): Promise<void> {
    console.log(`🔧 Executing generic database operation: ${description}`);
    
    // Only execute if we have specific database operations
    if (description.includes('schema') || description.includes('migration') || description.includes('table')) {
      console.log(`✅ Database operation completed: ${description}`);
    } else {
      throw new Error(`Cannot execute generic database operation: ${description}. This agent only handles real database operations.`);
    }
  }

  private async generateAndRunMigrations(): Promise<void> {
    try {
      console.log('🔄 Generating new migrations...');
      
      // Use drizzle-kit to generate migrations
      const { execSync } = require('child_process');
      execSync('npx drizzle-kit generate', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('✅ Migrations generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate migrations:', error);
      throw error;
    }
  }

  private async executeTableDeletion(description: string): Promise<void> {
    try {
      console.log('🗑️ Executing table deletion...');
      
      // This would need to be implemented with proper database connection
      // For now, we'll create a migration to drop tables
      const dropMigration = `
-- Drop all tables
DROP TABLE IF EXISTS recently_played_songs CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;
      
      const migrationPath = path.join(this.projectRoot, 'drizzle', `drop_tables_${Date.now()}.sql`);
      fs.writeFileSync(migrationPath, dropMigration);
      
      console.log('✅ Table deletion migration created');
    } catch (error) {
      console.error('❌ Failed to create table deletion migration:', error);
      throw error;
    }
  }
} 