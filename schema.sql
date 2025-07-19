CREATE TABLE RecentlyPlayedSongs (songId INTEGER, userId INTEGER, lastPlayedAt DATETIME, PRIMARY KEY(songId, userId));

CREATE TABLE recently_played_songs (song_id INTEGER PRIMARY KEY, song_name TEXT, artist_name TEXT, album_name TEXT, played_at DATETIME DEFAULT CURRENT_TIMESTAMP);