const hardcodedSongs = [...]; hardcodedSongs.forEach(song => { db.query('INSERT INTO RecentlyPlayedSongs (songId, userId, lastPlayedAt) VALUES (?, ?, ?)', [song.id, song.userId, new Date()]); });

hardcodedData.forEach(song => { fetch('/api/recentlyPlayed', { method: 'POST', body: JSON.stringify({ songId: song.id, userId: hardcodedUser.id }) }); });