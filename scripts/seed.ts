In seed.ts: const songs = [{ title: 'Song 1', artist: 'Artist 1', album: 'Album 1', duration: 180 }, ...]; const playlists = [{ name: 'Playlist 1', songs: [1, 2, 3] }, ...]; const albums = [{ name: 'Album 1', artist: 'Artist 1', songs: [1, 2, 3] }, ...]; await Song.create(songs); await Playlist.create(playlists); await Album.create(albums);

migrate.ts: 
// use Drizzle ORM's migration methods to migrate data

seed.ts: 
// use Drizzle ORM's seeding methods to seed data