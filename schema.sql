CREATE TABLE RecentlyPlayedSongs (songId INTEGER, userId INTEGER, lastPlayedAt DATETIME, PRIMARY KEY(songId, userId));

CREATE TABLE recently_played_songs (song_id INTEGER PRIMARY KEY, song_name TEXT, artist_name TEXT, album_name TEXT, played_at DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE RecentlyPlayedSongs (songId INTEGER, userId INTEGER, playedAt DATETIME, PRIMARY KEY(songId, userId));

CREATE TABLE favorites (id INTEGER PRIMARY KEY, user_id INTEGER, song_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(song_id) REFERENCES songs(id));