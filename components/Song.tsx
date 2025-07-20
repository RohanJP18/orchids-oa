Playlist.tsx: 
// use fetch or axios to get data from /api/playlists

Song.tsx: 
// use fetch or axios to get data from /api/songs

fetch('/api/favorites').then(res => res.json()).then(data => setFavorites(data)); //... implement POST and DELETE requests