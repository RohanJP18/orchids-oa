In songs.ts: export default async function handler(req, res) { const songs = await Song.all(); res.json(songs); }
In playlists.ts: export default async function handler(req, res) { const playlists = await Playlist.all(); res.json(playlists); }
In albums.ts: export default async function handler(req, res) { const albums = await Album.all(); res.json(albums); }

playlists.ts: 
export default async function handler(req, res) {
  // handle different HTTP methods
}

songs.ts: 
export default async function handler(req, res) {
  // handle different HTTP methods
}