import { pgTable, uuid, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

// Recently played songs table
export const recentlyPlayedSongs = pgTable('recently_played_songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  songId: uuid('song_id').notNull(),
  songTitle: varchar('song_title', { length: 255 }).notNull(),
  artistName: varchar('artist_name', { length: 255 }).notNull(),
  albumName: varchar('album_name', { length: 255 }),
  duration: integer('duration'), // in seconds
  playedAt: timestamp('played_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users table (if not exists)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Songs table (if not exists)
export const songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  album: varchar('album', { length: 255 }),
  duration: integer('duration').notNull(), // in seconds
  trackNumber: integer('track_number'),
  genre: varchar('genre', { length: 100 }),
  releaseYear: integer('release_year'),
  audioUrl: text('audio_url'),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type RecentlyPlayedSong = typeof recentlyPlayedSongs.$inferSelect;
export type NewRecentlyPlayedSong = typeof recentlyPlayedSongs.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert; 