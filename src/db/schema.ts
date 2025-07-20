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



export const userPlaylists = sqliteTable('user_playlists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const searches = sqliteTable('searches', {
  id: text('id').primaryKey(),
  query: text('query').notNull(),
  results: integer('results').notNull(),
  searchedAt: integer('searched_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});