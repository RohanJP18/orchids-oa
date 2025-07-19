import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const recentlyPlayed = sqliteTable('recently_played', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const madeForYou = sqliteTable('made_for_you', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  description: text('description'),
  category: text('category').notNull().default('playlist'),
})

export const popularAlbums = sqliteTable('popular_albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  releaseYear: integer('release_year'),
  genre: text('genre'),
}) 

